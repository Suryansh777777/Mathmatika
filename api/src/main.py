"""
Main FastAPI application for Mathmatika Research API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Import routers
from src.manim.router import router as manim_router
from src.chat.router import router as chat_router
from src.research.router import router as research_router
from src.rag.router import router as rag_router
from src.voice.router import router as voice_router

app = FastAPI(
    title="Mathmatika Research API",
    description="AI-powered research API with multi-agent capabilities, RAG, and Manim visualization",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "chat",
            "description": "Streaming chat endpoints for conversational AI"
        },
        {
            "name": "research",
            "description": "Research endpoints with varying depth and strategies"
        },
        {
            "name": "rag",
            "description": "RAG (Retrieval-Augmented Generation) for PDF Q&A with Pinecone vector storage"
        },
        {
            "name": "manim",
            "description": "Manim animation generation for mathematical concepts"
        },
        {
            "name": "voice",
            "description": "Voice synthesis (TTS) and transcription (STT) endpoints"
        }
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(manim_router)
app.include_router(chat_router)
app.include_router(research_router)
app.include_router(rag_router)
app.include_router(voice_router)

# Mount static files for video serving (if directory exists)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
