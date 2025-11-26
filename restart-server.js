const { spawn } = require('child_process');
const path = require('path');

const RESTART_INTERVAL = 40 * 1000; // 40 seconds in milliseconds
let serverProcess = null;

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting backend server...`);

  // Kill existing process if running
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }

  // Start new server process
  serverProcess = spawn('npm', ['run', 'start:dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    detached: false
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Server exited with code ${code}, signal ${signal}`);
  });

  serverProcess.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
  });
}

function restartServer() {
  console.log(`[${new Date().toISOString()}] Restarting server after ${RESTART_INTERVAL / 1000} seconds...`);
  startServer();
}

// Start the server initially
startServer();

// Set up periodic restart
setInterval(restartServer, RESTART_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Received SIGINT, shutting down...`);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Received SIGTERM, shutting down...`);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

console.log(`[${new Date().toISOString()}] Auto-restart script started. Server will restart every ${RESTART_INTERVAL / 1000} seconds.`);
console.log('Press Ctrl+C to stop.');