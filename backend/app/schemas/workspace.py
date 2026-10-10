from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class WorkspaceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    members_count: int = 1

class MembershipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workspace_id: str
    user_id: str
    user_name: str
    user_email: str
    role: str
