from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.inventory import InventoryItem, StockMovement
from app.schemas.inventory import InventoryItemCreate, InventoryItemOut

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryItemOut])
def list_inventory(
    metal_type: Optional[str] = None,
    stock_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem).filter(InventoryItem.organization_id == context.organization_id)

    if metal_type:
        query = query.filter(InventoryItem.metal_type == metal_type)
    if stock_type:
        query = query.filter(InventoryItem.stock_type == stock_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                InventoryItem.name.ilike(search_pattern),
                InventoryItem.sku.ilike(search_pattern),
                InventoryItem.barcode.ilike(search_pattern)
            )
        )

    items = query.order_by(InventoryItem.created_at.desc()).offset(offset).limit(limit).all()
    return [InventoryItemOut.model_validate(i) for i in items]

@router.post("", response_model=InventoryItemOut, status_code=status.HTTP_201_CREATED)
def add_inventory_item(
    payload: InventoryItemCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    item = InventoryItem(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        **payload.model_dump()
    )
    db.add(item)
    db.flush()

    # Record stock movement
    movement = StockMovement(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        inventory_item_id=item.id,
        movement_type="IN",
        quantity_changed=payload.quantity,
        weight_changed=payload.net_weight,
        notes="Initial stock addition",
        created_by_user_id=context.user_id
    )
    db.add(movement)

    db.commit()
    db.refresh(item)
    return InventoryItemOut.model_validate(item)
