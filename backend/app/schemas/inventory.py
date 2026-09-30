from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class InventoryItemCreate(BaseModel):
    category_id: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    name: str
    metal_type: str = "GOLD"
    purity: str = "22K"
    quantity: int = 1
    gross_weight: Decimal
    stone_weight: Decimal = Decimal("0.000")
    net_weight: Decimal
    making_charges_per_gram: Decimal = Decimal("0.00")
    making_charges_fixed: Decimal = Decimal("0.00")
    wastage_percentage: Decimal = Decimal("0.00")
    cost_price: Decimal = Decimal("0.00")
    selling_price: Decimal = Decimal("0.00")
    stock_type: str = "SHOP_STOCK"
    supplier_name: Optional[str] = None

class InventoryItemOut(BaseModel):
    id: str
    organization_id: str
    branch_id: Optional[str] = None
    category_id: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    name: str
    metal_type: str
    purity: str
    quantity: int
    gross_weight: Decimal
    stone_weight: Decimal
    net_weight: Decimal
    making_charges_per_gram: Decimal
    cost_price: Decimal
    selling_price: Decimal
    stock_type: str
    status: str
    supplier_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
