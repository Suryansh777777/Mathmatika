# API Client

This directory contains the type-safe API client implementation using OpenAPI and TanStack Query.

## Files

- **`schema.ts`** - Auto-generated TypeScript types from OpenAPI schema (DO NOT EDIT MANUALLY)
- **`client.ts`** - Type-safe HTTP client using openapi-fetch
- **`hooks.ts`** - TanStack Query hooks for each API endpoint

## Regenerating Schema

When the backend API changes, regenerate the schema:

```bash
# 1. Start the API server
bun run dev:api

# 2. In a new terminal, generate types
bun run openapi
```

This will:
1. Fetch the OpenAPI schema from `http://localhost:8000/openapi.json`
2. Generate TypeScript types into `schema.ts`
3. TypeScript will immediately catch any breaking changes

## Usage

```tsx
import { useResearch } from "@/lib/api/hooks";

function MyComponent() {
  const research = useResearch();

  const handleSearch = () => {
    research.mutate({ query: "What is AI?" }, {
      onSuccess: (data) => console.log(data),
      onError: (error) => console.error(error),
    });
  };

  return (
    <button onClick={handleSearch} disabled={research.isPending}>
      {research.isPending ? "Researching..." : "Search"}
    </button>
  );
}
```

## Available Hooks

- `useResearch()` - Basic research endpoint
- `useDeepResearch()` - Two-layer deep research
- `useMultiAgentResearch()` - Multi-agent parallel research
