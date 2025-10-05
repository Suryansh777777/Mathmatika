"""
Pydantic models for Research API.
"""
from pydantic import BaseModel, Field

class ResearchRequest(BaseModel):
    query: str = Field(..., description="Research query or question", min_length=3)

class ResearchResponse(BaseModel):
    query: str
    sources: int
    response: str

class MultiAgentResearchResponse(BaseModel):
    query: str
    subagents: int
    total_sources: int
    synthesis: str
