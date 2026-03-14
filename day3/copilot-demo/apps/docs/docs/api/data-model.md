---
sidebar_position: 3
---

# Data Model

## Todo Schema (Mongoose)

Defined in `apps/api/src/models/todo.model.js`:

```javascript
const todoSchema = new Schema({
  _id: {
    type: String,
    default: () => crypto.randomUUID(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,  // auto-generates createdAt, updatedAt
});
```

## Fields

| Field       | Type    | Default           | Description                        |
| ----------- | ------- | ----------------- | ---------------------------------- |
| `id`        | String  | UUID (auto)       | Primary key, generated server-side |
| `title`     | String  | —                 | Todo text, 1-200 chars, trimmed    |
| `completed` | Boolean | `false`           | Whether the todo is done           |
| `createdAt` | Date    | auto              | Mongoose timestamp                 |
| `updatedAt` | Date    | auto              | Mongoose timestamp, updates on save|

## JSON Serialization

The `toJSON` transform maps `_id` to `id` and removes the Mongoose `__v` field, so API responses use clean field names:

```json
{
  "id": "a1b2c3d4-...",
  "title": "Example",
  "completed": false,
  "createdAt": "2026-03-14T10:00:00.000Z",
  "updatedAt": "2026-03-14T10:00:00.000Z"
}
```

## Database Connection

Connection is managed in `apps/api/src/db/connection.js`:

- **`connectDB(uri?)`** — Connects to MongoDB. Uses `MONGODB_URI` env var or the provided URI (used for testing with `mongodb-memory-server`).
- **`disconnectDB()`** — Closes the connection gracefully.
