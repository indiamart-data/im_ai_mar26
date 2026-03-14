---
sidebar_position: 1
slug: /intro
---

# Introduction

**Copilot Demo** is a full-stack Todo application built as a monorepo with two apps:

- **API** — Express.js REST API backed by MongoDB (via Mongoose)
- **Web** — React 18 + Vite single-page application

## Key Principles

- **API-first**: The web app never does direct persistence — the API is the single source of truth for data, IDs, timestamps, and validation.
- **Optimistic UI**: The web app updates state immediately on user actions and rolls back on failure, providing a snappy experience.
- **Monorepo**: Both apps live in a single repository managed via npm workspaces, sharing a root `package.json` for unified commands.

## Quick Start

```bash
# Install all dependencies
npm install

# Start both API and web in development mode
npm run dev
```

The API runs on `http://localhost:3001` and the web app on `http://localhost:5173` by default.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| API       | Express.js, Mongoose, Node.js     |
| Database  | MongoDB                           |
| Frontend  | React 18, Vite, TailwindCSS       |
| Testing   | Node test runner, Vitest, supertest, React Testing Library |
