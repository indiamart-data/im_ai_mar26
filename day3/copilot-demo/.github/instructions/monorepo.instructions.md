---
description: "Monorepo rules for apps/api + apps/web"
---

- `apps/web` must NOT access filesystem or persistence directly.
- `apps/api` is the only place that reads/writes the JSON data file.
- No code duplication between apps; keep logic within the correct app.
- Keep environment variables per app (separate .env files).
