from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class OrganizationSettingsOut(BaseModel):
    default_monthly_interest_rate: Decimal
    default_ltv_percentage: Decimal
    grace_period_days: int
    payment_allocation_order: str
    terms_and_conditions: Optional[str] = None
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BranchOut(BaseModel):
    id: str
    name: str
    code: str
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    is_main: bool

    model_config = ConfigDict(from_attributes=True)

class OrganizationOut(BaseModel):
    id: str
    name: str
    slug: str
    type: str
    logo_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    currency: str
    invoice_prefix: str
    receipt_prefix: str
    girvi_prefix: str
    customer_prefix: str
    branches: List[BranchOut] = []
    settings: Optional[OrganizationSettingsOut] = None

    model_config = ConfigDict(from_attributes=True)

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    invoice_prefix: Optional[str] = None
    receipt_prefix: Optional[str] = None
    girvi_prefix: Optional[str] = None
