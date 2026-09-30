import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Date, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    customer_code = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    relation_type = Column(String, nullable=True) # Father, Husband, Son, Daughter, etc.
    relative_name = Column(String, nullable=True) # Father's or Husband's name
    mobile = Column(String, nullable=False, index=True)
    alternate_mobile = Column(String, nullable=True)
    email = Column(String, nullable=True)
    monthly_income = Column(Numeric(15, 2), nullable=True)

    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    date_of_birth = Column(Date, nullable=True)
    pan_number = Column(String, nullable=True)
    aadhaar_ref = Column(String, nullable=True) # Masked or reference ID
    kyc_status = Column(String, default="PENDING") # PENDING, VERIFIED, REJECTED
    photo_url = Column(Text, nullable=True)
    signature_url = Column(Text, nullable=True)

    nominee_name = Column(String, nullable=True)
    nominee_relation = Column(String, nullable=True)
    nominee_mobile = Column(String, nullable=True)

    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pledges = relationship("Pledge", back_populates="customer", cascade="all, delete-orphan")
