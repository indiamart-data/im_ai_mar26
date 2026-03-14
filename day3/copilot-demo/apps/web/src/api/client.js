const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload.data;
}

export const apiClient = {
  listTodos() {
    return request('/api/todos');
  },
  createTodo(title) {
    return request('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  },
  updateTodo(id, patch) {
    return request(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  },
  deleteTodo(id) {
    return request(`/api/todos/${id}`, {
      method: 'DELETE'
    });
  }
};
