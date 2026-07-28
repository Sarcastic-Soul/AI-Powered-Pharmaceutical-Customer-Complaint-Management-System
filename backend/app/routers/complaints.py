import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Complaint, AuditLog, ComplaintDocument
from app.schemas.complaint import ComplaintOut, ComplaintCreate, ComplaintUpdate, AuditLogOut

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_complaint_number(db: Session) -> str:
    count = db.query(Complaint).count()
    year = datetime.datetime.utcnow().year
    return f"CMP-{year}-{(count + 1):04d}"

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    db: Session = Depends(get_db),
    product_type: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(Complaint)
    if product_type:
        query = query.filter(Complaint.product_type == product_type)
    if severity:
        query = query.filter(Complaint.severity_level == severity)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Complaint.complaint_number.like(search_pattern)) |
            (Complaint.product_name.like(search_pattern)) |
            (Complaint.batch_number.like(search_pattern)) |
            (Complaint.customer_name.like(search_pattern))
        )
    return query.order_by(Complaint.id.desc()).all()

@router.post("", response_model=ComplaintOut)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db)):
    comp_no = generate_complaint_number(db)
    data = complaint_in.model_dump()

    db_complaint = Complaint(
        complaint_number=comp_no,
        **data
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    # Add Audit Log
    audit = AuditLog(
        complaint_id=db_complaint.id,
        action="Complaint Registered",
        actor="System / User",
        changes_json=json.dumps({"status": "Registered", "number": comp_no})
    )
    db.add(audit)
    db.commit()
    db.refresh(db_complaint)

    return db_complaint

@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp

@router.put("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: int, complaint_in: ComplaintUpdate, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update_data = complaint_in.model_dump(exclude_unset=True)
    changes = {}
    for key, value in update_data.items():
        old_val = getattr(comp, key, None)
        if old_val != value:
            changes[key] = {"old": old_val, "new": value}
            setattr(comp, key, value)

    if changes:
        comp.updated_at = datetime.datetime.utcnow()
        audit = AuditLog(
            complaint_id=comp.id,
            action=f"Updated {len(changes)} fields via QMS Form",
            actor="QA User",
            changes_json=json.dumps(changes)
        )
        db.add(audit)

    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(comp)
    db.commit()
    return {"message": "Complaint deleted successfully"}

@router.get("/{complaint_id}/audit-trail", response_model=List[AuditLogOut])
def get_audit_trail(complaint_id: int, db: Session = Depends(get_db)):
    audits = db.query(AuditLog).filter(AuditLog.complaint_id == complaint_id).order_by(AuditLog.id.desc()).all()
    return audits
