"""
Core Chat service for handling conversations.
"""

import os
import json
from typing import AsyncGenerator
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

from src.chat.models import ChatRequest

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# Check if API keys are set
if not CEREBRAS_API_KEY:
    raise RuntimeError("API key for Cerebras must be set in a .env file.")

# Initialize clients
client = Cerebras(api_key=CEREBRAS_API_KEY)

class ChatService:
    """Service for handling chat interactions."""

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """Stream chat responses from Cerebras"""
        try:
            # Build messages array with conversation history
            messages = []

            # Add system message
            messages.append({
                "role": "system",
                "content": """You are a helpful mathematics tutor and research assistant. Provide clear, accurate explanations and help students understand mathematical concepts.

IMPORTANT: Always use LaTeX for mathematical expressions:
- Inline math: $x^2 + 5x + 6$
- Display math: $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$
- Use proper LaTeX syntax for all equations, formulas, and mathematical symbols."""
            })

            # Add conversation history
            for msg in request.conversation_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

            # Add current user message
            messages.append({
                "role": "user",
                "content": request.message
            })

            # Create streaming completion
            stream = client.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                stream=True,
                max_tokens=1500,
                temperature=0.2
            )

            # Stream the response chunks
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    # Format as SSE (Server-Sent Events)
                    yield f"data: {json.dumps({'content': content})}\n\n"

            # Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            error_msg = f"Streaming error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"