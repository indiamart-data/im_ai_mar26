---
sidebar_position: 1
---

# Development Setup

## Prerequisites

- **Node.js** >= 20.0
- **MongoDB** running locally (or a remote URI)

## Installation

```bash
# Clone the repository
git clone https://github.com/indiamart-data/copilot-demo.git
cd copilot-demo

# Install all workspace dependencies
npm install
```

## Running in Development

```bash
# Start both API and web app concurrently
npm run dev

# Or start individually
npm run dev:api    # API on http://localhost:3001
npm run dev:web    # Web on http://localhost:5173
npm run dev:docs   # Docs on http://localhost:3000
```

The API uses `node --watch` for automatic restarts on file changes. The web app uses Vite's HMR for instant updates.

## Environment Configuration

Create a `.env` file in `apps/api/` to override defaults:

```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/todo-app
```

For the web app, create `.env` in `apps/web/`:

```bash
VITE_API_URL=http://localhost:3001
```

## Building for Production

```bash
# Build the web app
npm run build

# Build the documentation site
npm run build:docs
```

The web app builds to `apps/web/dist/` and the docs site to `apps/docs/build/`.
