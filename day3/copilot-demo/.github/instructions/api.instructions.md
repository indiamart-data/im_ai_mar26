---
applyTo: "apps/api/**/*.{ts,js}"
description: "Node/Express API rules for apps/api"
---

## Express rules

- Use async/await only.
- Implement centralized error handling middleware (registered last).
- Validate request body/params/query for every endpoint.
- Return consistent JSON responses (success and error).

## REST endpoints (required)

- GET    /api/todos
- POST   /api/todos
- PATCH  /api/todos/:id     (partial update: title/completed)
- DELETE /api/todos/:id

## Response shape

Success:
{ "data": <payload> }

Error:
{ "error": { "code": "<CODE>", "message": "<safe message>" } }

## Error codes

- VALIDATION_ERROR (400)
- TODO_NOT_FOUND (404)
- INTERNAL_ERROR (500)

## Security

- Never log secrets or full request bodies.
- Do not trust client-provided ids or timestamps.
