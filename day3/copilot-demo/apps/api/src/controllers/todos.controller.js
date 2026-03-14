const { AppError } = require('../lib/app-error');
const {
  validateCreateTodoBody,
  validateListTodosQuery,
  validatePatchTodoBody,
  validateTodoId
} = require('../lib/validate');
const { createTodo, deleteTodo, listTodos, updateTodo } = require('../storage/todo-store');

async function getTodos(req, res) {
  validateListTodosQuery(req.query);
  const todos = await listTodos();
  res.status(200).json({ data: todos });
}

async function postTodo(req, res) {
  const payload = validateCreateTodoBody(req.body);
  const todo = await createTodo(payload);
  res.status(201).json({ data: todo });
}

async function patchTodo(req, res) {
  const id = validateTodoId(req.params);
  const patch = validatePatchTodoBody(req.body);
  const todo = await updateTodo(id, patch);

  if (!todo) {
    throw new AppError(404, 'TODO_NOT_FOUND', 'Todo not found.');
  }

  res.status(200).json({ data: todo });
}

async function removeTodo(req, res) {
  const id = validateTodoId(req.params);
  const deleted = await deleteTodo(id);

  if (!deleted) {
    throw new AppError(404, 'TODO_NOT_FOUND', 'Todo not found.');
  }

  res.status(200).json({ data: { id } });
}

module.exports = {
  getTodos,
  patchTodo,
  postTodo,
  removeTodo
};
