from typing import Optional, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import APIException

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

class CurrentUser(BaseModel):
    id: str
    organization_id: str
    branch_id: Optional[str] = None
    role: str
    email: str
    name: str

    model_config = ConfigDict(from_attributes=True)

class TenantContext(BaseModel):
    organization_id: str
    branch_id: Optional[str] = None
    user_id: str
    user_role: str

def get_current_tenant_context(
    token: str = Depends(reusable_oauth2),
    db: Session = Depends(get_db)
) -> TenantContext:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        org_id: str = payload.get("org_id")
        branch_id: Optional[str] = payload.get("branch_id")
        role: str = payload.get("role", "STAFF")

        if not user_id or not org_id:
            raise APIException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="UNAUTHORIZED",
                message="Invalid authentication credentials"
            )
        
        return TenantContext(
            organization_id=org_id,
            branch_id=branch_id,
            user_id=user_id,
            user_role=role
        )
    except JWTError:
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_TOKEN",
            message="Could not validate credentials or token expired"
        )

def require_permission(permission: str):
    def permission_checker(context: TenantContext = Depends(get_current_tenant_context)):
        # Owner/Admin override
        if context.user_role in ["OWNER", "ADMIN"]:
            return context
        # Add detailed permission checks as needed
        return context
    return permission_checker
