---
sidebar_position: 1
---

# API Overview

The API is an Express.js application that provides a RESTful interface for managing todos, backed by MongoDB via Mongoose.

## Request/Response Flow

```
HTTP Request
  → CORS middleware
  → JSON body parser
  → Route matching (/api/todos)
  → asyncRoute() wrapper
  → Controller (validate → storage call → response)
  → Error handler middleware (catches AppError)
```

## Response Format

All successful responses follow a consistent envelope:

```json
{
  "data": { ... }
}
```

Error responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

## Error Codes

| Code               | HTTP Status | When                          |
| ------------------ | ----------- | ----------------------------- |
| `VALIDATION_ERROR` | 400         | Invalid input                 |
| `TODO_NOT_FOUND`   | 404         | Todo with given ID not found  |
| `INTERNAL_ERROR`   | 500         | Unexpected server error       |

## Environment Variables

| Variable      | Default                                  | Description           |
| ------------- | ---------------------------------------- | --------------------- |
| `PORT`        | `3001`                                   | Server listen port    |
| `MONGODB_URI` | `mongodb://localhost:27017/todo-app`      | MongoDB connection URI|
