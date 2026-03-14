const express = require('express');
const cors = require('cors');
const { todosRouter } = require('./routes/todos.routes');
const { errorHandler, routeNotFound } = require('./middleware/error-handler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/todos', todosRouter);
app.use(routeNotFound);
app.use(errorHandler);

module.exports = app;
