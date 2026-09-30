from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class MetalRateCreate(BaseModel):
    gold_24k_per_gram: Decimal
    gold_22k_per_gram: Decimal
    gold_18k_per_gram: Decimal
    silver_per_gram: Decimal
    source: str = "MANUAL"

class MetalRateOut(BaseModel):
    id: str
    gold_24k_per_gram: Decimal
    gold_22k_per_gram: Decimal
    gold_18k_per_gram: Decimal
    silver_per_gram: Decimal
    currency: str
    source: str
    is_stale: bool
    effective_at: datetime

    model_config = ConfigDict(from_attributes=True)
