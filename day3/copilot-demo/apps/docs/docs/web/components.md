---
sidebar_position: 2
---

# Components

All components are functional React components located in `apps/web/src/components/`.

## TodoForm

Input form for creating new todos.

- Controlled input with 200 character limit
- Shows character count indicator (amber at 180+, red at 200)
- Validates non-empty input on submit
- Displays loading state ("Adding...") on the button during submission
- Shows inline error messages on failure

## TodoList

Renders a list of `TodoItem` components.

- Semantic `<ul>` element with `aria-label`
- Simple wrapper — delegates all logic to `TodoItem`

## TodoItem

Individual todo with full interaction support.

- **Toggle**: Checkbox to mark complete/incomplete (with `aria-label`)
- **Inline edit**: Double-click the title to edit; press Enter to save, Escape to cancel
- **Delete**: Delete button with confirmation dialog (auto-cancels after 3 seconds)
- **Timestamps**: Shows created and last-edited time in relative format ("2 hours ago")
- **Visual states**: Strikethrough + gray text when completed; smooth entry/removal animations

## TodoFilters

Filter controls and bulk actions.

- Three filter buttons: All, Active, Completed
- Shows count of completed todos
- "Clear completed" button (visible only when there are completed todos)

## EmptyState

Displayed when there are no todos to show.

- SVG clipboard icon
- "All clear!" heading with prompt to add a todo

## ToastContainer

Notification system for success/error feedback.

- Fixed position (bottom-right)
- Color-coded: teal for success, rose for error
- Each toast has a dismiss button
- Auto-removes after 4 seconds
- Uses `aria-live` for screen reader accessibility

## TodoSkeleton

Loading placeholder shown during initial data fetch.

- 3 skeleton items with pulse animation
- Varied widths for visual realism
