from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.dependencies import get_db, get_current_user
from ..models.campaign import Campaign
from ..models.content import ContentItem
from ..schemas.campaign import CampaignOut, CampaignCreate
from ..schemas.auth import UserSession

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=List[CampaignOut])
def list_campaigns(db: Session = Depends(get_db), current_user: UserSession = Depends(get_current_user)):
    campaigns = db.query(Campaign).filter(Campaign.workspace_id == current_user.workspace_id).all()
    results = []
    for c in campaigns:
        item_count = db.query(ContentItem).filter(ContentItem.campaign_id == c.id).count()
        results.append(CampaignOut(
            id=c.id,
            workspace_id=c.workspace_id,
            name=c.name,
            objective=c.objective,
            target_audience=c.target_audience,
            start_date=c.start_date,
            end_date=c.end_date,
            status=c.status,
            item_count=item_count
        ))
    return results

@router.post("", response_model=CampaignOut)
def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    c = Campaign(
        workspace_id=current_user.workspace_id,
        name=campaign_in.name,
        objective=campaign_in.objective,
        target_audience=campaign_in.target_audience,
        start_date=campaign_in.start_date,
        end_date=campaign_in.end_date,
        status="active"
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CampaignOut(
        id=c.id,
        workspace_id=c.workspace_id,
        name=c.name,
        objective=c.objective,
        target_audience=c.target_audience,
        start_date=c.start_date,
        end_date=c.end_date,
        status=c.status,
        item_count=0
    )
