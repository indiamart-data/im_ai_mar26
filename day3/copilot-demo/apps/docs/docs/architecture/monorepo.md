---
sidebar_position: 2
---

# Monorepo Structure

The project uses **npm workspaces** to manage multiple apps in a single repository.

## Directory Layout

```
copilot-demo/
├── package.json          # Root — workspaces config & shared scripts
├── apps/
│   ├── api/              # Express.js REST API
│   │   ├── src/
│   │   │   ├── server.js         # Entry point (DB connect + listen)
│   │   │   ├── app.js            # Express app setup (CORS, routes, error handling)
│   │   │   ├── routes/           # Route definitions
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── storage/          # Data access layer (Mongoose)
│   │   │   ├── models/           # Mongoose schemas
│   │   │   ├── db/               # Database connection
│   │   │   ├── middleware/       # Error handling middleware
│   │   │   └── lib/              # Utilities (AppError, validation)
│   │   └── tests/
│   ├── web/              # React SPA
│   │   ├── src/
│   │   │   ├── main.jsx          # React entry point
│   │   │   ├── App.jsx           # Root component
│   │   │   ├── api/              # API client module
│   │   │   ├── components/       # UI components
│   │   │   ├── hooks/            # Custom hooks (useTodos, useToast)
│   │   │   └── utils/            # Utility functions
│   │   └── tests/
│   └── docs/             # Docusaurus documentation (this site)
```

## Workspace Commands

All commands are run from the repository root:

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start API + Web concurrently         |
| `npm run dev:api`  | Start API only (with `--watch`)      |
| `npm run dev:web`  | Start Web only (Vite dev server)     |
| `npm run dev:docs` | Start documentation site             |
| `npm run build`    | Build web app for production         |
| `npm run build:docs`| Build documentation site            |
| `npm test`         | Run all tests (API + Web)            |

## Key Constraint

The web app must **never** do filesystem or direct persistence operations. The API is the single source of truth and owns:

- ID generation (UUIDs)
- Timestamps (`createdAt`, `updatedAt`)
- Input validation
