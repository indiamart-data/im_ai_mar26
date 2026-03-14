---
applyTo: "apps/web/**/*.{ts,tsx,js,jsx}"
description: "React-specific UI rules for apps/web (ToDo App)"
---

## React fundamentals (strict)

- Use **React functional components only**.
- Use **React Hooks** (`useState`, `useEffect`, `useCallback`, `useMemo`) where appropriate.
- ❌ Do NOT use class components.
- ❌ Do NOT use external state managers unless explicitly introduced later.

## Component design

- Components must be **small and single-responsibility**.
- UI rendering logic stays in components.
- Business or data-fetching logic must be extracted into:
  - custom hooks (`useTodos`, `useCreateTodo`, etc.)
  - or service modules.

## Styling (React-specific)

- ❌ No inline styles (`style={{}}`) in JSX.
- Use **Tailwind CSS classes** OR **CSS Modules** consistently.
- Do not mix styling approaches within the same component.

## UI states (mandatory)

Every screen and async interaction must handle:
- Loading state
- Empty state
- Error state

These must be **visibly rendered**, not console-only.

## Accessibility (React UI)

- Use semantic HTML elements (`button`, `form`, `label`, `input`).
- Associate `<label>` with inputs.
- Buttons must be keyboard accessible.
- Add `aria-*` attributes only when semantics are insufficient.

---

## API usage (React-side only)

- All HTTP calls must go through **a single API client module**
  - Example: `src/api/client.ts`
- ❌ Do NOT call `fetch` directly inside JSX components.
- API base URL must come from environment variables:
  - `VITE_API_URL` (Vite)
  - `NEXT_PUBLIC_API_URL` (Next.js)

## State updates

- Prefer **optimistic UI updates** for:
  - toggle completed
  - delete todo
- On failure:
  - rollback UI state
  - show a user-friendly error message

---

## Prohibited patterns (React)

❌ Direct DOM manipulation  
❌ Side effects inside render logic  
❌ API calls inside render  
❌ Business logic inside JSX  
❌ Hardcoded environment values  
