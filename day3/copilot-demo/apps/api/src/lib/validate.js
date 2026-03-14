const { AppError } = require('./app-error');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateListTodosQuery(query) {
  if (Object.keys(query).length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Query parameters are not supported.');
  }
}

function validateTodoId(params) {
  const id = params?.id;
  if (!isNonEmptyString(id)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'A valid todo id is required.');
  }

  return id.trim();
}

function validateCreateTodoBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }

  const allowed = ['title'];
  const keys = Object.keys(body);
  const hasOnlyAllowedKeys = keys.every((key) => allowed.includes(key));

  if (!hasOnlyAllowedKeys) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request contains unsupported fields.');
  }

  if (!isNonEmptyString(body.title)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Title is required.');
  }

  const title = body.title.trim();

  if (title.length < 1 || title.length > 200) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Title must be between 1 and 200 characters.');
  }

  return { title };
}

function validatePatchTodoBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }

  const allowed = ['title', 'completed'];
  const keys = Object.keys(body);
  const hasOnlyAllowedKeys = keys.every((key) => allowed.includes(key));

  if (!hasOnlyAllowedKeys) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request contains unsupported fields.');
  }

  if (keys.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'At least one field must be provided.');
  }

  const patch = {};

  if (Object.hasOwn(body, 'title')) {
    if (!isNonEmptyString(body.title)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title must be a non-empty string.');
    }

    const title = body.title.trim();
    if (title.length < 1 || title.length > 200) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title must be between 1 and 200 characters.');
    }

    patch.title = title;
  }

  if (Object.hasOwn(body, 'completed')) {
    if (typeof body.completed !== 'boolean') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Completed must be a boolean.');
    }

    patch.completed = body.completed;
  }

  return patch;
}

module.exports = {
  validateCreateTodoBody,
  validateListTodosQuery,
  validatePatchTodoBody,
  validateTodoId
};
