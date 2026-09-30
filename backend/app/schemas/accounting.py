from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class CashTransactionOut(BaseModel):
    id: str
    transaction_type: str
    category: str
    amount: Decimal
    balance_after: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    description: Optional[str] = None
    transaction_date: datetime

    model_config = ConfigDict(from_attributes=True)

class LedgerEntryOut(BaseModel):
    id: str
    account_head: str
    debit_amount: Decimal
    credit_amount: Decimal
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExpenseCreate(BaseModel):
    category: str
    amount: Decimal
    payment_mode: str = "CASH"
    paid_to: Optional[str] = None
    expense_date: Optional[date] = None
    notes: Optional[str] = None

class ExpenseOut(BaseModel):
    id: str
    category: str
    amount: Decimal
    payment_mode: str
    paid_to: Optional[str] = None
    expense_date: date
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CashBookSummary(BaseModel):
    opening_balance: Decimal
    total_cash_in: Decimal
    total_cash_out: Decimal
    closing_balance: Decimal
    transactions: List[CashTransactionOut] = []
