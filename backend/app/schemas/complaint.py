from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class ComplaintBase(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    company_site: Optional[str] = "Unit 1 - Main Pharma Facility"
    product_name: Optional[str] = None
    product_type: Optional[str] = "FDF" # API or FDF
    dosage_form: Optional[str] = None
    batch_number: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    defect_type: Optional[str] = None
    defect_category: Optional[str] = None
    defect_description: Optional[str] = None
    storage_conditions: Optional[str] = None
    sample_available: bool = False
    sample_condition: Optional[str] = None
    severity_level: Optional[str] = "Major"
    regulatory_reportable: bool = False
    health_hazard_risk: Optional[str] = "Medium"
    investigation_status: Optional[str] = "Logged"

class ComplaintCreate(ComplaintBase):
    raw_input_text: Optional[str] = None

class ComplaintUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    company_site: Optional[str] = None
    product_name: Optional[str] = None
    product_type: Optional[str] = None
    dosage_form: Optional[str] = None
    batch_number: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    defect_type: Optional[str] = None
    defect_category: Optional[str] = None
    defect_description: Optional[str] = None
    storage_conditions: Optional[str] = None
    sample_available: Optional[bool] = None
    sample_condition: Optional[str] = None
    severity_level: Optional[str] = None
    regulatory_reportable: Optional[bool] = None
    health_hazard_risk: Optional[str] = None
    investigation_status: Optional[str] = None

class AuditLogOut(BaseModel):
    id: int
    action: str
    actor: str
    changes_json: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ComplaintOut(ComplaintBase):
    id: int
    complaint_number: str
    completeness_score: float
    risk_matrix_json: Optional[str] = None
    root_cause_json: Optional[str] = None
    capa_json: Optional[str] = None
    summary_text: Optional[str] = None
    raw_input_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    audit_logs: List[AuditLogOut] = []

    class Config:
        from_attributes = True

class ExtractRequest(BaseModel):
    text: str
    document_name: Optional[str] = "Customer Log / Document"

class NLChatRequest(BaseModel):
    message: str
    current_form_data: Dict[str, Any]
    groq_api_key: Optional[str] = None

class AnalysisRequest(BaseModel):
    form_data: Dict[str, Any]
    groq_api_key: Optional[str] = None
