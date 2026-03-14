import { useEffect, useRef, useState } from 'react';
import { formatRelativeTime } from '../utils/formatTime';

export function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [removing, setRemoving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    setEditValue(todo.title);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditValue(todo.title);
    setEditing(false);
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function handleDelete() {
    setRemoving(true);
    setTimeout(() => onDelete(todo.id), 200);
  }

  const wasEdited = todo.updatedAt && todo.createdAt && todo.updatedAt !== todo.createdAt;

  return (
    <li
      className={`flex flex-col gap-1 border border-gray-200 rounded-lg px-3 py-2.5 bg-blue-50/30 transition-all duration-200 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      } ${removing ? 'opacity-0 scale-95' : ''}`}
    >
      <div className="flex justify-between items-center gap-2">
        <label className="inline-flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              maxLength={200}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleEditKeyDown}
              className="flex-1 border border-teal-300 rounded px-2 py-0.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Edit todo title"
            />
          ) : (
            <span
              className={`break-words cursor-pointer ${
                todo.completed
                  ? 'line-through text-slate-500 transition-colors duration-200'
                  : 'transition-colors duration-200'
              }`}
              onDoubleClick={startEdit}
              title="Double-click to edit"
            >
              {todo.title}
            </span>
          )}
        </label>

        <div className="flex items-center gap-1 shrink-0">
          {confirming ? (
            <>
              <span className="text-sm text-rose-700 font-medium">Delete?</span>
              <button
                type="button"
                className="border border-red-300 rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-sm cursor-pointer hover:bg-rose-200 transition-colors"
                onClick={handleDelete}
              >
                Yes
              </button>
              <button
                type="button"
                className="border border-gray-300 rounded bg-gray-100 text-gray-700 px-2 py-0.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setConfirming(false)}
              >
                No
              </button>
            </>
          ) : (
            <button
              className="border border-red-200 rounded-lg bg-rose-50 text-rose-800 px-2.5 py-1 cursor-pointer hover:bg-rose-100 transition-colors"
              type="button"
              onClick={() => setConfirming(true)}
              title="Delete this todo"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 text-xs text-gray-400 pl-6">
        {todo.createdAt && <span>Created {formatRelativeTime(todo.createdAt)}</span>}
        {wasEdited && <span>edited {formatRelativeTime(todo.updatedAt)}</span>}
      </div>
    </li>
  );
}
