"""
FastAPI router for research endpoints.
"""

from fastapi import APIRouter

from src.research.models import ResearchRequest, ResearchResponse, MultiAgentResearchResponse
from src.research.service import ResearchService

# Create router with prefix
router = APIRouter(
    prefix="/research",
    tags=["research"],
    responses={404: {"description": "Not found"}},
)

# Initialize service
research_service = ResearchService()

@router.post("/", response_model=ResearchResponse)
def research_topic(request: ResearchRequest):
    """
    Basic research with AI synthesis

    - Searches 5 web sources
    - Returns 2-3 sentence summary
    - Provides 3 key insights
    """
    return research_service.research_topic(request)

@router.post("/deep", response_model=ResearchResponse)
def deeper_research_topic(request: ResearchRequest):
    """
    Two-layer research for better depth

    - Layer 1: Initial search (6 sources)
    - AI identifies follow-up question
    - Layer 2: Follow-up search (4 sources)
    - Final synthesis with depth analysis
    """
    return research_service.deeper_research_topic(request)

@router.post("/multi-agent", response_model=MultiAgentResearchResponse)
def multi_agent_research(request: ResearchRequest):
    """
    Multi-agent research with parallel execution

    - Lead agent decomposes query into 3 subtasks
    - 3 specialized subagents work in parallel
    - Each subagent searches 2 sources
    - Lead agent synthesizes all findings
    - Returns executive summary and integrated insights
    """
    return research_service.multi_agent_research(request)