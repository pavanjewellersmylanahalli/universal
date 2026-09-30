from typing import Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.models.pledge import Pledge, PledgePayment
from app.models.inventory import InventoryItem
from app.models.sales import Sale

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/girvi")
def get_girvi_report(
    branch_id: Optional[str] = None,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org_id = context.organization_id
    query = db.query(Pledge).filter(Pledge.organization_id == org_id)
    if branch_id:
        query = query.filter(Pledge.branch_id == branch_id)

    total_pledges = query.count()
    active = query.filter(Pledge.status == "ACTIVE").count()
    overdue = query.filter(Pledge.status == "OVERDUE").count()
    closed = query.filter(Pledge.status == "CLOSED").count()

    tot_loan = query.with_entities(func.sum(Pledge.loan_amount)).scalar() or Decimal("0.00")
    tot_out = query.with_entities(func.sum(Pledge.principal_outstanding)).scalar() or Decimal("0.00")

    return {
        "total_pledges": total_pledges,
        "active_pledges": active,
        "overdue_pledges": overdue,
        "closed_pledges": closed,
        "total_loan_disbursed": tot_loan,
        "total_principal_outstanding": tot_out
    }
