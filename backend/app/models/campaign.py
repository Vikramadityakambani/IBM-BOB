import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from .base import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    objective = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="active")  # planning, active, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
