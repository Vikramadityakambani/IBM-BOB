import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from .base import Base

class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    tone = Column(String(100), nullable=False, default="Thought-Leadership")
    audience = Column(Text, nullable=False)
    preferred_terms = Column(Text, nullable=False, default="[]")  # JSON encoded list of strings
    prohibited_phrases = Column(Text, nullable=False, default="[]")  # JSON encoded list of strings
    style_guidelines = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
