from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class BrandProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workspace_id: str
    name: str
    tone: str
    audience: str
    preferred_terms: List[str]
    prohibited_phrases: List[str]
    style_guidelines: str

class BrandProfileUpdate(BaseModel):
    name: Optional[str] = None
    tone: Optional[str] = None
    audience: Optional[str] = None
    preferred_terms: Optional[List[str]] = None
    prohibited_phrases: Optional[List[str]] = None
    style_guidelines: Optional[str] = None
