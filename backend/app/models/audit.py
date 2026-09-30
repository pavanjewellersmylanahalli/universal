import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    session_id = Column(String, nullable=True)

    action = Column(String, nullable=False, index=True) # e.g. PLEDGE_CREATED, PAYMENT_RECEIVED, LOGIN, REVERSAL
    entity_type = Column(String, nullable=False, index=True) # PLEDGE, CUSTOMER, PAYMENT, INVENTORY, SALE
    entity_id = Column(String, nullable=True)

    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)

    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
