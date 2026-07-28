import json
from typing import Dict, Any, Tuple
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

FORM_EDITOR_SYSTEM_PROMPT = """
You are an AI QMS Form Assistant for a Pharmaceutical Quality Management System.
The user will interact with you using Natural Language instructions (e.g., "Change severity level to Critical", "Update batch number to B-9901", "Set product to Paracetamol API and sample status to received").

You have full control over the QMS Complaint Form.
Given the current form JSON and the user's natural language request:
1. Identify all fields in the form that need to be added, changed, or updated.
2. Produce an updated form dictionary.
3. Write a clear, professional confirmation message explaining what exact QMS field changes you performed and any QA compliance recommendations.

Return ONLY a valid JSON object formatted as follows:
{
  "updated_form": { ... complete key-value dictionary of updated form fields ... },
  "changed_fields": ["list of field names changed, e.g., 'severity_level', 'batch_number'"],
  "ai_response_message": "Natural language confirmation message to show to the QA Officer."
}
"""

def process_nl_form_edit(message: str, current_form: Dict[str, Any], groq_api_key: str = None) -> Tuple[Dict[str, Any], list, str]:
    api_key = groq_api_key or settings.GROQ_API_KEY

    if api_key:
        try:
            llm = ChatGroq(
                groq_api_key=api_key,
                model_name=settings.COMPLEX_MODEL, # llama-3.3-70b-versatile for complex instruction following
                temperature=0.2
            )
            prompt = f"Current Form State:\n{json.dumps(current_form, indent=2)}\n\nUser Request:\n{message}"
            response = llm.invoke([
                SystemMessage(content=FORM_EDITOR_SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ])
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            parsed = json.loads(content)
            return (
                parsed.get("updated_form", current_form),
                parsed.get("changed_fields", []),
                parsed.get("ai_response_message", "Updated complaint form fields as requested.")
            )
        except Exception as e:
            print(f"Groq NL Form Editor error, using fallback logic: {e}")
            return rule_based_nl_edit(message, current_form)
    else:
        return rule_based_nl_edit(message, current_form)

def rule_based_nl_edit(message: str, current_form: Dict[str, Any]) -> Tuple[Dict[str, Any], list, str]:
    updated_form = dict(current_form)
    changed = []

    msg_lower = message.lower()

    # Severity level
    if "critical" in msg_lower:
        updated_form["severity_level"] = "Critical"
        updated_form["regulatory_reportable"] = True
        updated_form["health_hazard_risk"] = "High"
        changed.extend(["severity_level", "regulatory_reportable", "health_hazard_risk"])
    elif "minor" in msg_lower:
        updated_form["severity_level"] = "Minor"
        updated_form["regulatory_reportable"] = False
        updated_form["health_hazard_risk"] = "Low"
        changed.extend(["severity_level", "regulatory_reportable", "health_hazard_risk"])
    elif "major" in msg_lower:
        updated_form["severity_level"] = "Major"
        changed.append("severity_level")

    # Batch number
    import re
    batch_m = re.search(r'(?:batch|lot)(?:\s+number|\s+#)?\s+(?:to|=|\s+)?([A-Za-z0-9\-]+)', message, re.IGNORECASE)
    if batch_m:
        updated_form["batch_number"] = batch_m.group(1).upper()
        changed.append("batch_number")

    # Product Name
    if "api" in msg_lower and "product" in msg_lower:
        updated_form["product_type"] = "API"
        changed.append("product_type")
    elif "fdf" in msg_lower:
        updated_form["product_type"] = "FDF"
        changed.append("product_type")

    # Sample availability
    if "sample" in msg_lower and ("received" in msg_lower or "available" in msg_lower or "yes" in msg_lower):
        updated_form["sample_available"] = True
        updated_form["sample_condition"] = "Received and logged in QC Lab"
        changed.extend(["sample_available", "sample_condition"])

    # Customer Name
    cust_m = re.search(r'customer\s+(?:name\s+)?to\s+([^\n.,]+)', message, re.IGNORECASE)
    if cust_m:
        updated_form["customer_name"] = cust_m.group(1).strip()
        changed.append("customer_name")

    if not changed:
        # Generic update into defect_description or additional notes
        updated_form["defect_description"] = (updated_form.get("defect_description", "") + f"\n[AI Note]: {message}").strip()
        changed.append("defect_description")
        reply = f"I've appended your note to the defect description: '{message}'."
    else:
        fields_str = ", ".join([f"**{f}**" for f in set(changed)])
        reply = f"Updated QMS Complaint form fields: {fields_str} based on your instruction."

    return updated_form, list(set(changed)), reply
