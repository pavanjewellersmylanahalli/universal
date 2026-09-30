from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.organization import Organization, Branch, OrganizationSettings
from app.schemas.organization import OrganizationOut, OrganizationUpdate, BranchOut

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("/me", response_model=OrganizationOut)
def get_my_organization(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    if not org:
        raise APIException(status_code=404, code="ORG_NOT_FOUND", message="Organization not found")
    return OrganizationOut.model_validate(org)

@router.put("/me", response_model=OrganizationOut)
def update_my_organization(
    payload: OrganizationUpdate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    if not org:
        raise APIException(status_code=404, code="ORG_NOT_FOUND", message="Organization not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(org, key, value)

    db.commit()
    db.refresh(org)
    return OrganizationOut.model_validate(org)

@router.get("/branches", response_model=List[BranchOut])
def list_branches(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    branches = db.query(Branch).filter(Branch.organization_id == context.organization_id).all()
    return [BranchOut.model_validate(b) for b in branches]
