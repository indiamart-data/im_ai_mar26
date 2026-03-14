# Todo App UI/UX Improvements Plan

## Context
The current Todo app is functional but lacks industry-standard UI/UX polish. The app has basic loading/empty/error states as plain text, no filtering, no edit capability, no delete confirmation, and no visual feedback beyond inline red error text. These improvements will bring the app to modern standards without adding any new dependencies — all changes use existing Tailwind CSS and React patterns.

The API already supports PATCH with `{ title }`, so edit-in-place needs zero backend changes. Filtering must be client-side (API rejects query params).

---

## Tier 1: High Impact (Must-Do)

### 1. Loading Skeleton
- **Create** `apps/web/src/components/TodoSkeleton.jsx` — 3 skeleton `<li>` items using `animate-pulse` on `bg-gray-200` divs matching TodoItem shape
- **Modify** `apps/web/src/App.jsx` — replace "Loading todos..." text with `<TodoSkeleton />`

### 2. Improved Empty State
- **Create** `apps/web/src/components/EmptyState.jsx` — centered block with inline SVG clipboard icon, heading "All clear!", and guiding subtext
- **Modify** `apps/web/src/App.jsx` — replace plain `<p>` empty message

### 3. Character Counter on Input
- **Modify** `apps/web/src/components/TodoForm.jsx` — show `{length}/200` below input, color shifts at 180 (amber) and 200 (red), hidden when empty

### 4. Filter Tabs (All / Active / Completed) + Todo Count
- **Create** `apps/web/src/components/TodoFilters.jsx` — three tab buttons + "X of Y completed" summary
- **Modify** `apps/web/src/hooks/useTodos.js` — add `filter` state, `setFilter`, derived `filteredTodos` via `useMemo`, `completedCount`/`activeCount`
- **Modify** `apps/web/src/App.jsx` — place filters between form and list, pass `filteredTodos` to `TodoList`

### 5. Edit-in-Place for Todo Titles
- **Modify** `apps/web/src/components/TodoItem.jsx` — double-click title enters edit mode (input field), Enter saves, Escape cancels, blur saves
- **Modify** `apps/web/src/hooks/useTodos.js` — add `editTodo(id, title)` with optimistic update + rollback (same pattern as `toggleTodo`)
- **Modify** `apps/web/src/App.jsx` — pass `editTodo` through props

### 6. Delete Confirmation (Inline)
- **Modify** `apps/web/src/components/TodoItem.jsx` — clicking Delete morphs button into "Delete?" + Yes/No buttons, auto-cancels after 3s via `useEffect` timeout

---

## Tier 2: Medium Impact (Nice-to-Have)

### 7. Toast Notification System
- **Create** `apps/web/src/hooks/useToast.js` — manages toast list with auto-dismiss (4s)
- **Create** `apps/web/src/components/Toast.jsx` — fixed bottom-right container, success (teal) and error (rose) variants
- **Modify** `apps/web/src/hooks/useTodos.js` + `App.jsx` — wire toasts for add/delete success and all errors

### 8. CSS Transitions for List Items
- **Modify** `apps/web/src/components/TodoItem.jsx` — fade-in on mount (`opacity-0 → opacity-100`), fade-out on delete (200ms delay before actual removal), smooth toggle color transition

### 9. Timestamps Display
- **Create** `apps/web/src/utils/formatTime.js` — `formatRelativeTime()` using `Intl.RelativeTimeFormat`
- **Modify** `apps/web/src/components/TodoItem.jsx` — show "Created X ago", show "edited X ago" when `updatedAt !== createdAt`

### 10. Clear Completed Button
- **Modify** `apps/web/src/components/TodoFilters.jsx` — "Clear completed" link, visible when `completedCount > 0`
- **Modify** `apps/web/src/hooks/useTodos.js` — `clearCompleted()` deletes all completed todos in parallel

### 11. Delete Button Tooltip
- **Modify** `apps/web/src/components/TodoItem.jsx` — add `title="Delete this todo"` to Delete button

---

## Tier 3: Low Priority (Optional Polish)

### 12. Dark Mode
- Modify `tailwind.config.js` (`darkMode: 'class'`), create `useTheme` hook, add `dark:` variants to all components

### 13. Keyboard Shortcuts
- Create `useKeyboardShortcuts` hook — `/` focuses input, `Escape` blurs

### 14. Progress Bar
- Add thin completion bar in `TodoFilters.jsx` showing percentage complete

---

## Implementation Order
1. TodoSkeleton + EmptyState (standalone, zero risk)
2. Character counter (single file)
3. Filter tabs + count (new component + hook changes)
4. Edit-in-place (moderate complexity)
5. Delete confirmation + tooltip (self-contained in TodoItem)
6. Timestamps (utility + TodoItem)
7. Toast system (new hook + component)
8. CSS transitions (after TodoItem changes stabilize)
9. Clear completed (depends on filter bar)
10. Tier 3 items as time permits

## Critical Files
- `apps/web/src/hooks/useTodos.js` — filter state, editTodo, clearCompleted
- `apps/web/src/components/TodoItem.jsx` — most modified (edit, confirm, transitions, timestamps)
- `apps/web/src/App.jsx` — wire new components, replace loading/empty states
- `apps/web/src/components/TodoForm.jsx` — character counter
- `apps/web/src/api/client.js` — already supports all needed API calls (no changes)

## Verification
1. `npm run dev` — verify all visual changes render correctly
2. Test each feature: add/edit/delete/toggle todos, filter tabs, character counter, skeleton loading
3. Test error handling: stop API server, verify toasts/rollbacks work
4. Test responsiveness: resize browser to mobile widths
5. `cd apps/web && npm test` — run existing tests, add tests for new components
6. Keyboard/accessibility: tab through all interactive elements, verify focus rings and aria attributes
