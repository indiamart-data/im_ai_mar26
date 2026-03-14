import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';

export function useTodos({ addToast } = {}) {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await apiClient.listTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message || 'Failed to load todos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = useCallback(async (title) => {
    setError('');
    const created = await apiClient.createTodo(title);
    setTodos((current) => [created, ...current]);
    addToast?.('Todo added', 'success');
  }, [addToast]);

  const toggleTodo = useCallback(async (id) => {
    setError('');

    let previous;
    setTodos((current) => {
      previous = current;
      return current.map((todo) => {
        if (todo.id !== id) return todo;
        return { ...todo, completed: !todo.completed };
      });
    });

    try {
      const target = previous.find((todo) => todo.id === id);
      await apiClient.updateTodo(id, { completed: !target.completed });
    } catch (err) {
      setTodos(previous);
      setError(err.message || 'Failed to update todo.');
      addToast?.(err.message || 'Failed to update todo', 'error');
    }
  }, [addToast]);

  const editTodo = useCallback(async (id, title) => {
    setError('');

    let previous;
    setTodos((current) => {
      previous = current;
      return current.map((todo) => {
        if (todo.id !== id) return todo;
        return { ...todo, title, updatedAt: new Date().toISOString() };
      });
    });

    try {
      await apiClient.updateTodo(id, { title });
    } catch (err) {
      setTodos(previous);
      setError(err.message || 'Failed to edit todo.');
      addToast?.(err.message || 'Failed to edit todo', 'error');
    }
  }, [addToast]);

  const deleteTodo = useCallback(async (id) => {
    setError('');

    let previous;
    setTodos((current) => {
      previous = current;
      return current.filter((todo) => todo.id !== id);
    });

    try {
      await apiClient.deleteTodo(id);
      addToast?.('Todo deleted', 'success');
    } catch (err) {
      setTodos(previous);
      setError(err.message || 'Failed to delete todo.');
      addToast?.(err.message || 'Failed to delete todo', 'error');
    }
  }, [addToast]);

  const clearCompleted = useCallback(async () => {
    setError('');
    const completed = todos.filter((t) => t.completed);
    if (completed.length === 0) return;

    const previous = todos;
    setTodos((current) => current.filter((t) => !t.completed));

    try {
      await Promise.all(completed.map((t) => apiClient.deleteTodo(t.id)));
      addToast?.(`Cleared ${completed.length} completed todo${completed.length > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      setTodos(previous);
      setError(err.message || 'Failed to clear completed todos.');
      addToast?.(err.message || 'Failed to clear completed', 'error');
    }
  }, [todos, addToast]);

  return {
    addTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    error,
    isLoading,
    todos,
    filteredTodos,
    filter,
    setFilter,
    completedCount,
    activeCount,
    toggleTodo
  };
}
