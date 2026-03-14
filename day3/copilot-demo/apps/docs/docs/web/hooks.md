---
sidebar_position: 3
---

# Custom Hooks

Business logic is encapsulated in custom hooks, keeping components purely presentational.

## useTodos

**File:** `apps/web/src/hooks/useTodos.js`

Manages all todo state and API interactions.

### State

| State       | Type     | Description                        |
| ----------- | -------- | ---------------------------------- |
| `todos`     | Array    | List of todo objects               |
| `isLoading` | Boolean  | `true` during initial fetch        |
| `error`     | String   | Error message, or `null`           |
| `filter`    | String   | `'all'`, `'active'`, or `'completed'` |

### Computed Values

| Value            | Description                              |
| ---------------- | ---------------------------------------- |
| `filteredTodos`  | Todos filtered by current filter setting |
| `activeCount`    | Number of incomplete todos               |
| `completedCount` | Number of completed todos                |

### Actions

All mutating actions use **optimistic updates** — the UI updates immediately, and reverts on API failure.

| Action                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `loadTodos()`             | Fetches all todos on mount                       |
| `addTodo(title)`          | Creates a todo and prepends it to the list       |
| `toggleTodo(id)`          | Toggles the `completed` flag                     |
| `editTodo(id, title)`     | Updates the title inline                         |
| `deleteTodo(id)`          | Removes a todo with optimistic removal           |
| `clearCompleted()`        | Batch-deletes all completed todos                |
| `setFilter(filter)`       | Changes the active filter                        |

---

## useToast

**File:** `apps/web/src/hooks/useToast.js`

Manages toast notification state.

### State

| State    | Type  | Description                                      |
| -------- | ----- | ------------------------------------------------ |
| `toasts` | Array | `{ id, message, variant }` — variant is `'success'` or `'error'` |

### Methods

| Method                        | Description                         |
| ----------------------------- | ----------------------------------- |
| `addToast(message, variant)`  | Shows a toast, auto-removes after 4s|
| `removeToast(id)`             | Manually dismisses a toast          |
