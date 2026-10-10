from pydantic import BaseModel, ConfigDict
from typing import Optional

class CampaignCreate(BaseModel):
    name: str
    objective: str
    target_audience: str
    start_date: str
    end_date: str

class CampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workspace_id: str
    name: str
    objective: str
    target_audience: str
    start_date: str
    end_date: str
    status: str
    item_count: int = 0
