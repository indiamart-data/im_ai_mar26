---
applyTo: "apps/api/**/*.{ts,js}"
description: "File-based JSON persistence rules"
---

## Storage file

- Store todos in: apps/api/data/todos.json (or via env var TODO_DATA_FILE)
- If folder/file doesn't exist, create it safely.

## File format

{ "todos": [ { "id": "...", "title": "...", "completed": false, "createdAt": "...", "updatedAt": "..." } ] }

## Concurrency + atomicity (must)

- Serialize writes using an in-process queue/lock to avoid corruption.
- Write atomically: write temp file -> rename/replace target file.
- Use fs/promises for all filesystem operations.

## Sorting

- Return todos newest-first by createdAt.
