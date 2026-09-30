import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False) # Ring, Necklace, Chain, Bangle, Coin, Bar, Payal
    metal_type = Column(String, nullable=False, default="GOLD") # GOLD, SILVER, PLATINUM, DIAMOND, BULLION
    description = Column(Text, nullable=True)

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(String, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True)

    sku = Column(String, nullable=False, index=True)
    barcode = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False)
    metal_type = Column(String, nullable=False, default="GOLD") # GOLD, SILVER, PLATINUM, DIAMOND
    purity = Column(String, nullable=False, default="22K") # 24K, 22K, 18K, 92.5

    quantity = Column(Integer, default=1)
    gross_weight = Column(Numeric(10, 3), nullable=False) # grams
    stone_weight = Column(Numeric(10, 3), default=0.000)
    net_weight = Column(Numeric(10, 3), nullable=False)

    making_charges_per_gram = Column(Numeric(10, 2), default=0.00)
    making_charges_fixed = Column(Numeric(10, 2), default=0.00)
    wastage_percentage = Column(Numeric(5, 2), default=0.00)

    cost_price = Column(Numeric(15, 2), default=0.00)
    selling_price = Column(Numeric(15, 2), default=0.00)

    stock_type = Column(String, default="SHOP_STOCK") # SHOP_STOCK, PLEDGED_STOCK, REPLEDGED_STOCK, AUCTIONED_STOCK
    status = Column(String, default="AVAILABLE") # AVAILABLE, SOLD, PLEDGED, RE_PLEDGED, RESERVED

    supplier_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False, index=True)

    movement_type = Column(String, nullable=False) # IN, OUT, SALE, PURCHASE, PLEDGE_RESERVE, PLEDGE_RELEASE, AUCTION
    quantity_changed = Column(Integer, nullable=False)
    weight_changed = Column(Numeric(10, 3), nullable=False)
    reference_type = Column(String, nullable=True) # SALE, PURCHASE, PLEDGE
    reference_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    created_by_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
