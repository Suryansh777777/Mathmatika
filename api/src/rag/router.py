"""
FastAPI router for RAG endpoints.
"""

import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse

from src.rag.models import (
    PDFUploadResponse,
    RAGQueryRequest,
    IndexListResponse,
)
from src.rag.service import RAGService

# Create router with prefix
router = APIRouter(
    prefix="/rag",
    tags=["rag"],
    responses={404: {"description": "Not found"}},
)

# Initialize service
rag_service = RAGService()

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    file: UploadFile = File(..., description="PDF file to upload and index"),
    index_name: Optional[str] = Form(default="pdf-index", description="Name for the Pinecone index")
):
    """
    Upload and index a PDF document

    - Accepts PDF file upload
    - Processes and splits into chunks
    - Stores embeddings in Pinecone
    - Returns indexing status and metadata
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        # Write uploaded file to temp location
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name

    try:
        # Process the PDF
        result = await rag_service.process_pdf(tmp_path, file.filename, index_name)
        return result

    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.post("/query/stream")
async def query_stream(request: RAGQueryRequest):
    """
    Query indexed PDFs with streaming response

    - Performs similarity search on indexed documents
    - Retrieves relevant context
    - Streams AI-generated answer using Cerebras
    - Returns sources used for the answer
    - Uses Server-Sent Events (SSE) for real-time streaming
    """
    return StreamingResponse(
        rag_service.stream_query(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@router.get("/indexes", response_model=IndexListResponse)
async def list_indexes():
    """
    List all available Pinecone indexes

    - Returns list of indexes with metadata
    - Shows vector count and dimensions
    - Useful for checking available documents
    """
    indexes = rag_service.list_indexes()
    return IndexListResponse(indexes=indexes)
