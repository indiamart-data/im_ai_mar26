require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db/connection');

const port = Number(process.env.PORT || 3001);

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
