import json
import re
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

EXTRACTION_SYSTEM_PROMPT = """
You are an expert Pharmaceutical Quality Assurance (QA) Compliance AI Specialist.
Your job is to analyze unstructured customer complaint text, emails, incident reports, or lab logs and extract EXACT structured fields for a Quality Management System (QMS) complaint registration form.

Target JSON Format (Return ONLY valid JSON, no markdown wrappers, no commentary):
{
  "customer_name": "Name of hospital, pharmacy, distributor, or client (or null/empty if missing)",
  "customer_email": "Email address (or null/empty if missing)",
  "company_site": "Manufacturing plant or unit if mentioned (or null/empty if missing)",
  "product_name": "Exact pharmaceutical drug name (or null/empty if missing)",
  "product_type": "API" or "FDF" (API = Active Pharmaceutical Ingredient, FDF = Finished Dosage Form),
  "dosage_form": "Tablet", "Capsule", "Injection", "Oral Suspension", "Bulk Powder", etc. (or null/empty if missing),
  "batch_number": "Lot or Batch Number (or null/empty if missing)",
  "mfg_date": "YYYY-MM or YYYY-MM-DD (or null/empty if missing)",
  "expiry_date": "YYYY-MM or YYYY-MM-DD (or null/empty if missing)",
  "defect_type": "Quality Defect", "Packaging & Seal", "Impurity / OOS", "Labeling", "Physical Defect", "Adverse Event", "Contamination",
  "defect_category": "Short summary category e.g., High Related Substances, Broken Seal, Particulate Matter",
  "defect_description": "Detailed summary of the complaint defect report",
  "storage_conditions": "2-8C", "15-25C Ambient", "Below 30C", etc. (if mentioned),
  "sample_available": true or false,
  "sample_condition": "Sealed", "Opened", "Damaged", "Unknown",
  "severity_level": "Critical", "Major", or "Minor",
  "regulatory_reportable": true or false,
  "health_hazard_risk": "High", "Medium", or "Low"
}
"""

def extract_qms_fields(text: str, groq_api_key: str = None) -> Dict[str, Any]:
    api_key = groq_api_key or settings.GROQ_API_KEY
    extracted_data = {}

    if api_key:
        try:
            llm = ChatGroq(
                groq_api_key=api_key,
                model_name=settings.PRIMARY_MODEL,
                temperature=0.1
            )
            response = llm.invoke([
                SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
                HumanMessage(content=f"Extract QMS complaint JSON from the following log/report:\n\n{text}")
            ])
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            extracted_data = json.loads(content)
        except Exception as e:
            print(f"Groq Extraction API error, falling back to rule-based engine: {e}")
            extracted_data = rule_based_fallback_extract(text)
    else:
        extracted_data = rule_based_fallback_extract(text)

    return normalize_extracted_fields(extracted_data, text)

def rule_based_fallback_extract(text: str) -> Dict[str, Any]:
    """Intelligent heuristic parser for pharma complaint logs"""
    data = {}

    # Batch extraction
    batch_match = re.search(r'(?:batch|lot)\s*#?\s*:?\s*([A-Za-z0-9\-]+)', text, re.IGNORECASE)
    if batch_match:
        data["batch_number"] = batch_match.group(1).upper()

    # Product Name
    prod_patterns = [
        r'(?:product|drug|item)\s*:\s*([^\n,]+)',
        r'([A-Z][a-z0-9\s]+(?:Tablet|Capsule|Injection|API|HCl|Sodium|Solution|Suspension|Ointment)(?:\s*\d+mg)?)'
    ]
    for p in prod_patterns:
        pm = re.search(p, text)
        if pm:
            data["product_name"] = pm.group(1).strip()
            break

    # Product Type (API vs FDF)
    if re.search(r'\b(?:API|Bulk|Active Ingredient|Raw Material|Intermediate|Purity)\b', text, re.IGNORECASE):
        data["product_type"] = "API"
    else:
        data["product_type"] = "FDF"

    # Customer Name / Email
    email_match = re.search(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', text)
    if email_match:
        data["customer_email"] = email_match.group(1)
        cust_match = re.search(r'(?:from|customer|client|hospital|distributor)\s*:\s*([^\n,]+)', text, re.IGNORECASE)
        if cust_match:
            data["customer_name"] = cust_match.group(1).strip()

    # Defect Type
    if re.search(r'impurity|out of spec|OOS|assay|degradation|assay loss', text, re.IGNORECASE):
        data["defect_type"] = "Impurity / OOS"
        data["severity_level"] = "Critical"
        data["regulatory_reportable"] = True
    elif re.search(r'seal|broken|cap|leak|blister|packaging|label', text, re.IGNORECASE):
        data["defect_type"] = "Packaging & Seal"
        data["severity_level"] = "Major"
    elif re.search(r'particle|contamination|foreign|micro|mold', text, re.IGNORECASE):
        data["defect_type"] = "Contamination"
        data["severity_level"] = "Critical"
        data["regulatory_reportable"] = True
    else:
        data["defect_type"] = "Quality Defect"
        data["severity_level"] = "Major"

    data["defect_description"] = text[:400]

    if re.search(r'sample\s+(?:is\s+)?available|sending sample|sample enclosed|sample collected', text, re.IGNORECASE):
        data["sample_available"] = True
        data["sample_condition"] = "Available for QC Testing"

    return data

def normalize_extracted_fields(data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    fields = {
        "customer_name": data.get("customer_name") or "",
        "customer_email": data.get("customer_email") or "",
        "company_site": data.get("company_site") or "",
        "product_name": data.get("product_name") or "",
        "product_type": data.get("product_type") or "FDF",
        "dosage_form": data.get("dosage_form") or "",
        "batch_number": data.get("batch_number") or "",
        "mfg_date": data.get("mfg_date") or "",
        "expiry_date": data.get("expiry_date") or "",
        "defect_type": data.get("defect_type") or "Quality Defect",
        "defect_category": data.get("defect_category") or "",
        "defect_description": data.get("defect_description") or raw_text[:400],
        "storage_conditions": data.get("storage_conditions") or "",
        "sample_available": bool(data.get("sample_available", False)),
        "sample_condition": data.get("sample_condition") or "",
        "severity_level": data.get("severity_level") or "Major",
        "regulatory_reportable": bool(data.get("regulatory_reportable", False)),
        "health_hazard_risk": data.get("health_hazard_risk") or "Medium",
        "investigation_status": "Logged"
    }
    return fields
