import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Integer, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Pledge(Base):
    __tablename__ = "pledges"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)

    pledge_number = Column(String, nullable=False, index=True)
    pledge_date = Column(Date, default=date.today, nullable=False)
    due_date = Column(Date, nullable=False)

    loan_amount = Column(Numeric(15, 2), nullable=False) # Principal loan given
    monthly_interest_rate = Column(Numeric(5, 2), nullable=False, default=1.50) # e.g. 1.5% per month
    interest_type = Column(String, default="MONTHLY") # MONTHLY, DAILY, SLAB, FIXED
    grace_period_days = Column(Integer, default=0)

    principal_outstanding = Column(Numeric(15, 2), nullable=False)
    interest_outstanding = Column(Numeric(15, 2), default=0.00)
    total_paid_principal = Column(Numeric(15, 2), default=0.00)
    total_paid_interest = Column(Numeric(15, 2), default=0.00)

    total_gross_weight = Column(Numeric(10, 3), nullable=False) # in grams
    total_net_weight = Column(Numeric(10, 3), nullable=False) # in grams
    total_market_value = Column(Numeric(15, 2), nullable=False)

    status = Column(String, default="ACTIVE", index=True) # DRAFT, ACTIVE, PARTIAL_PAYMENT, RENEWED, OVERDUE, AUCTION_PENDING, CLOSED, RE-PLEDGED
    is_bank_repledged = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    created_by_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="pledges")
    items = relationship("PledgeItem", back_populates="pledge", cascade="all, delete-orphan")
    payments = relationship("PledgePayment", back_populates="pledge", cascade="all, delete-orphan")

class PledgeItem(Base):
    __tablename__ = "pledge_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    pledge_id = Column(String, ForeignKey("pledges.id", ondelete="CASCADE"), nullable=False, index=True)

    ornament_category = Column(String, nullable=False) # Gold Ring, Gold Chain, Silver Payal, etc.
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=1)
    
    gross_weight = Column(Numeric(10, 3), nullable=False) # grams
    less_weight = Column(Numeric(10, 3), default=0.000) # stones/beads weight
    net_weight = Column(Numeric(10, 3), nullable=False) # pure weight
    purity = Column(String, nullable=False, default="22K") # 24K, 22K, 18K, 92.5 Silver, etc.

    estimated_market_value = Column(Numeric(15, 2), nullable=False)
    loan_value = Column(Numeric(15, 2), nullable=False)
    photo_url = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)

    pledge = relationship("Pledge", back_populates="items")

class PledgePayment(Base):
    __tablename__ = "pledge_payments"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    pledge_id = Column(String, ForeignKey("pledges.id", ondelete="CASCADE"), nullable=False, index=True)

    payment_number = Column(String, nullable=False, index=True)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    total_paid = Column(Numeric(15, 2), nullable=False)
    principal_paid = Column(Numeric(15, 2), default=0.00)
    interest_paid = Column(Numeric(15, 2), default=0.00)
    charges_paid = Column(Numeric(15, 2), default=0.00)

    payment_type = Column(String, nullable=False, default="INTEREST_ONLY") # INTEREST_ONLY, PARTIAL_PRINCIPAL, RENEWAL, FULL_SETTLEMENT, TOPUP
    payment_mode = Column(String, default="CASH") # CASH, BANK_TRANSFER, UPI, CHEQUE
    reference_number = Column(String, nullable=True)
    receipt_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    idempotency_key = Column(String, unique=True, nullable=True)

    created_by_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pledge = relationship("Pledge", back_populates="payments")
