"""
Core RAG service for PDF processing and question answering.
"""

import os
import json
import uuid
from typing import AsyncGenerator
from pathlib import Path

from pinecone import Pinecone, ServerlessSpec
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

from src.rag.models import PDFUploadResponse, RAGQueryRequest, SourceDocument, IndexInfo

# Load environment variables
load_dotenv()

# Get API keys from environment
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Check if API keys are set
if not CEREBRAS_API_KEY:
    raise RuntimeError("CEREBRAS_API_KEY must be set in .env file")
if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY must be set in .env file")

# Initialize clients
cerebras_client = Cerebras(api_key=CEREBRAS_API_KEY)
pinecone_client = Pinecone(api_key=PINECONE_API_KEY)

# Initialize embeddings (using sentence-transformers via HuggingFace)
# Using 'all-MiniLM-L6-v2' (384 dimensions) - fast and efficient
# Alternative: 'nomic-ai/nomic-embed-text-v1.5' (768 dimensions) for better quality
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'}
)

class RAGService:
    """Service for handling RAG operations."""

    def __init__(self):
        self.pc = pinecone_client
        self.embeddings = embeddings
        self.cerebras = cerebras_client
        self.embedding_dimension = 384  # for all-MiniLM-L6-v2

    def _ensure_index_exists(self, index_name: str) -> None:
        """Create Pinecone index if it doesn't exist."""
        if index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=index_name,
                dimension=self.embedding_dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud='aws',
                    region='us-east-1'
                )
            )

    async def process_pdf(self, file_path: str, filename: str, index_name: str = None) -> PDFUploadResponse:
        """Process PDF and upload to Pinecone."""
        if index_name is None:
            index_name = f"pdf-index-{uuid.uuid4()}"

        try:
            # Load PDF
            loader = PyMuPDFLoader(file_path)
            documents = loader.load()

            # Split into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            texts = text_splitter.split_documents(documents)

            # Ensure index exists
            self._ensure_index_exists(index_name)

            # Create vector store and add documents
            vector_store = PineconeVectorStore(
                index_name=index_name,
                embedding=self.embeddings
            )

            # Add texts to vector store
            vector_store.add_documents(texts)

            return PDFUploadResponse(
                success=True,
                message=f"Successfully indexed {len(texts)} chunks from {filename}",
                filename=filename,
                chunks=len(texts),
                index_name=index_name
            )

        except Exception as e:
            return PDFUploadResponse(
                success=False,
                message=f"Error processing PDF: {str(e)}",
                filename=filename,
                chunks=0,
                index_name=index_name
            )

    async def stream_query(self, request: RAGQueryRequest) -> AsyncGenerator[str, None]:
        """Stream answer to query using RAG."""
        try:
            # Check if index exists
            if request.index_name not in self.pc.list_indexes().names():
                yield f"data: {json.dumps({'error': f'Index {request.index_name} not found. Please upload a PDF first.'})}\n\n"
                return

            # Create vector store
            vector_store = PineconeVectorStore(
                index_name=request.index_name,
                embedding=self.embeddings
            )

            # Perform similarity search
            docs = vector_store.similarity_search(request.query, k=4)

            if not docs:
                yield f"data: {json.dumps({'error': 'No relevant documents found.'})}\n\n"
                return

            # Build context from retrieved documents
            context = "\n\n".join([doc.page_content for doc in docs])

            # Build messages for Cerebras
            messages = [
                {
                    "role": "system",
                    "content": """You are a helpful AI assistant that answers questions based on the provided context from PDF documents.

IMPORTANT Instructions:
- Always use the provided context to answer questions
- If the context doesn't contain the answer, say so clearly
- Use LaTeX for mathematical expressions: inline $x^2$, display $$\\frac{a}{b}$$
- Be concise but thorough in your explanations"""
                },
                {
                    "role": "user",
                    "content": f"""Context from PDF:
{context}

Question: {request.query}

Please answer the question based on the context above."""
                }
            ]

            # Stream response from Cerebras
            stream = self.cerebras.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                stream=True,
                max_tokens=1500,
                temperature=0.2
            )

            # Stream chunks
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'content': content})}\n\n"

            # Send sources information
            sources = [
                {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "page": doc.metadata.get("page", 0)
                }
                for doc in docs
            ]
            yield f"data: {json.dumps({'sources': sources})}\n\n"

            # Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            error_msg = f"Query error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"

    def list_indexes(self) -> list[IndexInfo]:
        """List all available Pinecone indexes."""
        try:
            index_list = []
            for index_name in self.pc.list_indexes().names():
                index = self.pc.Index(index_name)
                stats = index.describe_index_stats()

                index_list.append(IndexInfo(
                    name=index_name,
                    dimension=stats.get('dimension', self.embedding_dimension),
                    metric="cosine",
                    vector_count=stats.get('total_vector_count', 0)
                ))

            return index_list
        except Exception as e:
            print(f"Error listing indexes: {e}")
            return []

    async def query_documents(self, query: str, index_name: str = "pdf-index", k: int = 4):
        """
        Query documents without streaming (for agent use).

        Args:
            query: The search query
            index_name: Name of the Pinecone index to search
            k: Number of documents to return

        Returns:
            List of relevant documents from the vector store
        """
        try:
            # Check if index exists
            if index_name not in self.pc.list_indexes().names():
                print(f"Warning: Index {index_name} not found")
                return []

            # Create vector store
            vector_store = PineconeVectorStore(
                index_name=index_name,
                embedding=self.embeddings
            )

            # Perform similarity search
            docs = vector_store.similarity_search(query, k=k)
            return docs

        except Exception as e:
            print(f"Error querying documents: {e}")
            return []

    async def generate_response(self, prompt: str) -> str:
        """
        Generate response without streaming (for agent use).

        Args:
            prompt: The prompt to send to Cerebras

        Returns:
            Generated response text
        """
        try:
            response = self.cerebras.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-4-scout-17b-16e-instruct",
                max_tokens=500,
                temperature=0.2
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm sorry, I encountered an error while generating a response."
