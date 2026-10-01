from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class BankInterestPaymentCreate(BaseModel):
    payment_date: date
    amount: Decimal
    interest_period: Optional[str] = None
    payment_mode: Optional[str] = "CASH"
    reference_no: Optional[str] = None
    notes: Optional[str] = None

class BankInterestPaymentOut(BaseModel):
    id: str
    bank_repledge_id: str
    payment_date: date
    amount: Decimal
    interest_period: Optional[str] = None
    payment_mode: str
    reference_no: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BankRePledgeCreate(BaseModel):
    pledge_ids: List[str] # List of active pledge IDs selected
    repledge_date: date
    repledge_bill_no: str
    repledge_name: str # VIKASH, DEEPAK, VIKRAM, SHANKARLAL, MAINADEVI, KAVITHA, OMPRAKASH
    repledge_bank: str # KS, MM, BOB, DH, SBI
    repledge_amount: Decimal
    monthly_interest_rate: Optional[Decimal] = Decimal(0)
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = "MAIN"
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class BankRePledgeOut(BaseModel):
    id: str
    organization_id: str
    pledge_id: Optional[str] = None
    pledge_ids: Optional[List[str]] = []
    repledge_date: date
    repledge_bill_no: Optional[str] = None
    repledge_name: Optional[str] = None
    repledge_bank: Optional[str] = None
    repledge_amount: Decimal
    loan_amount: Decimal
    annual_interest_rate: Decimal
    monthly_interest_rate: Decimal
    total_gross_weight: Decimal
    total_net_weight: Decimal
    status: str
    bank_name: str
    bank_branch: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    interest_payments: List[BankInterestPaymentOut] = []

    model_config = ConfigDict(from_attributes=True)

