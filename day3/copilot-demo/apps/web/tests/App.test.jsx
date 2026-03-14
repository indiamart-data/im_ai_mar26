import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';

const mocks = vi.hoisted(() => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
}));

vi.mock('../src/api/client.js', () => ({
  apiClient: {
    listTodos: mocks.listTodos,
    createTodo: mocks.createTodo,
    updateTodo: mocks.updateTodo,
    deleteTodo: mocks.deleteTodo
  }
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state after loading', async () => {
    mocks.listTodos.mockResolvedValueOnce([]);

    render(<App />);

    expect(screen.getByLabelText('Loading todos')).toBeInTheDocument();
    expect(await screen.findByText('All clear!')).toBeInTheDocument();
  });

  it('adds a todo', async () => {
    mocks.listTodos.mockResolvedValueOnce([]);
    mocks.createTodo.mockResolvedValueOnce({
      id: '1',
      title: 'New task',
      completed: false,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-14T00:00:00.000Z'
    });

    render(<App />);

    await screen.findByText('All clear!');
    await userEvent.type(screen.getByLabelText('New todo'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument();
    });
  });
});
