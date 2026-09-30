from typing import List, Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.sales import Sale, SaleItem, Supplier
from app.models.inventory import InventoryItem, StockMovement
from app.models.organization import Organization
from app.schemas.sales import SaleCreate, SaleOut, SupplierCreate, SupplierOut
from app.services.ledger_engine import LedgerEngine

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.get("", response_model=List[SaleOut])
def list_sales(
    limit: int = Query(50, le=100),
    offset: int = 0,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).filter(
        Sale.organization_id == context.organization_id
    ).order_by(Sale.created_at.desc()).offset(offset).limit(limit).all()
    return [SaleOut.model_validate(s) for s in sales]

@router.post("", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SaleCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    prefix = org.invoice_prefix if org else "INV"
    count = db.query(Sale).filter(Sale.organization_id == context.organization_id).count()
    inv_num = f"{prefix}-{count + 1:06d}"

    balance = payload.grand_total - payload.paid_amount
    status_str = "PAID" if balance <= 0 else ("PARTIAL" if payload.paid_amount > 0 else "UNPAID")

    sale = Sale(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        customer_id=payload.customer_id,
        invoice_number=inv_num,
        sale_date=payload.sale_date or date.today(),
        subtotal_amount=payload.subtotal_amount,
        making_charges_total=payload.making_charges_total,
        tax_amount=payload.tax_amount,
        discount_amount=payload.discount_amount,
        grand_total=payload.grand_total,
        payment_status=status_str,
        payment_mode=payload.payment_mode,
        paid_amount=payload.paid_amount,
        balance_due=max(Decimal("0.00"), balance),
        notes=payload.notes,
        created_by_user_id=context.user_id
    )
    db.add(sale)
    db.flush()

    for item in payload.items:
        s_item = SaleItem(
            sale_id=sale.id,
            **item.model_dump()
        )
        db.add(s_item)

        # Deduct stock if inventory_item_id is linked
        if item.inventory_item_id:
            inv_item = db.query(InventoryItem).filter(InventoryItem.id == item.inventory_item_id).first()
            if inv_item:
                inv_item.quantity -= item.quantity
                if inv_item.quantity <= 0:
                    inv_item.status = "SOLD"

                movement = StockMovement(
                    organization_id=context.organization_id,
                    branch_id=context.branch_id,
                    inventory_item_id=inv_item.id,
                    movement_type="SALE",
                    quantity_changed=-item.quantity,
                    weight_changed=-item.net_weight,
                    reference_type="SALE",
                    reference_id=sale.id,
                    created_by_user_id=context.user_id
                )
                db.add(movement)

    # Cash In for Sale
    if payload.payment_mode == "CASH" and payload.paid_amount > 0:
        LedgerEngine.record_cash_transaction(
            db=db,
            organization_id=context.organization_id,
            branch_id=context.branch_id,
            transaction_type="CASH_IN",
            category="SALE",
            amount=payload.paid_amount,
            reference_type="SALE",
            reference_id=sale.id,
            description=f"Payment for invoice {inv_num}"
        )

    # Double entry ledger
    LedgerEngine.record_double_entry(
        db=db,
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        account_head="SALES",
        debit=Decimal("0.00"),
        credit=payload.grand_total,
        entity_type="SALE",
        entity_id=sale.id,
        description=f"Sales revenue invoice {inv_num}"
    )

    db.commit()
    db.refresh(sale)
    return SaleOut.model_validate(sale)

@router.get("/suppliers", response_model=List[SupplierOut])
def list_suppliers(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    suppliers = db.query(Supplier).filter(Supplier.organization_id == context.organization_id).all()
    return [SupplierOut.model_validate(s) for s in suppliers]

@router.post("/suppliers", response_model=SupplierOut)
def create_supplier(
    payload: SupplierCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    supplier = Supplier(
        organization_id=context.organization_id,
        **payload.model_dump()
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return SupplierOut.model_validate(supplier)
