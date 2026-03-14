---
description: "Architecture and API contract for the ToDo system"
---

## System architecture

- React UI calls the Node API via HTTP only.
- API owns validation, IDs, timestamps, and persistence.

## Todo model (server-owned)

- id: string
- title: string (1..200 chars, trimmed)
- completed: boolean
- createdAt: ISO string
- updatedAt: ISO string

## Required features

- List todos
- Create todo
- Toggle completed
- Edit title
- Delete todo
