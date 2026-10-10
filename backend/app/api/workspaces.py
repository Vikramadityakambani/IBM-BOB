from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.dependencies import get_db, get_current_user
from ..models.user import Workspace, Membership, User
from ..schemas.workspace import WorkspaceOut, MembershipOut
from ..schemas.auth import UserSession

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.get("", response_model=List[WorkspaceOut])
def list_workspaces(db: Session = Depends(get_db), current_user: UserSession = Depends(get_current_user)):
    workspaces = db.query(Workspace).all()
    results = []
    for ws in workspaces:
        count = db.query(Membership).filter(Membership.workspace_id == ws.id).count()
        results.append(WorkspaceOut(
            id=ws.id,
            name=ws.name,
            slug=ws.slug,
            members_count=count
        ))
    return results

@router.get("/members", response_model=List[MembershipOut])
def list_workspace_members(db: Session = Depends(get_db), current_user: UserSession = Depends(get_current_user)):
    memberships = db.query(Membership).filter(Membership.workspace_id == current_user.workspace_id).all()
    results = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        results.append(MembershipOut(
            id=m.id,
            workspace_id=m.workspace_id,
            user_id=m.user_id,
            user_name=user.display_name if user else "Unknown",
            user_email=user.email if user else "",
            role=m.role
        ))
    return results
