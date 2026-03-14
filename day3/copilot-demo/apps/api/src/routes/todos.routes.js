const express = require('express');
const {
  getTodos,
  patchTodo,
  postTodo,
  removeTodo
} = require('../controllers/todos.controller');

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

const router = express.Router();

router.get('/', asyncRoute(getTodos));
router.post('/', asyncRoute(postTodo));
router.patch('/:id', asyncRoute(patchTodo));
router.delete('/:id', asyncRoute(removeTodo));

module.exports = { todosRouter: router };
