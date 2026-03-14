---
sidebar_position: 1
---

# Architecture Overview

The application follows a classic client-server architecture with clear separation of concerns.

```
┌─────────────────┐       HTTP/JSON        ┌─────────────────┐
│                 │  ◄──────────────────►   │                 │
│   React SPA     │      /api/todos         │  Express API    │
│   (apps/web)    │                         │  (apps/api)     │
│                 │                         │                 │
└─────────────────┘                         └────────┬────────┘
                                                     │
                                                     │ Mongoose
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB       │
                                            └─────────────────┘
```

## Design Patterns

### API Layer (MVC-like)

```
Request → Routes → Controller → Storage → MongoDB
                        │
                    Validation
                    (lib/validate.js)
```

- **Routes** define HTTP verbs and paths, wrapping handlers in `asyncRoute()` for error propagation.
- **Controllers** validate input, call storage functions, and format responses.
- **Storage** contains data access logic using the Mongoose model.
- **Error handling** is centralized via middleware — controllers throw `AppError` instances caught by `errorHandler`.

### Web Layer (Hooks + Components)

```
App.jsx
  ├── useTodos()     ← business logic & state
  ├── useToast()     ← notification state
  ├── TodoForm       ← input
  ├── TodoFilters    ← filter controls
  ├── TodoList       ← display
  │     └── TodoItem ← individual todo (edit, toggle, delete)
  ├── TodoSkeleton   ← loading state
  ├── EmptyState     ← empty state
  └── ToastContainer ← notifications
```

- **Custom hooks** (`useTodos`, `useToast`) encapsulate all business logic and state management.
- **Components** are purely presentational, receiving data and callbacks via props.
- **API client** (`src/api/client.js`) is a single module handling all HTTP communication.

### Optimistic Updates

The web app applies state changes immediately before the API responds:

1. User action triggers state update (e.g., toggle completed)
2. Previous state is saved for rollback
3. API call is made in the background
4. On failure, state is reverted and an error toast is shown
