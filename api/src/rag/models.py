"""
Pydantic models for RAG API.
"""
from pydantic import BaseModel, Field

class PDFUploadResponse(BaseModel):
    success: bool = Field(..., description="Whether the upload was successful")
    message: str = Field(..., description="Status message")
    filename: str = Field(..., description="Name of the uploaded file")
    chunks: int = Field(..., description="Number of text chunks indexed")
    index_name: str = Field(..., description="Pinecone index name")

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Question to ask about the PDF", min_length=3)
    index_name: str = Field(default="pdf-index", description="Pinecone index to query")

class SourceDocument(BaseModel):
    content: str = Field(..., description="Text content of the source chunk")
    page: int = Field(default=0, description="Page number in the PDF")

class RAGQueryResponse(BaseModel):
    query: str = Field(..., description="Original query")
    answer: str = Field(..., description="Generated answer")
    sources: list[SourceDocument] = Field(default_factory=list, description="Source documents used")
    index_name: str = Field(..., description="Index that was queried")

class IndexInfo(BaseModel):
    name: str = Field(..., description="Index name")
    dimension: int = Field(..., description="Vector dimension")
    metric: str = Field(..., description="Distance metric")
    vector_count: int = Field(default=0, description="Number of vectors in index")

class IndexListResponse(BaseModel):
    indexes: list[IndexInfo] = Field(default_factory=list, description="Available indexes")
