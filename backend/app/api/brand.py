import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.dependencies import get_db, get_current_user, require_role
from ..models.brand import BrandProfile
from ..schemas.brand import BrandProfileOut, BrandProfileUpdate
from ..schemas.auth import UserSession

router = APIRouter(prefix="/brand-profile", tags=["Brand Voice"])

@router.get("", response_model=BrandProfileOut)
def get_brand_profile(db: Session = Depends(get_db), current_user: UserSession = Depends(get_current_user)):
    bp = db.query(BrandProfile).filter(BrandProfile.workspace_id == current_user.workspace_id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="Brand profile not found for current workspace")
    return BrandProfileOut(
        id=bp.id,
        workspace_id=bp.workspace_id,
        name=bp.name,
        tone=bp.tone,
        audience=bp.audience,
        preferred_terms=json.loads(bp.preferred_terms) if bp.preferred_terms else [],
        prohibited_phrases=json.loads(bp.prohibited_phrases) if bp.prohibited_phrases else [],
        style_guidelines=bp.style_guidelines
    )

@router.patch("", response_model=BrandProfileOut)
def update_brand_profile(
    updates: BrandProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(require_role(["admin"]))
):
    bp = db.query(BrandProfile).filter(BrandProfile.workspace_id == current_user.workspace_id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="Brand profile not found")

    if updates.name is not None:
        bp.name = updates.name
    if updates.tone is not None:
        bp.tone = updates.tone
    if updates.audience is not None:
        bp.audience = updates.audience
    if updates.style_guidelines is not None:
        bp.style_guidelines = updates.style_guidelines
    if updates.preferred_terms is not None:
        bp.preferred_terms = json.dumps(updates.preferred_terms)
    if updates.prohibited_phrases is not None:
        bp.prohibited_phrases = json.dumps(updates.prohibited_phrases)

    db.commit()
    db.refresh(bp)
    return BrandProfileOut(
        id=bp.id,
        workspace_id=bp.workspace_id,
        name=bp.name,
        tone=bp.tone,
        audience=bp.audience,
        preferred_terms=json.loads(bp.preferred_terms),
        prohibited_phrases=json.loads(bp.prohibited_phrases),
        style_guidelines=bp.style_guidelines
    )
