# Mathmatika

> AI-Powered Mathematics Learning Platform with Research, RAG, and Video Generation

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.118+-green)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Core Modules](#core-modules)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Mathmatika** is a comprehensive mathematics learning platform that combines AI-powered research, document processing, interactive chat, voice mentorship, and video generation to transform how students learn mathematics. The platform enables users to upload materials, ask questions, and receive structured notes, educational videos, and interactive assessments—all powered by cutting-edge AI technology.

### Vision

Enable students to learn mathematics more effectively by providing AI-powered content generation, personalized explanations, and active learning tools in a unified, intelligent workflow.

---

## Features

### 🔬 AI Research Modes

- **Basic Research**: Quick web search + AI synthesis (5 sources, 2-3 sentence summary + 3 insights)
- **Deep Research**: Two-layer research with follow-up queries (6 + 4 sources)
- **Multi-Agent Research**: Anthropic-style parallel task decomposition and synthesis

### 📚 RAG (Retrieval-Augmented Generation)

- PDF document processing with PyMuPDF
- Pinecone vector database integration
- Semantic search with HuggingFace embeddings
- Context-aware question answering

### 💬 Interactive Chat

- Real-time conversational AI interface
- LaTeX equation rendering with KaTeX
- Markdown support with syntax highlighting
- Streaming responses for better UX

### 🎬 Video Generation

- Manim integration for mathematical visualizations
- Automated educational video creation
- LaTeX-to-animation pipeline

### 🎨 Modern UI/UX

- Dark/light theme support with `next-themes`
- Radix UI components for accessibility
- Framer Motion animations
- Responsive design for all devices

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│        ┌────────────┬──────────────┬──────────────┐         │
│        │ Research   │ Chat UI      │ Video Player │         │
│        │ Interface  │ (Markdown)   │ (Manim)      │         │
│        └────────────┴──────────────┴──────────────┘         │
│                  TanStack Query + OpenAPI Client            │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend (FastAPI)                        │
│     ┌──────────────┬──────────────┬──────────────┐          │
│     │ Research     │ RAG Engine   │ Manim        │          │
│     │ Endpoints    │ (Pinecone)   │ Service      │          │
│     └──────────────┴──────────────┴──────────────┘          │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐   ┌──────▼──────┐   ┌────────▼────────┐
│ Cerebras LLM   │   │ Exa Search  │   │ Pinecone Vector │
│ (Llama 4)      │   │ API         │   │ Database        │
└────────────────┘   └─────────────┘   └─────────────────┘
```

---

## Tech Stack

### Frontend

| Technology         | Purpose                         | Version |
| ------------------ | ------------------------------- | ------- |
| **Next.js**        | React framework with App Router | 15.4.4  |
| **React**          | UI library                      | 19.1.0  |
| **TypeScript**     | Type safety                     | 5.x     |
| **TanStack Query** | Server state management         | 5.90.2  |
| **Tailwind CSS**   | Styling framework               | 4.x     |
| **openapi-fetch**  | Type-safe API client            | 0.14.1  |
| **Radix UI**       | Accessible components           | Latest  |
| **KaTeX**          | LaTeX rendering                 | 0.16.23 |
| **Framer Motion**  | Animations                      | 12.x    |

### Backend

| Technology       | Purpose              | Version |
| ---------------- | -------------------- | ------- |
| **FastAPI**      | Python web framework | 0.118+  |
| **Uvicorn**      | ASGI server          | Latest  |
| **Cerebras SDK** | LLM inference        | 0.1.3   |
| **Exa**          | Web search API       | 1.0.10  |
| **Pinecone**     | Vector database      | 7.3.0   |
| **LangChain**    | LLM orchestration    | Latest  |
| **PyMuPDF**      | PDF processing       | 1.24.1  |
| **Manim**        | Animation engine     | 0.18.0  |
| **Pydantic**     | Data validation      | 2.11.9  |

### Development Tools

- **Bun** - Fast JavaScript runtime and package manager
- **uv** - Python package manager
- **Ruff** - Fast Python linter/formatter
- **ESLint** - JavaScript/TypeScript linting
- **Git** - Version control

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ or **Bun** 1.0+
- **Python** 3.12+
- **uv** (Python package manager) - [Install Guide](https://github.com/astral-sh/uv)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/suryansh777777/mathmatika.git
   cd mathmatika
   ```

2. **Install frontend dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   uv pip install -e .
   cd ..
   ```

### Environment Setup

1. **Copy environment template**

   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**

   Edit `.env` and add your API keys:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Configure backend API keys**

   Create `api/.env`:

   ```env
   # Required API Keys
   EXA_API_KEY=your_exa_api_key
   CEREBRAS_API_KEY=your_cerebras_api_key

   # Optional (for RAG features)
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   ```

#### API Key Providers

- **Cerebras** - [cerebras.ai](https://cerebras.ai) - AI inference
- **Exa** - [exa.ai](https://exa.ai) - Web search API
- **Pinecone** - [pinecone.io](https://pinecone.io) - Vector database

---

## Development

### Running the Development Servers

**Option 1: Run both servers separately**

Terminal 1 (Frontend):

```bash
bun run dev
```

Terminal 2 (Backend):

```bash
bun run dev:api
# or manually:
cd api && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 2: Use process manager (recommended)**

```bash
# Add to package.json scripts:
"dev:all": "concurrently \"bun run dev\" \"bun run dev:api\""

# Then run:
bun run dev:all
```

### Available Scripts

#### Frontend

```bash
bun run dev              # Start Next.js dev server (with Turbopack)
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Lint code with ESLint
bun run openapi          # Generate TypeScript types from OpenAPI schema
```

#### Backend

```bash
cd api

# Development
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Linting & Formatting
ruff check .             # Lint Python code
ruff format .            # Format Python code

# Testing
pytest                   # Run tests (if configured)
```

### Regenerating API Types

When you modify the FastAPI backend schema:

1. Start the API server: `bun run dev:api`
2. In a new terminal: `bun run openapi`
3. TypeScript types in `lib/api/schema.ts` will auto-update

---

## Project Structure

```
mathmatika/
├── app/                        # Next.js App Router
│   ├── (dashboard)/           # Dashboard routes (grouped)
│   ├── (landing)/             # Landing page routes
│   ├── api/                   # Next.js API routes
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── not-found.tsx          # 404 page
│
├── components/                # React components
│   ├── ui/                    # Base UI components (Radix)
│   ├── chat/                  # Chat interface components
│   └── research/              # Research UI components
│
├── lib/                       # Shared utilities
│   ├── api/                   # API client & hooks
│   │   ├── client.ts          # Type-safe openapi-fetch client
│   │   ├── schema.ts          # Auto-generated TypeScript types
│   │   └── hooks.ts           # TanStack Query hooks
│   └── utils.ts               # Helper functions
│
├── hooks/                     # Custom React hooks
│
├── providers/                 # React context providers
│   └── query-client.tsx       # TanStack Query setup
│
├── api/                       # FastAPI backend
│   ├── src/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── research/          # Research endpoints & logic
│   │   ├── rag/               # RAG (PDF processing, vector DB)
│   │   ├── chat/              # Chat endpoints
│   │   └── manim/             # Video generation (Manim)
│   ├── pyproject.toml         # Python dependencies
│   └── uv.lock                # uv lockfile
│
├── public/                    # Static assets
├── styles/                    # Additional CSS
│
├── .env.example               # Environment template
├── CLAUDE.md                  # Developer instructions for AI
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── README.md                  # This file
```

---

## API Documentation

### Research Endpoints

#### `POST /research`

Basic web search + AI synthesis

**Request:**

```json
{
  "query": "What is calculus?"
}
```

**Response:**

```json
{
  "response": "2-3 sentence summary with 3 key insights...",
  "sources": [...],
  "processing_time": 2.3
}
```

#### `POST /deep-research`

Two-layer research with follow-up queries

**Request:**

```json
{
  "query": "Explain differential equations"
}
```

**Response:**

```json
{
  "initial_synthesis": "...",
  "follow_up_synthesis": "...",
  "combined_insights": "...",
  "sources": [...]
}
```

#### `POST /multi-agent-research`

Multi-agent parallel research

**Request:**

```json
{
  "query": "Applications of linear algebra"
}
```

**Response:**

```json
{
  "executive_summary": "...",
  "subtask_results": [...],
  "integrated_insights": [...]
}
```

### RAG Endpoints

#### `POST /upload-pdf`

Upload and process PDF documents

#### `POST /query-documents`

Query processed documents with semantic search

### Chat Endpoints

#### `POST /chat`

Interactive chat with AI mentor

#### `GET /chat/history/{session_id}`

Retrieve chat history

### OpenAPI Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Core Modules

### Research Engine

Powered by **Exa** (web search) + **Cerebras LLM** (Llama 4)

- **Basic**: Single-pass synthesis
- **Deep**: Two-layer with refinement
- **Multi-Agent**: Parallel subtask decomposition

### RAG System

- **PDF Processing**: PyMuPDF for text extraction
- **Embeddings**: HuggingFace sentence-transformers
- **Vector Store**: Pinecone with semantic search
- **Chain**: LangChain for orchestration

### Video Generation

- **Engine**: Manim Community Edition
- **Workflow**: LaTeX → Scene → MP4
- **Use Cases**: Educational visualizations

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: Ruff (Google style)
- **Commits**: Conventional Commits format

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Cerebras** - Ultra-fast LLM inference
- **Exa** - Intelligent web search
- **Anthropic** - Multi-agent research inspiration
- **Manim Community** - Mathematical animations

---

## Support

For questions or issues:

- **GitHub Issues**: [Create an issue](https://github.com/suryansh777777/mathmatika/issues)
- **Documentation**: See `/docs` directory (if available)
- **Developer Guide**: See `CLAUDE.md`

---

**Built with ❤️ for mathematics education**
