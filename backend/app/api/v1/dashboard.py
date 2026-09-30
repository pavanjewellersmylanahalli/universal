from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.models.pledge import Pledge, PledgePayment
from app.models.customer import Customer
from app.models.inventory import InventoryItem
from app.models.sales import Sale
from app.models.accounting import CashAccount, CashTransaction
from app.models.rates import MetalRate
from app.schemas.rates import MetalRateOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org_id = context.organization_id

    # Active pledges count and outstanding principal
    active_pledges_count = db.query(Pledge).filter(
        Pledge.organization_id == org_id,
        Pledge.status.in_(["ACTIVE", "PARTIAL_PAYMENT", "RENEWED", "OVERDUE"])
    ).count()

    tot_principal = db.query(func.sum(Pledge.principal_outstanding)).filter(
        Pledge.organization_id == org_id,
        Pledge.status.in_(["ACTIVE", "PARTIAL_PAYMENT", "RENEWED", "OVERDUE"])
    ).scalar() or Decimal("0.00")

    # Today's interest collected
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_interest = db.query(func.sum(PledgePayment.interest_paid)).filter(
        PledgePayment.organization_id == org_id,
        PledgePayment.payment_date >= today_start
    ).scalar() or Decimal("0.00")

    # Cash account balance
    cash_acc = db.query(CashAccount).filter(
        CashAccount.organization_id == org_id,
        CashAccount.is_active == True
    ).first()
    cash_balance = cash_acc.current_balance if cash_acc else Decimal("0.00")

    # Customers count
    total_customers = db.query(Customer).filter(Customer.organization_id == org_id).count()

    # Inventory count
    total_inventory = db.query(InventoryItem).filter(
        InventoryItem.organization_id == org_id,
        InventoryItem.status == "AVAILABLE"
    ).count()

    # Latest metal rates
    rate = db.query(MetalRate).filter(MetalRate.organization_id == org_id).order_by(MetalRate.effective_at.desc()).first()

    return {
        "active_pledges_count": active_pledges_count,
        "total_principal_outstanding": tot_principal,
        "today_interest_collected": today_interest,
        "cash_balance": cash_balance,
        "total_customers": total_customers,
        "available_inventory_count": total_inventory,
        "metal_rate": MetalRateOut.model_validate(rate) if rate else None
    }
