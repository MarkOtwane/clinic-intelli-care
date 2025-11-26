#!/bin/bash

# Auto-restart script for backend server
# Restarts the server every 40 seconds

RESTART_INTERVAL=40
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "Starting auto-restart script..."
echo "Server will restart every $RESTART_INTERVAL seconds"
echo "Working directory: $BACKEND_DIR"
echo "Press Ctrl+C to stop"

# Function to start server
start_server() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting backend server..."
    cd "$BACKEND_DIR"
    npm run start:dev &
    SERVER_PID=$!
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Server started with PID: $SERVER_PID"
}

# Function to stop server
stop_server() {
    if [ ! -z "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID
        wait $SERVER_PID 2>/dev/null
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Server stopped"
    fi
}

# Function to restart server
restart_server() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Restarting server..."
    stop_server
    sleep 2  # Brief pause to ensure cleanup
    start_server
}

# Trap SIGINT (Ctrl+C) to clean up
trap 'echo ""; echo "Stopping auto-restart script..."; stop_server; exit 0' INT

# Start server initially
start_server

# Main loop - restart every 40 seconds
while true; do
    sleep $RESTART_INTERVAL
    restart_server
done