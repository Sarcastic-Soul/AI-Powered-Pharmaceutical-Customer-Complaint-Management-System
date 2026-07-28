from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/presets", tags=["Pharma Presets"])

REALISTIC_PRESETS = [
    {
        "id": "preset-1",
        "title": "API Impurity Out-Of-Specification (Critical)",
        "subtitle": "Paracetamol Active Pharmaceutical Ingredient (API) Bulk Powder",
        "category": "API",
        "severity": "Critical",
        "text": """CUSTOMER COMPLAINT LOG - SANDOZ GLOBAL QUALITY AUDIT
Received: 2026-07-20
Reporter: Dr. Elena Rostova (Quality Control Director, Sandoz GmbH, Kundl Facility)
Email: elena.rostova@sandoz-pharma.corp

Product: Paracetamol API Grade 1 (Micronized Powder)
Manufacturing Site: Unit 3 - Vizag Chemical Synthesis Plant
Batch Number: PR-2024-889
Manufacturing Date: 2026-01-10 | Expiry Date: 2029-01-09
Storage: Store in tightly sealed container below 25°C.

Defect Report:
During receiving HPLC raw material testing at our Kundl facility, Batch PR-2024-889 failed ICH Q3A Impurity Specification. 
Related Substance B (4-Nitrophenol) was quantified at 0.22% w/w, exceeding the maximum allowable monograph limit of 0.15% w/w. Assay value was 98.2% (spec: 99.0-101.0%).
Retain sample of 500g has been segregated and is available for referee testing.

Immediate Impact: Production line of Paracetamol 500mg tablets halted. Urgent RCA and batch isolation requested from AIVOA Quality Team."""
    },
    {
        "id": "preset-2",
        "title": "FDF Blister Packaging Delamination (Major)",
        "subtitle": "Atorvastatin Calcium 20mg Film-Coated Tablets",
        "category": "FDF",
        "severity": "Major",
        "text": """INCIDENT REPORT - METRO HEALTH PHARMACY DISTRIBUTORS
Date: 2026-07-22
Contact: Mark Henderson (Logistics QA Manager, Metro Health)
Email: m.henderson@metrohealth-pharma.com

Product Name: Atorvastatin Calcium 20mg Tablets
Dosage Form: Film-Coated Tablet (10x10 Blister Pack)
Batch / Lot #: AT-9041
Mfg Date: 2026-02-15 | Exp Date: 2028-02-14
Manufacturing Unit: Unit 2 - Formulation & High-Speed Packaging Line 4

Defect Summary:
Hospital pharmacies in District 4 reported receiving blister cartons where aluminum lidding foil was peeling off the PVC/PVDC thermoform blisters (blister delamination). 
Out of 5,000 packs inspected, approximately 350 blisters showed incomplete heat seals along the cavity edges, resulting in exposed tablets.
Sample Availability: 5 defective commercial packs shipped back to AIVOA QC Lab via courier tracking #MH-992110.
Storage Conditions prior to defect: Controlled room temperature 20-25°C."""
    },
    {
        "id": "preset-3",
        "title": "Sterile Injectable Particulate Contamination (Critical - Regulatory Alert)",
        "subtitle": "Ceftriaxone Sodium for Injection 1g Vials",
        "category": "FDF Injectable",
        "severity": "Critical",
        "text": """REGULATORY ALERT & CUSTOMER COMPLAINT - MAYO CLINIC CENTRAL PHARMACY
Date: 2026-07-25
Reporter: Sarah Jenkins, PharmD (Head of Clinical Pharmacy)
Email: sjenkins@mayoclinic-pharm.org

Product: Ceftriaxone Sodium for Injection 1g USP
Dosage Form: Sterile Dry Powder for Injection (Glass Vial)
Batch Number: CF-7702
Mfg Date: 2026-03-01 | Expiry Date: 2028-02-28
Facility: Unit 5 - Sterile Aseptic Fill-Finish Suite

Defect Description:
During reconstitution with 10mL Sterile Water for Injection in ICU Ward 3, clinical staff observed floating black sub-visible and visible specks in 4 vials of Ceftriaxone Batch CF-7702.
Microscopic evaluation confirmed black rubber stopper fragments (particulate matter >25 microns).
Patient Administration: None administered. Vials quarantined immediately.
Sample Status: 4 reconstituted vials and 6 unopened dry vials preserved in refrigerated storage (2-8°C) ready for QA pickup.
Requesting immediate 21 CFR 314.81 Field Alert Report evaluation and emergency lot recall."""
    },
    {
        "id": "preset-4",
        "title": "API Cold Chain Humidity Excursion (Minor/Major)",
        "subtitle": "Ciprofloxacin Hydrochloride API Powder",
        "category": "API",
        "severity": "Major",
        "text": """LOGISTICS QUALITY INCIDENT LOG - DHL SUPPLY CHAIN COLD LOGISTICS
Date: 2026-07-26
Reported by: Vikram Patel (Distribution QA Specialist)
Email: vikram.patel@dhl-pharma.com

Product: Ciprofloxacin Hydrochloride API Powder (25kg Fiber Drums)
Batch Number: CP-5510
Mfg Date: 2026-04-10 | Expiry Date: 2029-04-09
Shipment Origin: Unit 1 - Fine Chemical Synthesis Plant

Incident Details:
During transit from Hyderabad port to Frankfurt hub, temperature data logger #DL-882 recorded a relative humidity excursion of 88% RH for 18 hours due to a container seal defect.
Upon container unsealing, drum outer polyethylene liners exhibited moisture condensation. Powder appearance shifted from off-white crystalline to faint yellowish clumping.
Sample: 100g composite sample drawn by DHL QA and stored under dry nitrogen purge.
Requesting stability re-evaluation and water content (Karl Fischer) verification."""
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def get_presets():
    return REALISTIC_PRESETS
