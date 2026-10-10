from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .security import decode_access_token
from ..db.session import get_db
from ..models.user import User, Membership, Workspace
from ..schemas.auth import UserSession

security_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> UserSession:
    if not credentials:
        # Fallback to default demo user (Creator) if no auth header passed for convenient local dev exploration
        demo_user = db.query(User).filter(User.email == "creator@demo.com").first()
        if demo_user:
            membership = db.query(Membership).filter(Membership.user_id == demo_user.id).first()
            return UserSession(
                id=demo_user.id,
                email=demo_user.email,
                display_name=demo_user.display_name,
                role=membership.role if membership else "creator",
                workspace_id=membership.workspace_id if membership else "ws-1"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required"
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    user_id = payload.get("sub")
    workspace_id = payload.get("workspace_id")
    role = payload.get("role")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account does not exist or is inactive"
        )

    return UserSession(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=role or "creator",
        workspace_id=workspace_id or "ws-1"
    )

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: UserSession = Depends(get_current_user)) -> UserSession:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}. Your current role is '{current_user.role}'."
            )
        return current_user
    return role_checker
