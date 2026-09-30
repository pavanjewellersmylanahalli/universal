from datetime import timedelta
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.organization import Organization, Branch, OrganizationSettings, User
from app.schemas.auth import Token, LoginRequest, RegisterOrganizationRequest
from app.schemas.organization import OrganizationOut

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=Token)
def register_organization(payload: RegisterOrganizationRequest, db: Session = Depends(get_db)):
    # Check if slug exists
    slug = payload.organization_name.lower().replace(" ", "-")
    existing_org = db.query(Organization).filter(Organization.slug == slug).first()
    if existing_org:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="ORGANIZATION_EXISTS",
            message="An organization with this name already exists"
        )
    
    # Create Organization
    org = Organization(
        name=payload.organization_name,
        slug=slug,
        email=payload.email,
        phone=payload.phone,
        city=payload.city,
        state=payload.state,
        gstin=payload.gstin
    )
    db.add(org)
    db.flush()

    # Create Main Branch
    main_branch = Branch(
        organization_id=org.id,
        name="Main Branch",
        code="MAIN",
        city=payload.city,
        phone=payload.phone,
        is_main=True
    )
    db.add(main_branch)
    db.flush()

    # Create Settings
    settings = OrganizationSettings(organization_id=org.id)
    db.add(settings)

    # Create Owner User
    user = User(
        organization_id=org.id,
        branch_id=main_branch.id,
        name=payload.owner_name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role="OWNER"
    )
    db.add(user)
    db.commit()

    token = create_access_token(
        subject=user.id,
        organization_id=org.id,
        branch_id=main_branch.id,
        role=user.role
    )
    return Token(access_token=token)

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
            message="Invalid email or password"
        )
    
    if not user.is_active:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            code="USER_INACTIVE",
            message="Account is deactivated"
        )

    token = create_access_token(
        subject=user.id,
        organization_id=user.organization_id,
        branch_id=user.branch_id,
        role=user.role
    )
    return Token(access_token=token)

@router.get("/me")
def get_current_user_profile(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == context.user_id).first()
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    if not user or not org:
        raise APIException(status_code=404, code="NOT_FOUND", message="User or Organization not found")

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "branch_id": user.branch_id
        },
        "organization": OrganizationOut.model_validate(org)
    }
