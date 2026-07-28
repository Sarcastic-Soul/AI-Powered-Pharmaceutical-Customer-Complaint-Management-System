from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def find_duplicate_complaints(current_form: Dict[str, Any], database_complaints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Scans historical DB complaints and calculates similarity score.
    Returns list of matching duplicate complaints with confidence score and root cause insights.
    """
    if not database_complaints:
        return []

    results = []

    curr_batch = (current_form.get("batch_number") or "").strip().upper()
    curr_product = (current_form.get("product_name") or "").strip().lower()
    curr_desc = (current_form.get("defect_description") or "").strip().lower()

    # Prepare corpus for TF-IDF
    corpus = [curr_desc] + [c.get("defect_description", "").strip().lower() for c in database_complaints]

    tfidf_sims = [0.0] * len(database_complaints)
    try:
        if any(len(text) > 5 for text in corpus):
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
            tfidf_sims = list(sim_scores)
    except Exception as e:
        print(f"TF-IDF similarity calculation error: {e}")

    for idx, past_cmp in enumerate(database_complaints):
        match_reasons = []
        score = 0.0

        past_batch = (past_cmp.get("batch_number") or "").strip().upper()
        past_product = (past_cmp.get("product_name") or "").strip().lower()

        # Batch match
        if curr_batch and past_batch and curr_batch == past_batch:
            score += 0.55
            match_reasons.append("Exact Batch Number Match (Same Lot Defect)")

        # Product match
        if curr_product and past_product and (curr_product in past_product or past_product in curr_product):
            score += 0.20
            match_reasons.append("Same Pharmaceutical Product")

        # Description similarity
        sim_val = tfidf_sims[idx] if idx < len(tfidf_sims) else 0.0
        score += float(sim_val) * 0.25

        if sim_val > 0.4:
            match_reasons.append(f"High Textual Similarity ({int(sim_val*100)}%)")

        confidence_pct = round(min(100.0, score * 100.0), 1)

        if confidence_pct >= 40.0:
            results.append({
                "id": past_cmp.get("id"),
                "complaint_number": past_cmp.get("complaint_number", f"CMP-HIST-{idx+100}"),
                "batch_number": past_cmp.get("batch_number"),
                "product_name": past_cmp.get("product_name"),
                "defect_type": past_cmp.get("defect_type"),
                "severity_level": past_cmp.get("severity_level"),
                "status": past_cmp.get("investigation_status", "Closed"),
                "confidence_score": confidence_pct,
                "match_reasons": match_reasons,
                "historical_root_cause": past_cmp.get("summary_text") or past_cmp.get("defect_description", "")[:150] + "..."
            })

    # Sort by confidence score descending
    results.sort(key=lambda x: x["confidence_score"], reverse=True)
    return results[:5]
