import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Complaint
from app.schemas.complaint import ExtractRequest, NLChatRequest, AnalysisRequest
from app.agents.langgraph_flow import run_extraction_flow, run_chat_edit_flow
from app.agents.risk_analyzer import analyze_risk_and_summary, calculate_completeness_score
from app.agents.rca_capa import generate_rca_and_capa
from app.agents.duplicate_finder import find_duplicate_complaints
import pypdf

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

def get_historical_complaints_dict(db: Session):
    complaints = db.query(Complaint).all()
    res = []
    for c in complaints:
        res.append({
            "id": c.id,
            "complaint_number": c.complaint_number,
            "product_name": c.product_name,
            "batch_number": c.batch_number,
            "defect_type": c.defect_type,
            "defect_description": c.defect_description,
            "severity_level": c.severity_level,
            "investigation_status": c.investigation_status,
            "summary_text": c.summary_text
        })
    return res

@router.post("/extract")
def extract_fields(req: ExtractRequest, db: Session = Depends(get_db)):
    hist_db = get_historical_complaints_dict(db)
    state = run_extraction_flow(req.text, None, hist_db)
    return {
        "form_data": state.get("form_data", {}),
        "completeness": state.get("completeness", {}),
        "risk_analysis": state.get("risk_analysis", {}),
        "rca_capa": state.get("rca_capa", {}),
        "duplicates": state.get("duplicates", []),
        "ai_response": state.get("ai_response", "Auto-extracted fields from complaint document log.")
    }

@router.post("/extract-file")
async def extract_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content_text = ""
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(file.file)
            for page in reader.pages:
                content_text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {e}")
    else:
        # Plain text / log / email file
        bytes_data = await file.read()
        content_text = bytes_data.decode("utf-8", errors="ignore")

    if not content_text.strip():
        raise HTTPException(status_code=400, detail="Document appears to be empty or unreadable.")

    hist_db = get_historical_complaints_dict(db)
    state = run_extraction_flow(content_text, None, hist_db)
    return {
        "filename": file.filename,
        "raw_text": content_text,
        "form_data": state.get("form_data", {}),
        "completeness": state.get("completeness", {}),
        "risk_analysis": state.get("risk_analysis", {}),
        "rca_capa": state.get("rca_capa", {}),
        "duplicates": state.get("duplicates", []),
        "ai_response": f"Extracted structured fields from uploaded file '{file.filename}'."
    }

@router.post("/chat-edit")
def chat_edit_form(req: NLChatRequest, db: Session = Depends(get_db)):
    hist_db = get_historical_complaints_dict(db)
    state = run_chat_edit_flow(req.message, req.current_form_data, req.groq_api_key, hist_db)
    return {
        "form_data": state.get("form_data", {}),
        "changed_fields": state.get("changed_fields", []),
        "ai_response": state.get("ai_response", "Form fields updated."),
        "completeness": state.get("completeness", {}),
        "risk_analysis": state.get("risk_analysis", {}),
        "rca_capa": state.get("rca_capa", {}),
        "duplicates": state.get("duplicates", [])
    }

@router.post("/analyze")
def analyze_form(req: AnalysisRequest, db: Session = Depends(get_db)):
    hist_db = get_historical_complaints_dict(db)
    form = req.form_data
    key = req.groq_api_key

    risk_res = analyze_risk_and_summary(form, key)
    completeness = risk_res.get("completeness", calculate_completeness_score(form))
    rca_res = generate_rca_and_capa(form, key)
    duplicates = find_duplicate_complaints(form, hist_db)

    return {
        "completeness": completeness,
        "risk_analysis": risk_res,
        "rca_capa": rca_res,
        "duplicates": duplicates
    }
