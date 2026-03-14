const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const defaultDataPath = path.resolve(__dirname, '../../data/todos.json');
const dataFilePath = process.env.TODO_DATA_FILE
  ? path.resolve(process.env.TODO_DATA_FILE)
  : defaultDataPath;

let writeQueue = Promise.resolve();

async function ensureDataFile() {
  const dir = path.dirname(dataFilePath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify({ todos: [] }, null, 2));
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.todos)) {
    return { todos: [] };
  }

  return parsed;
}

async function writeDataAtomic(data) {
  const dir = path.dirname(dataFilePath);
  const tempPath = path.join(
    dir,
    `.todos-${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`
  );

  await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, dataFilePath);
}

function enqueueWrite(task) {
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

function sortNewestFirst(todos) {
  return [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function listTodos() {
  const data = await readData();
  return sortNewestFirst(data.todos);
}

async function createTodo(input) {
  return enqueueWrite(async () => {
    const data = await readData();
    const now = new Date().toISOString();
    const todo = {
      id: randomUUID(),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    data.todos.push(todo);
    await writeDataAtomic(data);
    return todo;
  });
}

async function updateTodo(id, patch) {
  return enqueueWrite(async () => {
    const data = await readData();
    const index = data.todos.findIndex((todo) => todo.id === id);

    if (index < 0) {
      return null;
    }

    const current = data.todos[index];
    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    data.todos[index] = updated;
    await writeDataAtomic(data);
    return updated;
  });
}

async function deleteTodo(id) {
  return enqueueWrite(async () => {
    const data = await readData();
    const index = data.todos.findIndex((todo) => todo.id === id);

    if (index < 0) {
      return false;
    }

    data.todos.splice(index, 1);
    await writeDataAtomic(data);
    return true;
  });
}

module.exports = {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo
};
