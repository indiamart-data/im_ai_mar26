# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (from root)
npm run dev           # Run API + web concurrently
npm run dev:api       # API only (node --watch)
npm run dev:web       # Web only (Vite dev server)

# Build
npm run build         # Build web app (Vite)

# Tests
npm test              # Run all tests
cd apps/api && npm test   # API tests only (Node.js test runner)
cd apps/web && npm test   # Web tests only (Vitest)
```

## Architecture

Monorepo with two apps managed via npm workspaces:

- **`apps/api`** — Express.js REST API. MVC-like structure: `routes/` → `controllers/` → `storage/`. Data persisted to a JSON file (`data/todos.json`, configurable via `TODO_DATA_FILE` env var). Uses atomic writes (temp file → rename) with a write queue to prevent corruption.
- **`apps/web`** — React 18 + Vite SPA. Component-based with custom hooks (`useTodos`) for business logic. Single API client module at `src/api/client.js`. Uses optimistic UI updates with rollback on failure.

**Key constraint:** `apps/web` must never do filesystem or direct persistence — `apps/api` is the single source of truth. The API owns ID generation, timestamps, and validation.

## API Conventions

- All endpoints under `/api/todos` (GET, POST, PATCH `:id`, DELETE `:id`)
- Success response: `{ "data": <payload> }` — Error response: `{ "error": { "code": "<CODE>", "message": "..." } }`
- Error codes: `VALIDATION_ERROR` (400), `TODO_NOT_FOUND` (404), `INTERNAL_ERROR` (500)
- Todo title: 1-200 chars, trimmed. Server generates `id` (UUID), `createdAt`, `updatedAt`
- Async/await only, centralized error handling middleware

## Web Conventions

- Functional components only, React Hooks (no class components)
- Custom hooks for business logic, components for UI
- Every view must handle loading, empty, and error states
- CSS classes with BEM-like naming (no inline styles)
- Semantic HTML with accessibility attributes (aria-labels, form structure)

## Testing Patterns

- **API:** supertest for HTTP tests, temporary JSON file per test (not production data), AAA pattern (Arrange → Act → Assert)
- **Web:** @testing-library/react + Vitest with jsdom, test user interactions not implementation details

## Environment Variables

- API: `PORT` (default 3001), `TODO_DATA_FILE` (default `./data/todos.json`)
- Web: `VITE_API_URL` (default `http://localhost:3001`)

## Copilot/AI Guidance

Detailed domain-specific instructions live in `.github/instructions/` (architecture, monorepo rules, API specs, web patterns, testing, file storage). Prompt templates in `.github/prompts/`.
