import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class BankRePledge(Base):
    __tablename__ = "bank_repledges"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    pledge_id = Column(String, ForeignKey("pledges.id", ondelete="CASCADE"), nullable=False, index=True)

    bank_name = Column(String, nullable=False) # e.g. State Bank of India, HDFC Bank
    bank_branch = Column(String, nullable=False)
    reference_number = Column(String, nullable=False, index=True) # Bank loan packet / account number

    repledge_date = Column(Date, default=date.today, nullable=False)
    maturity_date = Column(Date, nullable=True)

    loan_amount = Column(Numeric(15, 2), nullable=False)
    annual_interest_rate = Column(Numeric(5, 2), nullable=False) # Bank annual rate %
    monthly_interest_rate = Column(Numeric(5, 2), nullable=False)

    total_gross_weight = Column(Numeric(10, 3), nullable=False)
    total_net_weight = Column(Numeric(10, 3), nullable=False)

    status = Column(String, default="ACTIVE", index=True) # ACTIVE, RECLAIMED, CLOSED
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
