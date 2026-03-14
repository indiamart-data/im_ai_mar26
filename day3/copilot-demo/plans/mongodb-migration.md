# Migrate Todo API from JSON File Storage to MongoDB + Mongoose

## Context

The API currently persists todos to a JSON file (`data/todos.json`) with atomic writes and a write queue. This works but doesn't scale. The goal is to replace the file-based storage with MongoDB via Mongoose while keeping the exact same API contract (endpoints, response shapes, error codes).

The current architecture has clean separation — controllers call storage functions, never touch persistence directly — so the migration is mostly contained to the storage layer.

## Steps

### 1. Install dependencies
```bash
cd apps/api
npm install mongoose
npm install --save-dev mongodb-memory-server
```

### 2. Create Mongoose model — `src/models/todo.model.js` (new file)
- Schema: `_id` (String, UUID), `title` (String, 1-200), `completed` (Boolean, default false)
- Use `timestamps: true` for automatic `createdAt`/`updatedAt`
- `toJSON` transform: rename `_id` → `id`, strip `__v`

### 3. Create DB connection module — `src/db/connection.js` (new file)
- `connectDB(uri?)` — connects using `MONGODB_URI` env var or passed URI
- `disconnectDB()` — graceful disconnect
- Default URI: `mongodb://localhost:27017/todo-app`

### 4. Rewrite storage layer — `src/storage/todo-store.js` (replace contents)
- Replace all JSON file operations with Mongoose queries
- Keep the same 4 exported functions with identical signatures and return types:
  - `listTodos()` → `Todo.find().sort({ createdAt: -1 })`
  - `createTodo(input)` → `Todo.create({ title })`
  - `updateTodo(id, patch)` → `Todo.findByIdAndUpdate(id, patch, { new: true })`
  - `deleteTodo(id)` → `Todo.findByIdAndDelete(id)`
- Remove: write queue, atomic writes, `ensureDataFile`, all `fs` imports

### 5. Modify server startup — `src/server.js`
- Connect to MongoDB before starting Express listener
- Exit process on connection failure

### 6. Update tests — `tests/todos.api.test.js`
- Replace temp JSON file setup with `mongodb-memory-server`
- `before`: start memory server, connect via `connectDB(uri)`
- `beforeEach`: drop database to reset state
- `after`: disconnect, stop memory server
- Remove all `fs` and `TODO_DATA_FILE` references
- Test assertions stay unchanged

### 7. Update environment variables
- Add `MONGODB_URI` to `.env`
- Remove `TODO_DATA_FILE` (no longer needed)

### 8. Clean up
- Remove `apps/api/data/` directory
- Update `CLAUDE.md` — replace JSON file references with MongoDB

## Files unchanged (no modifications needed)
- `src/controllers/todos.controller.js` — calls same storage functions
- `src/lib/validate.js` — storage-agnostic
- `src/lib/app-error.js` — unchanged
- `src/routes/todos.routes.js` — unchanged
- `src/middleware/error-handler.js` — unchanged

## Verification
1. `cd apps/api && npm test` — all existing tests pass with mongodb-memory-server
2. `npm run dev:api` — start with local MongoDB, test CRUD via curl/Postman
3. `npm run dev` — full stack, verify web app works end-to-end
4. Confirm API responses have same shape: `{ data: { id, title, completed, createdAt, updatedAt } }`
