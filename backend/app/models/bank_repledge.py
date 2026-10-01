import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Date, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class BankRePledge(Base):
    __tablename__ = "bank_repledges"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Primary or legacy pledge ID
    pledge_id = Column(String, ForeignKey("pledges.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Array of linked pledge IDs for multi-pledge repledging
    pledge_ids = Column(JSON, nullable=True, default=list)

    repledge_bill_no = Column(String, nullable=True, index=True) # Repledge Bill Number
    repledge_name = Column(String, nullable=True, index=True) # VIKASH, DEEPAK, VIKRAM, SHANKARLAL, MAINADEVI, KAVITHA, OMPRAKASH
    repledge_bank = Column(String, nullable=True, index=True) # KS, MM, BOB, DH, SBI

    bank_name = Column(String, nullable=False, default="BANK") # e.g. State Bank of India, HDFC Bank, SBI, KS
    bank_branch = Column(String, nullable=True, default="MAIN")
    reference_number = Column(String, nullable=True, index=True) # Bank loan packet / account number

    repledge_date = Column(Date, default=date.today, nullable=False)
    maturity_date = Column(Date, nullable=True)

    repledge_amount = Column(Numeric(15, 2), nullable=False, default=0)
    loan_amount = Column(Numeric(15, 2), nullable=False, default=0)
    annual_interest_rate = Column(Numeric(5, 2), nullable=False, default=0)
    monthly_interest_rate = Column(Numeric(5, 2), nullable=False, default=0)

    total_gross_weight = Column(Numeric(10, 3), nullable=False, default=0)
    total_net_weight = Column(Numeric(10, 3), nullable=False, default=0)

    status = Column(String, default="ACTIVE", index=True) # ACTIVE, RECLAIMED, CLOSED
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    interest_payments = relationship("BankRePledgeInterestPayment", back_populates="bank_repledge", cascade="all, delete-orphan")


class BankRePledgeInterestPayment(Base):
    __tablename__ = "bank_repledge_interest_payments"

    id = Column(String, primary_key=True, default=gen_uuid)
    bank_repledge_id = Column(String, ForeignKey("bank_repledges.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    payment_date = Column(Date, default=date.today, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    interest_period = Column(String, nullable=True) # e.g. "October 2026"
    payment_mode = Column(String, default="CASH") # CASH, BANK, UPI, CHEQUE
    reference_no = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    bank_repledge = relationship("BankRePledge", back_populates="interest_payments")

