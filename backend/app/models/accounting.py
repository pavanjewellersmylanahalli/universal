import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class CashAccount(Base):
    __tablename__ = "cash_accounts"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String, default="Main Cash Box")
    opening_balance = Column(Numeric(15, 2), default=0.00)
    current_balance = Column(Numeric(15, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CashTransaction(Base):
    __tablename__ = "cash_transactions"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    cash_account_id = Column(String, ForeignKey("cash_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    transaction_type = Column(String, nullable=False) # CASH_IN, CASH_OUT
    category = Column(String, nullable=False) # GIRDVI_PAYMENT, GIRDVI_DISBURSEMENT, SALE, PURCHASE, EXPENSE, BANK_DEPOSIT, BANK_WITHDRAWAL
    amount = Column(Numeric(15, 2), nullable=False)
    balance_after = Column(Numeric(15, 2), nullable=False)

    reference_type = Column(String, nullable=True) # PLEDGE, PLEDGE_PAYMENT, SALE, PURCHASE, EXPENSE
    reference_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow, nullable=False)

class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    bank_name = Column(String, nullable=False)
    account_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    ifsc_code = Column(String, nullable=True)
    branch_name = Column(String, nullable=True)

    current_balance = Column(Numeric(15, 2), default=0.00)
    is_active = Column(Boolean, default=True)

class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    bank_account_id = Column(String, ForeignKey("bank_accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    transaction_type = Column(String, nullable=False) # DEPOSIT, WITHDRAWAL, TRANSFER
    amount = Column(Numeric(15, 2), nullable=False)
    balance_after = Column(Numeric(15, 2), nullable=False)
    reference_number = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    account_head = Column(String, nullable=False) # CASH, BANK, INTEREST_INCOME, PRINCIPAL_DISBURSED, PRINCIPAL_RECOVERED, SALES, PURCHASES, EXPENSES
    debit_amount = Column(Numeric(15, 2), default=0.00)
    credit_amount = Column(Numeric(15, 2), default=0.00)

    entity_type = Column(String, nullable=True) # PLEDGE, PLEDGE_PAYMENT, SALE, PURCHASE, EXPENSE
    entity_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    category = Column(String, nullable=False) # RENT, ELECTRICITY, SALARY, TEA_SNACKS, MAINTENANCE, OTHER
    amount = Column(Numeric(15, 2), nullable=False)
    payment_mode = Column(String, default="CASH")
    paid_to = Column(String, nullable=True)
    expense_date = Column(Date, default=date.today)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
