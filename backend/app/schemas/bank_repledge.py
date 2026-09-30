from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class BankRePledgeCreate(BaseModel):
    pledge_id: str
    bank_name: str
    bank_branch: str
    reference_number: str
    repledge_date: date
    maturity_date: Optional[date] = None
    loan_amount: Decimal
    annual_interest_rate: Decimal
    monthly_interest_rate: Decimal
    total_gross_weight: Decimal
    total_net_weight: Decimal
    notes: Optional[str] = None

class BankRePledgeOut(BaseModel):
    id: str
    organization_id: str
    pledge_id: str
    bank_name: str
    bank_branch: str
    reference_number: str
    repledge_date: date
    maturity_date: Optional[date] = None
    loan_amount: Decimal
    annual_interest_rate: Decimal
    monthly_interest_rate: Decimal
    total_gross_weight: Decimal
    total_net_weight: Decimal
    status: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
