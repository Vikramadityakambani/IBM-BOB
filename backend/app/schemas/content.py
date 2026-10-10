from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class CommentCreate(BaseModel):
    body: str

class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content_id: str
    author_id: str
    author_name: str
    author_role: str
    body: str
    created_at: datetime

class WorkflowEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content_id: str
    actor_id: str
    actor_name: str
    actor_role: str
    from_status: str
    to_status: str
    feedback: Optional[str] = None
    created_at: datetime

class ContentCreate(BaseModel):
    title: str
    body: str
    platform: str = "linkedin"
    format: str = "Post"
    language: str = "English"
    tone: str = "Professional"
    campaign_id: Optional[str] = None

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    platform: Optional[str] = None
    format: Optional[str] = None
    language: Optional[str] = None
    tone: Optional[str] = None
    campaign_id: Optional[str] = None
    scheduled_at: Optional[str] = None

class TransitionRequest(BaseModel):
    action: str  # "submit_review", "approve", "request_changes", "reject", "schedule"
    feedback: Optional[str] = None
    scheduled_at: Optional[str] = None

class ContentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workspace_id: str
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = None
    created_by: str
    author_name: str = ""
    author_role: str = ""
    title: str
    body: str
    platform: str
    format: str
    language: str
    tone: str
    status: str
    scheduled_at: Optional[str] = None
    version: int
    created_at: datetime
    updated_at: datetime
    comments: List[CommentOut] = []
    workflow_events: List[WorkflowEventOut] = []
