"""
FastAPI router for chat endpoints.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.chat.models import ChatRequest
from src.chat.service import ChatService

# Create router with prefix
router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

# Initialize service
chat_service = ChatService()

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint with conversation history

    - Accepts user message and conversation history
    - Streams AI responses in real-time using SSE
    - Maintains context across conversation turns
    - Uses Cerebras LLM for fast inference
    """
    return StreamingResponse(
        chat_service.stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )