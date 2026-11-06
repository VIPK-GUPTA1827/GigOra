require('dotenv').config();
const { assertEnv } = require('./config/env');

// Validate environment variables before initializing services
assertEnv();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const { setupSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = setupSocket(server);
app.set('io', io);

async function start() {
  await connectDB(); // Connect to MongoDB first, then start server
  server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
}
start();

// Graceful shutdown handling for Render / SIGTERM / SIGINT
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, closing server gracefully...`);
  setTimeout(() => process.exit(1), 10000).unref();
  io.close(async () => {
    await mongoose.connection.close();
    console.log('Server and database connections closed cleanly');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  shutdown('unhandledRejection');
});
