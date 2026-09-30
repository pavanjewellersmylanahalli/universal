from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None

class SupplierOut(BaseModel):
    id: str
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    balance_payable: Decimal

    model_config = ConfigDict(from_attributes=True)

class SaleItemCreate(BaseModel):
    inventory_item_id: Optional[str] = None
    item_name: str
    metal_type: str = "GOLD"
    purity: str = "22K"
    quantity: int = 1
    gross_weight: Decimal
    net_weight: Decimal
    rate_per_gram: Decimal
    making_charges: Decimal = Decimal("0.00")
    item_total: Decimal

class SaleCreate(BaseModel):
    customer_id: Optional[str] = None
    sale_date: Optional[date] = None
    subtotal_amount: Decimal
    making_charges_total: Decimal = Decimal("0.00")
    tax_amount: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    grand_total: Decimal
    payment_mode: str = "CASH"
    paid_amount: Decimal
    notes: Optional[str] = None
    items: List[SaleItemCreate]

class SaleOut(BaseModel):
    id: str
    organization_id: str
    branch_id: Optional[str] = None
    invoice_number: str
    sale_date: date
    subtotal_amount: Decimal
    making_charges_total: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    grand_total: Decimal
    payment_status: str
    payment_mode: str
    paid_amount: Decimal
    balance_due: Decimal
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
