from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.dependencies import get_db, get_current_user
from ..models.content import ContentItem
from ..schemas.auth import UserSession

router = APIRouter(prefix="/calendar", tags=["Calendar Planner"])

@router.get("")
def get_calendar_events(
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Returns content items that have a scheduled date or are approved/in-review with publication plans"""
    items = db.query(ContentItem).filter(
        ContentItem.workspace_id == current_user.workspace_id
    ).all()

    events = []
    for item in items:
        if item.scheduled_at or item.status in ["approved", "scheduled"]:
            events.append({
                "id": item.id,
                "title": item.title,
                "platform": item.platform,
                "format": item.format,
                "status": item.status,
                "scheduled_at": item.scheduled_at or "Tentative Q4",
                "campaign_id": item.campaign_id,
            })
    return events
