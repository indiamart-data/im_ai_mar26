---
sidebar_position: 1
---

# Web App Overview

The web app is a React 18 single-page application built with Vite and styled with TailwindCSS.

## Architecture

```
main.jsx → App.jsx
              ├── useTodos()        (state + API calls)
              ├── useToast()        (notifications)
              │
              ├── TodoForm          (input)
              ├── TodoFilters       (all / active / completed)
              ├── TodoList
              │     └── TodoItem    (toggle, edit, delete)
              ├── TodoSkeleton      (loading placeholder)
              ├── EmptyState        (no todos)
              └── ToastContainer    (success / error toasts)
```

## Key Patterns

- **Functional components only** — no class components.
- **Custom hooks** encapsulate all business logic; components are purely presentational.
- **Every view handles three states**: loading, empty, and error.
- **Semantic HTML** with accessibility attributes (`aria-labels`, `aria-live` for toasts).
- **BEM-like CSS** class naming (no inline styles).

## API Communication

All HTTP calls go through a single module at `src/api/client.js`:

```javascript
import { apiClient } from '../api/client';

await apiClient.listTodos();
await apiClient.createTodo('Buy groceries');
await apiClient.updateTodo(id, { completed: true });
await apiClient.deleteTodo(id);
```

The base URL defaults to `http://localhost:3001` and can be configured via the `VITE_API_URL` environment variable.

## Environment Variables

| Variable       | Default                  | Description     |
| -------------- | ------------------------ | --------------- |
| `VITE_API_URL` | `http://localhost:3001`  | API base URL    |
