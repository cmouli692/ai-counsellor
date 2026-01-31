import app from './app.js';
import dotenv from 'dotenv';

// Load environment variables from server/.env
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🚀 AI COUNSELLOR BACKEND RUNNING                         ║
╠════════════════════════════════════════════════════════════╣
║   Environment: ${NODE_ENV.padEnd(48)}║
║   Server: http://localhost:${PORT.toString().padEnd(47)}║
║   Health Check: http://localhost:${PORT}/health${' '.repeat(31)}║
║   Frontend URL: ${(process.env.FRONTEND_URL || 'http://localhost:5173').padEnd(38)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
