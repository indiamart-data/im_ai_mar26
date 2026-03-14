---
sidebar_position: 2
---

# Testing

## Running Tests

```bash
# Run all tests (API + Web)
npm test

# Run API tests only
cd apps/api && npm test

# Run Web tests only
cd apps/web && npm test
```

## API Tests

**Location:** `apps/api/tests/`

**Stack:** Node.js built-in test runner + supertest + mongodb-memory-server

### Approach

- Uses `mongodb-memory-server` to spin up an isolated in-memory MongoDB instance per test run — no external database dependency.
- Tests are written in **AAA pattern** (Arrange, Act, Assert).
- HTTP assertions via `supertest` against the Express app.

### What's Tested

- Empty list returns `[]` on startup
- `POST` creates a todo with auto-generated `id` and `completed: false`
- `PATCH` toggles the `completed` flag
- `DELETE` removes a todo, verified by subsequent `GET`

---

## Web Tests

**Location:** `apps/web/tests/`

**Stack:** Vitest + React Testing Library + jsdom

### Approach

- API client methods are mocked — tests never hit a real server.
- Tests focus on **user interactions**, not implementation details.
- `@testing-library/jest-dom` provides DOM assertion matchers.
- Automatic cleanup after each test.

### What's Tested

- Shows empty state when no todos exist
- User can type into the input and add a todo
- Created todo appears in the list

### Test Configuration

Vitest config is in `apps/web/vite.config.js` with jsdom environment. Setup file at `apps/web/src/test/setup.js` imports jest-dom matchers.
