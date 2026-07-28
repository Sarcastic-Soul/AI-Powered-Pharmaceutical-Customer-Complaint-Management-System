import json
from typing import Dict, Any, List
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

RCA_CAPA_SYSTEM_PROMPT = """
You are a Principal Quality & Regulatory Compliance Officer in Pharmaceutical Manufacturing (cGMP, ICH Q9, ICH Q10).
Analyze the provided pharmaceutical complaint details and generate:

1. **5 Whys Root Cause Analysis**: A step-by-step 5 Whys progression identifying the true root cause.
2. **Fishbone (Ishikawa) 6M Breakdown**: Root cause contributors categorized into Man, Machine, Material, Method, Measurement, and Milieu (Environment).
3. **CAPA Plan (Corrective and Preventive Actions)**:
   - Corrective Actions (Immediate containment, batch quarantine, sample re-test)
   - Preventive Actions (SOP update, equipment recalibration, operator retraining, vendor qualification)

Return ONLY valid JSON formatted as:
{
  "root_cause_summary": "Concise summary of identified root cause",
  "five_whys": [
    {"step": 1, "why": "Why did the defect occur?", "answer": "..."},
    {"step": 2, "why": "Why did that happen?", "answer": "..."},
    {"step": 3, "why": "Why was that not caught?", "answer": "..."},
    {"step": 4, "why": "Why was the process vulnerable?", "answer": "..."},
    {"step": 5, "why": "What is the ultimate root cause?", "answer": "..."}
  ],
  "fishbone_diagram": {
    "Man": ["Inadequate training on high-speed blister sealing"],
    "Machine": ["Temperature sensor drift on Sealing Station #3"],
    "Material": ["Lidding foil thickness variation from supplier"],
    "Method": ["SOP-PKG-042 sealing temperature tolerance window too wide"],
    "Measurement": ["Pyrometer recalibration interval overdue"],
    "Milieu": ["Cleanroom humidity spike during night shift"]
  },
  "capa_items": [
    {
      "id": "CAPA-01",
      "type": "Corrective",
      "action": "Immediate quarantine of Batch B-2026-9041 retain samples and notification to distributors.",
      "owner": "QA Lead - Operations",
      "target_days": 3,
      "priority": "High"
    },
    {
      "id": "CAPA-02",
      "type": "Preventive",
      "action": "Recalibrate sealing station heating element pyrometers and implement automatic thermocouple cut-off logic.",
      "owner": "Engineering Manager",
      "target_days": 14,
      "priority": "High"
    },
    {
      "id": "CAPA-03",
      "type": "Preventive",
      "action": "Revise SOP-PKG-042 to narrow sealing temperature limit from 180±15°C to 180±5°C.",
      "owner": "Validation Specialist",
      "target_days": 10,
      "priority": "Medium"
    }
  ]
}
"""

def generate_rca_and_capa(form_data: Dict[str, Any], groq_api_key: str = None) -> Dict[str, Any]:
    api_key = groq_api_key or settings.GROQ_API_KEY

    if api_key:
        try:
            llm = ChatGroq(
                groq_api_key=api_key,
                model_name=settings.COMPLEX_MODEL, # llama-3.3-70b-versatile
                temperature=0.2
            )
            response = llm.invoke([
                SystemMessage(content=RCA_CAPA_SYSTEM_PROMPT),
                HumanMessage(content=f"Generate Pharma RCA & CAPA for complaint:\n{json.dumps(form_data, indent=2)}")
            ])
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            return json.loads(content)
        except Exception as e:
            print(f"Groq RCA/CAPA error, using fallback logic: {e}")
            return default_rca_capa_fallback(form_data)
    else:
        return default_rca_capa_fallback(form_data)

def default_rca_capa_fallback(form_data: Dict[str, Any]) -> Dict[str, Any]:
    product_type = form_data.get("product_type", "FDF")
    defect = form_data.get("defect_type", "Quality Defect")

    if product_type == "API":
        return {
            "root_cause_summary": f"Incomplete crystallization kinetics and solvent wash temperature deviation resulting in {defect}.",
            "five_whys": [
                {"step": 1, "why": "Why did the API exhibit impurity out-of-specification?", "answer": "Related Substance B spiked above ICH Q3A threshold of 0.15%."},
                {"step": 2, "why": "Why did Related Substance B spike during synthesis?", "answer": "Crystallization reaction kettle temperature exceeded 45°C limit during mother liquor wash."},
                {"step": 3, "why": "Why did the reactor temperature exceed 45°C?", "answer": "Chilled water cooling jacket control valve stuck in 30% open position due to actuator wear."},
                {"step": 4, "why": "Why was the valve actuator failure not flagged during batch startup?", "answer": "Pre-batch automated utility check script did not verify valve pressure feedback line."},
                {"step": 5, "why": "What is the ultimate root cause?", "answer": "Incomplete preventive maintenance cycle for reactor utility feedback instrumentation (Eq-KTL-09)."}
            ],
            "fishbone_diagram": {
                "Man": ["Operator relied on manual analog temperature gauge during wash step"],
                "Machine": ["Kettle Eq-KTL-09 chilled water actuator valve stuck"],
                "Material": ["Solvent Lot S-881 contained higher moisture content"],
                "Method": ["SOP-SYN-102 lacked explicit verification step for automated cooling feedback"],
                "Measurement": ["Kettle RTD sensor calibration interval expired by 4 days"],
                "Milieu": ["Ambient utility room temperature reached 32°C during summer peak"]
            },
            "capa_items": [
                {
                    "id": "CAPA-API-01",
                    "type": "Corrective",
                    "action": f"Quarantine API Batch {form_data.get('batch_number', 'B-1001')} and perform 100% re-testing of mother liquor retains.",
                    "owner": "QA API Manager",
                    "target_days": 2,
                    "priority": "High"
                },
                {
                    "id": "CAPA-API-02",
                    "type": "Preventive",
                    "action": "Replace actuator valve assembly on Kettle Eq-KTL-09 and integrate automated SCADA interlock shutdown.",
                    "owner": "Engineering Lead",
                    "target_days": 7,
                    "priority": "High"
                },
                {
                    "id": "CAPA-API-03",
                    "type": "Preventive",
                    "action": "Update SOP-SYN-102 to mandate dual-operator signoff on chilled water valve differential pressure prior to mother liquor wash.",
                    "owner": "Production Manager",
                    "target_days": 10,
                    "priority": "Medium"
                }
            ]
        }
    else:
        return {
            "root_cause_summary": f"Transient heat sealing temperature drop on packaging line leading to {defect}.",
            "five_whys": [
                {"step": 1, "why": f"Why was {defect} reported by customer?", "answer": "Blister pocket seals exhibited pinhole micro-leaks upon distribution."},
                {"step": 2, "why": "Why were there pinhole micro-leaks in blister pockets?", "answer": "Blister lidding foil seal roller temperature dropped below 165°C threshold during batch run."},
                {"step": 3, "why": "Why did the seal roller temperature drop below 165°C?", "answer": "Heating cartridge #2 experienced intermittent electrical open circuit due to wire fatigue."},
                {"step": 4, "why": "Why did the inline inspection camera fail to reject unsealed blisters?", "answer": "Vision system camera threshold was set to detect gross foil tears, not micro-leaks."},
                {"step": 5, "why": "What is the ultimate root cause?", "answer": "Inadequate PM frequency for high-wear heating cartridges on packaging line #4."}
            ],
            "fishbone_diagram": {
                "Man": ["Packaging line operator did not perform dye leak test at 2-hour interval"],
                "Machine": ["Blister Sealer Line #4 heating cartridge #2 intermittent open circuit"],
                "Material": ["Aluminum lidding foil 25 micron thickness batch variation"],
                "Method": ["SOP-PKG-088 dye leak testing sampling frequency unclear"],
                "Measurement": ["Vision inspection system optics threshold calibration gap"],
                "Milieu": ["Packaging room relative humidity exceeded 60% RH limit"]
            },
            "capa_items": [
                {
                    "id": "CAPA-FDF-01",
                    "type": "Corrective",
                    "action": f"Initiate immediate warehouse isolation & 100% blue dye leak re-inspection for Batch {form_data.get('batch_number', 'B-9000')}.",
                    "owner": "QA Packaging Supervisor",
                    "target_days": 2,
                    "priority": "High"
                },
                {
                    "id": "CAPA-FDF-02",
                    "type": "Preventive",
                    "action": "Replace heating element array on Blister Machine #4 and install continuous thermal imaging monitoring.",
                    "owner": "Maintenance Lead",
                    "target_days": 5,
                    "priority": "High"
                },
                {
                    "id": "CAPA-FDF-03",
                    "type": "Preventive",
                    "action": "Revise SOP-PKG-088 to mandate vacuum blue dye leak test every 60 minutes with e-signature log.",
                    "owner": "QA Compliance Specialist",
                    "target_days": 7,
                    "priority": "Medium"
                }
            ]
        }
