import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class MetalRate(Base):
    __tablename__ = "metal_rates"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)

    gold_24k_per_gram = Column(Numeric(10, 2), nullable=False) # e.g. 7450.00
    gold_22k_per_gram = Column(Numeric(10, 2), nullable=False) # e.g. 6830.00
    gold_18k_per_gram = Column(Numeric(10, 2), nullable=False) # e.g. 5590.00
    silver_per_gram = Column(Numeric(10, 2), nullable=False)   # e.g. 88.50

    currency = Column(String, default="INR")
    source = Column(String, default="MANUAL") # MANUAL, LIVE_API, FALLBACK_STALE
    is_stale = Column(Boolean, default=False)
    effective_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
