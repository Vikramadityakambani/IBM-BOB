import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=True, index=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    platform = Column(String(50), nullable=False, default="linkedin")
    format = Column(String(100), nullable=False, default="Article")
    language = Column(String(50), nullable=False, default="English")
    tone = Column(String(100), nullable=False, default="Professional")
    status = Column(String(50), nullable=False, default="draft", index=True)  # draft, in_review, approved, scheduled, rejected
    scheduled_at = Column(String(50), nullable=True)
    version = Column(Integer, default=1)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    comments = relationship("Comment", back_populates="content_item", cascade="all, delete-orphan", order_by="Comment.created_at.desc()")
    workflow_events = relationship("WorkflowEvent", back_populates="content_item", cascade="all, delete-orphan", order_by="WorkflowEvent.created_at.desc()")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content_items.id"), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    content_item = relationship("ContentItem", back_populates="comments")

class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content_items.id"), nullable=False, index=True)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    actor_name = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    content_item = relationship("ContentItem", back_populates="workflow_events")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(36), nullable=False)
    details = Column(Text, nullable=True)  # JSON representation
    request_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
