import json
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

def calculate_completeness_score(form_data: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluates complaint completeness against GAMP / FDA QMS requirements"""
    mandatory_fields = [
        ("product_name", "Product Name", 15),
        ("batch_number", "Batch / Lot Number", 15),
        ("defect_description", "Defect Description", 20),
        ("customer_name", "Customer / Reporter Name", 10),
        ("customer_email", "Customer Contact Email", 10),
        ("mfg_date", "Manufacturing Date", 10),
        ("expiry_date", "Expiry Date", 10),
        ("storage_conditions", "Storage Conditions", 10),
    ]

    total_weight = 100
    current_score = 0
    missing_fields = []

    for key, label, weight in mandatory_fields:
        val = form_data.get(key)
        if val and str(val).strip() and str(val).strip().lower() not in ["null", "none", "unknown", "false"]:
            current_score += weight
        else:
            missing_fields.append({
                "field_key": key,
                "field_name": label,
                "weight": weight,
                "impact": "Mandatory for Regulatory Investigation" if weight >= 15 else "Recommended GMP Detail"
            })

    completeness_percentage = round(min(100.0, max(0.0, current_score)), 1)

    status_label = "Complete" if completeness_percentage >= 90 else ("Satisfactory" if completeness_percentage >= 70 else "Incomplete - Action Required")

    return {
        "score_percentage": completeness_percentage,
        "status_label": status_label,
        "missing_fields": missing_fields,
        "is_ready_for_investigation": completeness_percentage >= 75
    }

def analyze_risk_and_summary(form_data: Dict[str, Any], groq_api_key: str = None) -> Dict[str, Any]:
    api_key = groq_api_key or settings.GROQ_API_KEY
    completeness = calculate_completeness_score(form_data)

    if api_key:
        try:
            llm = ChatGroq(
                groq_api_key=api_key,
                model_name=settings.COMPLEX_MODEL, # llama-3.3-70b-versatile
                temperature=0.1
            )
            prompt = f"Analyze Pharma QMS Risk & Executive Summary for complaint:\n{json.dumps(form_data, indent=2)}"
            system_p = """
            You are a Senior Regulatory Quality Executive at a global pharma manufacturer.
            Evaluate the provided complaint and return JSON with:
            {
               "severity_level": "Critical" | "Major" | "Minor",
               "regulatory_reportable": true | false,
               "regulatory_body": "FDA (15-Day FAR) / EMA / CDSCO",
               "patient_health_risk": "High" | "Medium" | "Low",
               "risk_justification": "Detailed regulatory justification based on ICH Q9 risk management.",
               "executive_summary": "Professional audit-ready summary of the complaint, product impact, and proposed resolution."
            }
            Return ONLY valid JSON.
            """
            response = llm.invoke([
                SystemMessage(content=system_p),
                HumanMessage(content=prompt)
            ])
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            result = json.loads(content)
            result["completeness"] = completeness
            return result
        except Exception as e:
            print(f"Groq Risk Analyzer error, using rule-based fallback: {e}")
            res = rule_based_risk_fallback(form_data)
            res["completeness"] = completeness
            return res
    else:
        res = rule_based_risk_fallback(form_data)
        res["completeness"] = completeness
        return res

def rule_based_risk_fallback(form_data: Dict[str, Any]) -> Dict[str, Any]:
    desc = str(form_data.get("defect_description", "")).lower()
    product_type = form_data.get("product_type", "FDF")
    defect = str(form_data.get("defect_type", "")).lower()

    if any(k in desc or k in defect for k in ["impurity", "oos", "out of spec", "contamination", "particulate", "adverse event", "subpotent"]):
        severity = "Critical"
        reportable = True
        risk_level = "High"
        justification = "Critical quality defect impacting drug purity/potency or patient safety. Triggers mandatory 21 CFR 314.81 (b)(1) FDA Field Alert Report (FAR) within 15 days."
    elif any(k in desc or k in defect for k in ["seal", "packaging", "label", "leak", "discoloration"]):
        severity = "Major"
        reportable = False
        risk_level = "Medium"
        justification = "Major physical/packaging non-conformance. Does not pose immediate systemic health hazard but requires full QMS CAPA investigation."
    else:
        severity = "Minor"
        reportable = False
        risk_level = "Low"
        justification = "Minor cosmetic or non-critical labeling variance with zero impact on product safety, identity, or purity."

    prod = form_data.get("product_name", "Pharma Product")
    batch = form_data.get("batch_number", "Unknown Batch")

    summary = (
        f"A customer quality complaint was logged for {prod} (Batch #{batch}, Type: {product_type}). "
        f"Defect categorized as {form_data.get('defect_category', 'Quality Variance')} with severity classified as {severity}. "
        f"Current risk evaluation designates health hazard risk as {risk_level}. Regulatory reportability status: {'REPORTABLE TO FDA/REGULATORY AUTHORITIES (15-DAY NOTICE)' if reportable else 'Internal QMS Investigation Only'}. "
        f"Investigation has been initiated with full audit trail logging."
    )

    return {
        "severity_level": severity,
        "regulatory_reportable": reportable,
        "regulatory_body": "FDA 21 CFR 314.81 / EMA Annex 16" if reportable else "Internal QMS",
        "patient_health_risk": risk_level,
        "risk_justification": justification,
        "executive_summary": summary
    }
