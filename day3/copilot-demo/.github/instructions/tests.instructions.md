---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
description: "Testing rules for ToDo monorepo"
---

- Follow AAA: Arrange → Act → Assert.
- Tests must be deterministic and parallel-safe.
- No real external network calls.

## API tests

- Use supertest for endpoint tests.
- Use a temp test data file (never apps/api/data/todos.json).
- Reset file contents between tests.

## Web tests

- Use Testing Library.
- Prefer user-event interactions.
- Validate loading/error/empty states and core flows.
