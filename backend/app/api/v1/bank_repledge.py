from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.bank_repledge import BankRePledge
from app.models.pledge import Pledge
from app.schemas.bank_repledge import BankRePledgeCreate, BankRePledgeOut

router = APIRouter(prefix="/bank-repledge", tags=["Bank Re-Pledge"])

@router.get("", response_model=List[BankRePledgeOut])
def list_bank_repledges(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    items = db.query(BankRePledge).filter(
        BankRePledge.organization_id == context.organization_id
    ).order_by(BankRePledge.created_at.desc()).all()
    return [BankRePledgeOut.model_validate(i) for i in items]

@router.post("", response_model=BankRePledgeOut, status_code=status.HTTP_201_CREATED)
def create_bank_repledge(
    payload: BankRePledgeCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    pledge = db.query(Pledge).filter(
        Pledge.id == payload.pledge_id,
        Pledge.organization_id == context.organization_id
    ).first()
    if not pledge:
        raise APIException(status_code=404, code="PLEDGE_NOT_FOUND", message="Customer pledge not found")

    repledge = BankRePledge(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        **payload.model_dump()
    )
    db.add(repledge)
    
    pledge.is_bank_repledged = True
    pledge.status = "RE-PLEDGED"

    db.commit()
    db.refresh(repledge)
    return BankRePledgeOut.model_validate(repledge)
