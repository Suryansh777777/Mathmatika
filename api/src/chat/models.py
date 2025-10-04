"""
Pydantic models for Chat API.
"""
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message", min_length=1)
    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation messages for context"
    )
