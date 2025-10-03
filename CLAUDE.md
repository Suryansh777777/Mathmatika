# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mathematiks** is a full-stack AI-powered research application with a Next.js frontend and FastAPI backend. The backend uses Exa for web search and Cerebras LLM for AI analysis, implementing multiple research strategies including basic, deep (two-layer), and multi-agent approaches.

## Architecture

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15.4.4 with App Router
- **Styling**: Tailwind CSS 4 with PostCSS
- **TypeScript**: Strict mode enabled, target ES2017
- **Path Alias**: `@/*` maps to project root
- **Entry Point**: `app/page.tsx` (main page), `app/layout.tsx` (root layout)
- **State Management**: TanStack Query (React Query) v5 for server state
- **API Client**: openapi-fetch with auto-generated TypeScript types
- **Dev Tools**: React Query DevTools for debugging queries/mutations

### Backend (FastAPI + Python)
- **Location**: `api/` directory (separate from Next.js app)
- **Framework**: FastAPI with uvicorn server
- **Python Version**: 3.12+
- **Package Manager**: uv (see `uv.lock`)
- **Main File**: `api/src/main.py`
- **Key Dependencies**:
  - `fastapi[standard]` - Web framework
  - `exa-py` - Web search API client
  - `cerebras-cloud-sdk` - LLM inference
  - `python-dotenv` - Environment variable management
  - `pydantic` - Data validation
  - `ruff` - Linting/formatting

### API Endpoints
The backend exposes three research endpoints:

1. **POST /research** - Basic web search + AI synthesis (5 sources, 2-3 sentence summary + 3 insights)
2. **POST /deep-research** - Two-layer research with follow-up query (initial 6 sources + 4 follow-up sources)
3. **POST /multi-agent-research** - Anthropic-style multi-agent approach with task decomposition and parallel execution

All endpoints accept JSON: `{"query": "research question"}`

### Environment Configuration
Backend requires two API keys in `.env` file (use `.env.example` as template):
- `EXA_API_KEY` - For web search
- `CEREBRAS_API_KEY` - For LLM inference

## Development Commands

### Frontend
```bash
# Development server (with Turbopack)
bun run dev

# API development server (Python/FastAPI)
bun run dev:api

# Production build
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Generate OpenAPI schema and TypeScript types
bun run openapi  # (requires API server running)

# Or step-by-step:
bun run openapi:fetch     # Fetch OpenAPI schema from running API
bun run openapi:generate  # Generate TypeScript types from schema
```

### Backend
```bash
# Navigate to API directory
cd api

# Run development server (from api/)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Install dependencies with uv
uv pip install -e .

# Format with ruff
ruff format .

# Lint with ruff
ruff check .
```

## Key Implementation Details

### Multi-Agent Research Pattern
The `/multi-agent-research` endpoint implements a three-stage process:
1. **Lead Agent**: Decomposes query into 3 subtasks (fundamentals, recent developments, applications)
2. **Parallel Subagents**: Each performs targeted search (2 sources per subtask)
3. **Lead Agent Synthesis**: Combines findings into executive summary with integrated insights

### LLM Configuration
- Model: `llama-4-scout-17b-16e-instruct` (Cerebras)
- Max tokens: 600
- Temperature: 0.2 (deterministic responses)

### Search Strategy
- Exa API with `type="auto"` for intelligent search
- Max 1000 characters per source
- Minimum 200 characters filter for quality sources

## Code Conventions

- TypeScript strict mode enforced
- React Server Components by default (Next.js App Router)
- Font: Geist Sans + Geist Mono (optimized via `next/font`)
- CSS: Utility-first with Tailwind, global styles in `app/globals.css`
- Python: Type hints with Pydantic models for API contracts

## TanStack Query + OpenAPI Integration

### Architecture Overview
The frontend uses an industry-standard OpenAPI → TypeScript → TanStack Query workflow:

1. **FastAPI** generates OpenAPI 3.1 schema with full request/response types
2. **openapi-typescript** generates TypeScript types from schema (`lib/api/schema.ts`)
3. **openapi-fetch** provides type-safe HTTP client (`lib/api/client.ts`)
4. **TanStack Query** hooks wrap API calls with caching/state management (`lib/api/hooks.ts`)

### File Structure
```
lib/api/
├── schema.ts    # Auto-generated TypeScript types from OpenAPI schema
├── client.ts    # Type-safe API client (openapi-fetch)
└── hooks.ts     # TanStack Query hooks for each endpoint

app/
└── providers.tsx  # QueryClientProvider with optimized defaults
```

### Usage Pattern

#### Basic Usage
```tsx
import { useResearch } from "@/lib/api/hooks";

function ResearchForm() {
  const research = useResearch();

  const handleSubmit = (query: string) => {
    research.mutate({ query }, {
      onSuccess: (data) => {
        console.log(data.response);  // Fully typed!
      },
    });
  };

  return (
    <div>
      {research.isPending && <p>Researching...</p>}
      {research.isError && <p>Error: {research.error.message}</p>}
      {research.data && <pre>{research.data.response}</pre>}
    </div>
  );
}
```

#### Available Hooks
- `useResearch()` - Basic research (5 sources)
- `useDeepResearch()` - Two-layer research (6+4 sources)
- `useMultiAgentResearch()` - Multi-agent parallel research

### TanStack Query Configuration
Default settings in `app/providers.tsx`:
- **staleTime**: 60s (data fresh for 1 minute)
- **gcTime**: 5min (cache garbage collection)
- **refetchOnWindowFocus**: true (auto-refresh on tab focus)
- **retry**: 3 attempts with exponential backoff (queries), 1 attempt (mutations)

### Regenerating Types
When API schema changes:
1. Start API server: `bun run dev:api`
2. In new terminal: `bun run openapi`
3. Types in `lib/api/schema.ts` auto-update
4. TypeScript will catch any breaking changes immediately

### CORS Configuration
FastAPI configured to allow requests from `http://localhost:3000` (Next.js dev server). Update `api/src/main.py` for production origins.

### Environment Variables
- `NEXT_PUBLIC_API_URL` - API base URL (defaults to `http://localhost:8000`)
