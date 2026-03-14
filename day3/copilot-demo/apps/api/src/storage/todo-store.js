const Todo = require('../models/todo.model');

async function listTodos() {
  const todos = await Todo.find().sort({ createdAt: -1 });
  return todos.map((t) => t.toJSON());
}

async function createTodo(input) {
  const todo = await Todo.create({ title: input.title });
  return todo.toJSON();
}

async function updateTodo(id, patch) {
  const todo = await Todo.findByIdAndUpdate(id, patch, { returnDocument: 'after', runValidators: true });
  return todo ? todo.toJSON() : null;
}

async function deleteTodo(id) {
  const todo = await Todo.findByIdAndDelete(id);
  return !!todo;
}

module.exports = {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo
};
