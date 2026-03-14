---
sidebar_position: 2
---

# API Endpoints

All endpoints are under the `/api/todos` base path.

## List Todos

```
GET /api/todos
```

Returns all todos sorted by creation date (newest first).

**Response** `200 OK`:
```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "title": "Buy groceries",
      "completed": false,
      "createdAt": "2026-03-14T10:00:00.000Z",
      "updatedAt": "2026-03-14T10:00:00.000Z"
    }
  ]
}
```

---

## Create Todo

```
POST /api/todos
```

**Request body:**
```json
{
  "title": "Buy groceries"
}
```

- `title` is required, must be 1-200 characters, and is trimmed.
- No other fields are accepted in the body.

**Response** `201 Created`:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": "2026-03-14T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:00:00.000Z"
  }
}
```

---

## Update Todo

```
PATCH /api/todos/:id
```

**Request body** (at least one field required):
```json
{
  "title": "Buy organic groceries",
  "completed": true
}
```

- `title`: optional, 1-200 characters, trimmed.
- `completed`: optional, must be boolean.
- No other fields are accepted.

**Response** `200 OK`:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "title": "Buy organic groceries",
    "completed": true,
    "createdAt": "2026-03-14T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:05:00.000Z"
  }
}
```

**Error** `404 Not Found`:
```json
{
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "Todo not found"
  }
}
```

---

## Delete Todo

```
DELETE /api/todos/:id
```

**Response** `200 OK`:
```json
{
  "data": {
    "id": "a1b2c3d4-..."
  }
}
```

**Error** `404 Not Found`:
```json
{
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "Todo not found"
  }
}
```
