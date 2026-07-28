import json
import datetime
from app.db.database import SessionLocal, engine, Base
from app.db.models import Complaint, AuditLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Complaint).count() > 0:
        print("Database already seeded with historical complaints.")
        db.close()
        return

    sample_complaints = [
        {
            "complaint_number": "CMP-2026-0001",
            "customer_name": "Sandoz Global Quality Audit",
            "customer_email": "elena.rostova@sandoz-pharma.corp",
            "company_site": "Unit 3 - Vizag Chemical Synthesis Plant",
            "product_name": "Paracetamol API Grade 1",
            "product_type": "API",
            "dosage_form": "Bulk Powder",
            "batch_number": "PR-2024-889",
            "mfg_date": "2026-01-10",
            "expiry_date": "2029-01-09",
            "defect_type": "Impurity / OOS",
            "defect_category": "High Related Substance B (0.22%)",
            "defect_description": "Failed ICH Q3A Impurity Specification. Related Substance B (4-Nitrophenol) quantified at 0.22% w/w (spec: max 0.15% w/w).",
            "storage_conditions": "Store below 25°C in tightly sealed container",
            "sample_available": True,
            "sample_condition": "500g retained sample in QC lab",
            "severity_level": "Critical",
            "regulatory_reportable": True,
            "health_hazard_risk": "High",
            "investigation_status": "RCA Complete",
            "completeness_score": 95.0,
            "summary_text": "Critical OOS impurity defect in Paracetamol API batch PR-2024-889 caused by cooling jacket valve failure during mother liquor wash.",
            "raw_input_text": "Historical seed complaint for Paracetamol API."
        },
        {
            "complaint_number": "CMP-2026-0002",
            "customer_name": "Metro Health Pharmacy Distributors",
            "customer_email": "m.henderson@metrohealth-pharma.com",
            "company_site": "Unit 2 - Formulation & Packaging Line 4",
            "product_name": "Atorvastatin Calcium 20mg Tablets",
            "product_type": "FDF",
            "dosage_form": "Film-Coated Tablet",
            "batch_number": "AT-9041",
            "mfg_date": "2026-02-15",
            "expiry_date": "2028-02-14",
            "defect_type": "Packaging & Seal",
            "defect_category": "Blister Lidding Foil Delamination",
            "defect_description": "Lidding foil peeling along PVC cavity edges on 350 packs. Incomplete heat sealing causing pinhole exposure.",
            "storage_conditions": "Controlled room temperature 20-25°C",
            "sample_available": True,
            "sample_condition": "5 defective commercial blister packs",
            "severity_level": "Major",
            "regulatory_reportable": False,
            "health_hazard_risk": "Medium",
            "investigation_status": "Under Investigation",
            "completeness_score": 90.0,
            "summary_text": "Major packaging defect on Atorvastatin 20mg batch AT-9041 attributed to thermal heating element temperature drop on Line 4.",
            "raw_input_text": "Historical seed complaint for Atorvastatin."
        },
        {
            "complaint_number": "CMP-2026-0003",
            "customer_name": "Mayo Clinic Central Pharmacy",
            "customer_email": "sjenkins@mayoclinic-pharm.org",
            "company_site": "Unit 5 - Sterile Aseptic Fill-Finish Suite",
            "product_name": "Ceftriaxone Sodium for Injection 1g",
            "product_type": "FDF Injectable",
            "dosage_form": "Sterile Dry Powder for Injection",
            "batch_number": "CF-7702",
            "mfg_date": "2026-03-01",
            "expiry_date": "2028-02-28",
            "defect_type": "Contamination",
            "defect_category": "Sub-visible Rubber Particulate Matter",
            "defect_description": "Reconstituted vials exhibited visible black rubber stopper fragments (>25 microns) in 4 vials.",
            "storage_conditions": "Refrigerated 2-8°C",
            "sample_available": True,
            "sample_condition": "4 reconstituted vials & 6 dry vials",
            "severity_level": "Critical",
            "regulatory_reportable": True,
            "health_hazard_risk": "High",
            "investigation_status": "CAPA Approved",
            "completeness_score": 100.0,
            "summary_text": "Critical parenteral particulate defect. Rubber stopper coring during capper crimping caused stopper shed into vials.",
            "raw_input_text": "Historical seed complaint for Ceftriaxone injection."
        },
        {
            "complaint_number": "CMP-2026-0004",
            "customer_name": "Novartis Quality Assurance",
            "customer_email": "qa@novartis-pharma.com",
            "company_site": "Unit 3 - Vizag Chemical Synthesis Plant",
            "product_name": "Metformin Hydrochloride API Grade 2",
            "product_type": "API",
            "dosage_form": "Bulk Crystalline Powder",
            "batch_number": "PR-2024-889", # Same batch as CMP-1 to demonstrate duplicate detection!
            "mfg_date": "2026-01-10",
            "expiry_date": "2029-01-09",
            "defect_type": "Impurity / OOS",
            "defect_category": "Solvent Residue Out of Specification",
            "defect_description": "Residual Isopropanol content recorded at 5200 ppm (ICH Q3C Limit: max 5000 ppm). Batch PR-2024-889 under investigation.",
            "storage_conditions": "Ambient below 30°C",
            "sample_available": False,
            "sample_condition": "None",
            "severity_level": "Major",
            "regulatory_reportable": False,
            "health_hazard_risk": "Medium",
            "investigation_status": "Closed",
            "completeness_score": 85.0,
            "summary_text": "Duplicate batch issue on PR-2024-889 involving vacuum dryer temperature control.",
            "raw_input_text": "Historical seed complaint for Metformin API batch PR-2024-889."
        }
    ]

    for item in sample_complaints:
        comp = Complaint(**item)
        db.add(comp)
        db.commit()
        db.refresh(comp)

        audit = AuditLog(
            complaint_id=comp.id,
            action="Historical Data Seeded",
            actor="QMS System",
            changes_json=json.dumps({"seeded": True})
        )
        db.add(audit)

    db.commit()
    print("Database successfully seeded with 4 realistic historical Pharma complaints!")
    db.close()

if __name__ == "__main__":
    seed_database()
