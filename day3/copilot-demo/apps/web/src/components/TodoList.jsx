import { TodoItem } from './TodoItem';

export function TodoList({ todos, onToggle, onDelete, onEdit }) {
  return (
    <ul className="list-none m-0 p-0 flex flex-col gap-2" aria-label="Todo items">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}
