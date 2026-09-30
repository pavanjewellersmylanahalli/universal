from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class CustomerCreate(BaseModel):
    name: str
    relative_name: Optional[str] = None
    mobile: str
    alternate_mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    date_of_birth: Optional[date] = None
    pan_number: Optional[str] = None
    aadhaar_ref: Optional[str] = None
    nominee_name: Optional[str] = None
    nominee_relation: Optional[str] = None
    nominee_mobile: Optional[str] = None
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    relative_name: Optional[str] = None
    mobile: Optional[str] = None
    alternate_mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    pan_number: Optional[str] = None
    aadhaar_ref: Optional[str] = None
    nominee_name: Optional[str] = None
    nominee_relation: Optional[str] = None
    notes: Optional[str] = None

class CustomerOut(BaseModel):
    id: str
    organization_id: str
    customer_code: str
    name: str
    relative_name: Optional[str] = None
    mobile: str
    alternate_mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    pan_number: Optional[str] = None
    aadhaar_ref: Optional[str] = None
    kyc_status: str
    photo_url: Optional[str] = None
    nominee_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
