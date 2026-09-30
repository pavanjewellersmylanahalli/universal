from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.customer import Customer
from app.models.organization import Organization
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    query = db.query(Customer).filter(Customer.organization_id == context.organization_id)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(search_pattern),
                Customer.mobile.ilike(search_pattern),
                Customer.customer_code.ilike(search_pattern),
                Customer.city.ilike(search_pattern)
            )
        )
    
    customers = query.order_by(Customer.created_at.desc()).offset(offset).limit(limit).all()
    return [CustomerOut.model_validate(c) for c in customers]

@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    prefix = org.customer_prefix if org else "CUST"
    
    count = db.query(Customer).filter(Customer.organization_id == context.organization_id).count()
    code = f"{prefix}-{count + 1:05d}"

    customer = Customer(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        customer_code=code,
        **payload.model_dump()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: str,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == context.organization_id
    ).first()
    if not customer:
        raise APIException(status_code=404, code="CUSTOMER_NOT_FOUND", message="Customer not found")
    return CustomerOut.model_validate(customer)

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == context.organization_id
    ).first()
    if not customer:
        raise APIException(status_code=404, code="CUSTOMER_NOT_FOUND", message="Customer not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)
