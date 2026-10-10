import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from ..core.dependencies import get_db, get_current_user
from ..models.brand import BrandProfile
from ..services.ai_service import AIService
from ..schemas.auth import UserSession

router = APIRouter(prefix="/ai", tags=["AI Studio Orchestration"])

class GenerateRequest(BaseModel):
    topic: str
    platform: str = "linkedin"
    format_type: str = "Article"
    tone: str = "Thought-Leadership"
    language: str = "English"

class RefineRequest(BaseModel):
    body: str
    action: str  # shorten, expand, rewrite, change_tone
    tone: Optional[str] = None

class RepurposeRequest(BaseModel):
    source_body: str
    target_platform: str

class QualityCheckRequest(BaseModel):
    body: str
    platform: str = "linkedin"

@router.post("/generate")
def generate_content(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
) -> Dict[str, Any]:
    bp = db.query(BrandProfile).filter(BrandProfile.workspace_id == current_user.workspace_id).first()
    brand_dict = {
        "name": bp.name if bp else "Default Brand",
        "tone": bp.tone if bp else "Professional",
        "preferred_terms": json.loads(bp.preferred_terms) if bp and bp.preferred_terms else [],
        "prohibited_phrases": json.loads(bp.prohibited_phrases) if bp and bp.prohibited_phrases else []
    } if bp else None

    result = AIService.generate_draft(
        topic=request.topic,
        platform=request.platform,
        format_type=request.format_type,
        tone=request.tone,
        language=request.language,
        brand_profile=brand_dict
    )
    return result

@router.post("/refine")
def refine_content(request: RefineRequest, current_user: UserSession = Depends(get_current_user)):
    refined_body = AIService.refine_content(
        body=request.body,
        action=request.action,
        tone=request.tone
    )
    return {
        "action": request.action,
        "refined_body": refined_body
    }

@router.post("/repurpose")
def repurpose_content(request: RepurposeRequest, current_user: UserSession = Depends(get_current_user)):
    adapted_body = AIService.repurpose_content(
        source_body=request.source_body,
        target_platform=request.target_platform
    )
    return {
        "target_platform": request.target_platform,
        "adapted_body": adapted_body
    }

@router.post("/quality-check")
def quality_check(
    request: QualityCheckRequest,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    bp = db.query(BrandProfile).filter(BrandProfile.workspace_id == current_user.workspace_id).first()
    prohibited = json.loads(bp.prohibited_phrases) if bp and bp.prohibited_phrases else []

    scorecard = AIService.quality_check(
        body=request.body,
        platform=request.platform,
        prohibited_phrases=prohibited
    )
    return scorecard
