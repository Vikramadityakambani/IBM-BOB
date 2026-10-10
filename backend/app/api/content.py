from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from ..core.dependencies import get_db, get_current_user
from ..models.content import ContentItem, Comment, WorkflowEvent
from ..models.campaign import Campaign
from ..models.user import User
from ..schemas.content import (
    ContentOut, 
    ContentCreate, 
    ContentUpdate, 
    TransitionRequest, 
    CommentCreate, 
    CommentOut,
    WorkflowEventOut
)
from ..schemas.auth import UserSession
from ..services.workflow_service import WorkflowService

router = APIRouter(prefix="/content", tags=["Content & Governance"])

def map_content_out(item: ContentItem, db: Session) -> ContentOut:
    campaign = db.query(Campaign).filter(Campaign.id == item.campaign_id).first() if item.campaign_id else None
    author = db.query(User).filter(User.id == item.created_by).first()

    comments_out = [
        CommentOut(
            id=c.id,
            content_id=c.content_id,
            author_id=c.author_id,
            author_name=c.author_name,
            author_role=c.author_role,
            body=c.body,
            created_at=c.created_at
        ) for c in item.comments
    ]

    events_out = [
        WorkflowEventOut(
            id=e.id,
            content_id=e.content_id,
            actor_id=e.actor_id,
            actor_name=e.actor_name,
            actor_role=e.actor_role,
            from_status=e.from_status,
            to_status=e.to_status,
            feedback=e.feedback,
            created_at=e.created_at
        ) for e in item.workflow_events
    ]

    return ContentOut(
        id=item.id,
        workspace_id=item.workspace_id,
        campaign_id=item.campaign_id,
        campaign_name=campaign.name if campaign else None,
        created_by=item.created_by,
        author_name=author.display_name if author else "Unknown",
        author_role="creator",
        title=item.title,
        body=item.body,
        platform=item.platform,
        format=item.format,
        language=item.language,
        tone=item.tone,
        status=item.status,
        scheduled_at=item.scheduled_at,
        version=item.version,
        created_at=item.created_at,
        updated_at=item.updated_at,
        comments=comments_out,
        workflow_events=events_out
    )

@router.get("", response_model=List[ContentOut])
def list_content(
    status_filter: Optional[str] = Query(None, alias="status"),
    platform_filter: Optional[str] = Query(None, alias="platform"),
    campaign_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    query = db.query(ContentItem).filter(ContentItem.workspace_id == current_user.workspace_id)

    if status_filter and status_filter != "all":
        query = query.filter(ContentItem.status == status_filter)
    if platform_filter and platform_filter != "all":
        query = query.filter(ContentItem.platform == platform_filter)
    if campaign_id:
        query = query.filter(ContentItem.campaign_id == campaign_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (ContentItem.title.ilike(search_pattern)) | 
            (ContentItem.body.ilike(search_pattern))
        )

    items = query.order_by(ContentItem.updated_at.desc()).all()
    return [map_content_out(item, db) for item in items]

@router.post("", response_model=ContentOut)
def create_content(
    content_in: ContentCreate,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = ContentItem(
        workspace_id=current_user.workspace_id,
        campaign_id=content_in.campaign_id,
        created_by=current_user.id,
        title=content_in.title,
        body=content_in.body,
        platform=content_in.platform,
        format=content_in.format,
        language=content_in.language,
        tone=content_in.tone,
        status="draft",
        version=1
    )
    db.add(item)
    db.flush()

    # Initial history event
    event = WorkflowEvent(
        workspace_id=current_user.workspace_id,
        content_id=item.id,
        actor_id=current_user.id,
        actor_name=current_user.display_name,
        actor_role=current_user.role,
        from_status="draft",
        to_status="draft",
        feedback="Created in AI Studio."
    )
    db.add(event)
    db.commit()
    db.refresh(item)
    return map_content_out(item, db)

@router.get("/{content_id}", response_model=ContentOut)
def get_content_item(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.workspace_id == current_user.workspace_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    return map_content_out(item, db)

@router.patch("/{content_id}", response_model=ContentOut)
def update_content(
    content_id: str,
    updates: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.workspace_id == current_user.workspace_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")

    if updates.title is not None:
        item.title = updates.title
    if updates.body is not None:
        item.body = updates.body
    if updates.platform is not None:
        item.platform = updates.platform
    if updates.format is not None:
        item.format = updates.format
    if updates.language is not None:
        item.language = updates.language
    if updates.tone is not None:
        item.tone = updates.tone
    if updates.campaign_id is not None:
        item.campaign_id = updates.campaign_id
    if updates.scheduled_at is not None:
        item.scheduled_at = updates.scheduled_at

    item.version += 1
    item.updated_at = datetime.now(timezone.utc)

    event = WorkflowEvent(
        workspace_id=current_user.workspace_id,
        content_id=item.id,
        actor_id=current_user.id,
        actor_name=current_user.display_name,
        actor_role=current_user.role,
        from_status=item.status,
        to_status=item.status,
        feedback=f"Updated content (v{item.version})."
    )
    db.add(event)
    db.commit()
    db.refresh(item)
    return map_content_out(item, db)

@router.post("/{content_id}/duplicate", response_model=ContentOut)
def duplicate_content(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    original = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.workspace_id == current_user.workspace_id
    ).first()
    if not original:
        raise HTTPException(status_code=404, detail="Content item not found")

    new_item = ContentItem(
        workspace_id=current_user.workspace_id,
        campaign_id=original.campaign_id,
        created_by=current_user.id,
        title=f"{original.title} (Copy)",
        body=original.body,
        platform=original.platform,
        format=original.format,
        language=original.language,
        tone=original.tone,
        status="draft",
        scheduled_at=None,
        version=1
    )
    db.add(new_item)
    db.flush()

    event = WorkflowEvent(
        workspace_id=current_user.workspace_id,
        content_id=new_item.id,
        actor_id=current_user.id,
        actor_name=current_user.display_name,
        actor_role=current_user.role,
        from_status="draft",
        to_status="draft",
        feedback=f"Duplicated from content item #{original.id[:8]}."
    )
    db.add(event)
    db.commit()
    db.refresh(new_item)
    return map_content_out(new_item, db)

@router.delete("/{content_id}")
def delete_content(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.workspace_id == current_user.workspace_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    db.delete(item)
    db.commit()
    return {"message": "Content item deleted"}

@router.post("/{content_id}/transition", response_model=ContentOut)
def transition_content(
    content_id: str,
    request: TransitionRequest,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = WorkflowService.transition_content(
        db=db,
        content_id=content_id,
        action=request.action,
        user=current_user,
        feedback=request.feedback,
        scheduled_at=request.scheduled_at
    )
    return map_content_out(item, db)

@router.post("/{content_id}/comments", response_model=CommentOut)
def add_comment(
    content_id: str,
    body: str,
    db: Session = Depends(get_db),
    current_user: UserSession = Depends(get_current_user)
):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.workspace_id == current_user.workspace_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")

    comment = Comment(
        workspace_id=current_user.workspace_id,
        content_id=content_id,
        author_id=current_user.id,
        author_name=current_user.display_name,
        author_role=current_user.role,
        body=body
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut(
        id=comment.id,
        content_id=comment.content_id,
        author_id=comment.author_id,
        author_name=comment.author_name,
        author_role=comment.author_role,
        body=comment.body,
        created_at=comment.created_at
    )
