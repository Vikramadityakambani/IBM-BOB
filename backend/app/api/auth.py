from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.security import verify_password, create_access_token
from ..core.dependencies import get_db, get_current_user
from ..models.user import User, Membership, Workspace
from ..schemas.auth import LoginRequest, Token, UserOut, UserSession

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    workspace = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first() if membership else None

    role = membership.role if membership else "creator"
    ws_id = workspace.id if workspace else "ws-1"
    ws_name = workspace.name if workspace else "Default Workspace"

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": role,
        "workspace_id": ws_id
    })

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=role,
        workspace_id=ws_id,
        workspace_name=ws_name
    )

@router.get("/me", response_model=UserSession)
def get_me(current_user: UserSession = Depends(get_current_user)):
    return current_user

@router.post("/demo-switch", response_model=Token)
def demo_switch_role(role: str, db: Session = Depends(get_db)):
    """Convenience endpoint for demo evaluation to seamlessly switch between Creator, Reviewer, and Admin"""
    target_email = {
        "creator": "creator@demo.com",
        "reviewer": "reviewer@demo.com",
        "admin": "admin@demo.com"
    }.get(role.lower())

    if not target_email:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'creator', 'reviewer', or 'admin'.")

    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found.")

    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    workspace = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first() if membership else None

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": membership.role,
        "workspace_id": workspace.id if workspace else "ws-1"
    })

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=membership.role,
        workspace_id=workspace.id if workspace else "ws-1",
        workspace_name=workspace.name if workspace else "Acme Enterprise Global"
    )
