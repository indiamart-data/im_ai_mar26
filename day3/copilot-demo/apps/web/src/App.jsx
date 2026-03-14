import { EmptyState } from './components/EmptyState';
import { TodoFilters } from './components/TodoFilters';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { TodoSkeleton } from './components/TodoSkeleton';
import { ToastContainer } from './components/Toast';
import { useTodos } from './hooks/useTodos';
import { useToast } from './hooks/useToast';

export default function App() {
  const { toasts, addToast, removeToast } = useToast();
  const {
    addTodo, deleteTodo, editTodo, clearCompleted,
    error, isLoading, todos, filteredTodos,
    filter, setFilter, completedCount, activeCount, toggleTodo
  } = useTodos({ addToast });

  return (
    <main className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-blue-50 to-orange-50">
      <section className="w-full max-w-2xl bg-white border border-blue-100 rounded-2xl p-5 shadow-lg" aria-live="polite">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">ToDo</h1>
        <TodoForm onAdd={addTodo} />

        {error ? <p className="mt-3 text-red-700">{error}</p> : null}
        {isLoading ? <TodoSkeleton /> : null}
        {!isLoading && todos.length === 0 ? <EmptyState /> : null}
        {!isLoading && todos.length > 0 ? (
          <>
            <TodoFilters
              filter={filter}
              setFilter={setFilter}
              completedCount={completedCount}
              activeCount={activeCount}
              onClearCompleted={clearCompleted}
            />
            <TodoList todos={filteredTodos} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />
          </>
        ) : null}
      </section>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
