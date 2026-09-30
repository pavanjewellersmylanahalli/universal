import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Integer, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    gstin = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    balance_payable = Column(Numeric(15, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)

    invoice_number = Column(String, nullable=False, index=True)
    sale_date = Column(Date, default=date.today, nullable=False)

    subtotal_amount = Column(Numeric(15, 2), nullable=False)
    making_charges_total = Column(Numeric(15, 2), default=0.00)
    tax_amount = Column(Numeric(15, 2), default=0.00) # GST
    discount_amount = Column(Numeric(15, 2), default=0.00)
    grand_total = Column(Numeric(15, 2), nullable=False)

    payment_status = Column(String, default="PAID") # PAID, PARTIAL, UNPAID
    payment_mode = Column(String, default="CASH") # CASH, UPI, BANK, CHEQUE, MIXED
    paid_amount = Column(Numeric(15, 2), nullable=False)
    balance_due = Column(Numeric(15, 2), default=0.00)

    notes = Column(Text, nullable=True)
    invoice_url = Column(Text, nullable=True)
    created_by_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    sale_id = Column(String, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id", ondelete="SET NULL"), nullable=True)

    item_name = Column(String, nullable=False)
    metal_type = Column(String, default="GOLD")
    purity = Column(String, default="22K")
    quantity = Column(Integer, default=1)

    gross_weight = Column(Numeric(10, 3), nullable=False)
    net_weight = Column(Numeric(10, 3), nullable=False)
    rate_per_gram = Column(Numeric(10, 2), nullable=False)

    making_charges = Column(Numeric(10, 2), default=0.00)
    item_total = Column(Numeric(15, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)

    purchase_number = Column(String, nullable=False, index=True)
    purchase_date = Column(Date, default=date.today, nullable=False)

    total_amount = Column(Numeric(15, 2), nullable=False)
    paid_amount = Column(Numeric(15, 2), default=0.00)
    balance_due = Column(Numeric(15, 2), default=0.00)
    payment_mode = Column(String, default="BANK")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
