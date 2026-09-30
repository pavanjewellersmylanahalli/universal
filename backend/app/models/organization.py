import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, default="JEWELLERY_AND_GIRVI")
    description = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)

    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)

    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, default="IN")
    pincode = Column(String, nullable=True)

    gstin = Column(String, nullable=True)
    pan = Column(String, nullable=True)
    registration_info = Column(Text, nullable=True)

    currency = Column(String, default="INR")
    timezone = Column(String, default="Asia/Kolkata")
    language = Column(String, default="en")

    invoice_prefix = Column(String, default="INV")
    receipt_prefix = Column(String, default="RCPT")
    girvi_prefix = Column(String, default="GIRVI")
    customer_prefix = Column(String, default="CUST")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branches = relationship("Branch", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    settings = relationship("OrganizationSettings", back_populates="organization", uselist=False, cascade="all, delete-orphan")

class Branch(Base):
    __tablename__ = "branches"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_main = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="branches")

class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    default_monthly_interest_rate = Column(Numeric(5, 2), default=1.50) # 1.5% per month
    default_ltv_percentage = Column(Numeric(5, 2), default=75.00) # 75%
    grace_period_days = Column(Integer, default=7)
    payment_allocation_order = Column(String, default="INTEREST,CHARGES,PRINCIPAL")
    terms_and_conditions = Column(Text, nullable=True)
    receipt_header = Column(Text, nullable=True)
    receipt_footer = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="settings")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="STAFF") # OWNER, ADMIN, MANAGER, STAFF

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
