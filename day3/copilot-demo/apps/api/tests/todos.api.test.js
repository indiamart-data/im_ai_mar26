const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/db/connection');

let mongoServer;

const app = require('../src/app');

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});

test.beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

test.after(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

test('GET /api/todos returns empty list', async () => {
  const response = await request(app).get('/api/todos');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { data: [] });
});

test('POST /api/todos creates todo', async () => {
  const response = await request(app)
    .post('/api/todos')
    .send({ title: 'Write tests' });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.title, 'Write tests');
  assert.equal(response.body.data.completed, false);
  assert.ok(response.body.data.id);
});

test('PATCH /api/todos/:id toggles completed', async () => {
  const created = await request(app)
    .post('/api/todos')
    .send({ title: 'Ship feature' });

  const response = await request(app)
    .patch(`/api/todos/${created.body.data.id}`)
    .send({ completed: true });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.completed, true);
});

test('DELETE /api/todos/:id removes todo', async () => {
  const created = await request(app)
    .post('/api/todos')
    .send({ title: 'Remove me' });

  const response = await request(app).delete(`/api/todos/${created.body.data.id}`);
  assert.equal(response.status, 200);

  const list = await request(app).get('/api/todos');
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, { data: [] });
});
