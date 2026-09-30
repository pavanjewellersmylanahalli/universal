from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class PledgeItemCreate(BaseModel):
    ornament_category: str
    description: Optional[str] = None
    quantity: int = 1
    gross_weight: Decimal
    less_weight: Decimal = Decimal("0.000")
    net_weight: Decimal
    purity: str = "22K"
    estimated_market_value: Decimal
    loan_value: Decimal
    remarks: Optional[str] = None
    photo_url: Optional[str] = None

class PledgeItemOut(BaseModel):
    id: str
    ornament_category: str
    description: Optional[str] = None
    quantity: int
    gross_weight: Decimal
    less_weight: Decimal
    net_weight: Decimal
    purity: str
    estimated_market_value: Decimal
    loan_value: Decimal
    remarks: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PledgeCreate(BaseModel):
    customer_id: Optional[str] = None
    # Inline customer creation fields
    customer_name: Optional[str] = None
    relation_type: Optional[str] = None
    relation_name: Optional[str] = None
    mobile_number: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    address: Optional[str] = None
    customer_photo_url: Optional[str] = None

    pledge_number: Optional[str] = None
    pledge_date: Optional[date] = None
    due_date: date
    loan_amount: Optional[Decimal] = None # Will auto-sum from articles if not set
    monthly_interest_rate: Decimal = Decimal("1.50")
    notes: Optional[str] = None
    items: List[PledgeItemCreate]

class PledgePaymentCreate(BaseModel):
    total_paid: Decimal
    principal_paid: Decimal = Decimal("0.00")
    interest_paid: Decimal = Decimal("0.00")
    charges_paid: Decimal = Decimal("0.00")
    payment_type: str = "INTEREST_ONLY"
    payment_mode: str = "CASH"
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None

class PledgePaymentOut(BaseModel):
    id: str
    payment_number: str
    payment_date: datetime
    total_paid: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    charges_paid: Decimal
    payment_type: str
    payment_mode: str
    reference_number: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PledgeOut(BaseModel):
    id: str
    organization_id: str
    branch_id: Optional[str] = None
    customer_id: str
    pledge_number: str
    pledge_date: date
    due_date: date
    loan_amount: Decimal
    monthly_interest_rate: Decimal
    principal_outstanding: Decimal
    interest_outstanding: Decimal
    total_paid_principal: Decimal
    total_paid_interest: Decimal
    total_gross_weight: Decimal
    total_net_weight: Decimal
    total_market_value: Decimal
    status: str
    is_bank_repledged: bool
    notes: Optional[str] = None
    created_at: datetime
    items: List[PledgeItemOut] = []
    payments: List[PledgePaymentOut] = []

    model_config = ConfigDict(from_attributes=True)
