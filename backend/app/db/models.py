import datetime
import json
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True) # e.g. CMP-2026-001
    customer_name = Column(String(150), nullable=True)
    customer_email = Column(String(150), nullable=True)
    company_site = Column(String(150), nullable=True) # Manufacturing site (e.g. Unit 3 - Vizag API Plant)

    product_name = Column(String(150), nullable=True)
    product_type = Column(String(50), nullable=True) # API or FDF
    dosage_form = Column(String(100), nullable=True) # Tablet, Injection, Bulk Powder, Oral Liquid
    batch_number = Column(String(100), nullable=True, index=True)
    mfg_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)

    defect_type = Column(String(100), nullable=True) # Quality / Packaging / Impurity / Labeling / Physical
    defect_category = Column(String(100), nullable=True)
    defect_description = Column(Text, nullable=True)
    storage_conditions = Column(String(150), nullable=True)
    sample_available = Column(Boolean, default=False)
    sample_condition = Column(String(150), nullable=True)

    severity_level = Column(String(50), default="Major") # Critical, Major, Minor
    regulatory_reportable = Column(Boolean, default=False) # FDA 15-day / EMA FAR reportable
    health_hazard_risk = Column(String(50), default="Medium") # High, Medium, Low
    investigation_status = Column(String(50), default="Logged") # Logged, Under Investigation, RCA Complete, CAPA Approved, Closed

    completeness_score = Column(Float, default=0.0) # 0.0 to 100.0%
    risk_matrix_json = Column(Text, nullable=True) # JSON string of risk criteria
    root_cause_json = Column(Text, nullable=True) # 5 Whys & Fishbone breakdown
    capa_json = Column(Text, nullable=True) # Recommended CAPA tasks list
    summary_text = Column(Text, nullable=True) # AI executive summary

    raw_input_text = Column(Text, nullable=True) # Original complaint text/log
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")
    documents = relationship("ComplaintDocument", back_populates="complaint", cascade="all, delete-orphan")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    action = Column(String(100), nullable=False) # e.g. "Auto-Extracted by AI", "Field 'severity_level' updated via NL Chat"
    actor = Column(String(100), default="AI Agent") # User or AI Agent
    changes_json = Column(Text, nullable=True) # JSON of diff
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")

class ComplaintDocument(Base):
    __tablename__ = "complaint_documents"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True) # email, pdf, lab_report, log
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="documents")
