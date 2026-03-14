const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://localhost:27017/todo-app';

async function connectDB(uri) {
  const connectionUri = uri || process.env.MONGODB_URI || DEFAULT_URI;
  await mongoose.connect(connectionUri);
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
