#!/bin/bash
# Wait for server and test AI analysis

echo "Waiting for backend server to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://localhost:3000/api >/dev/null 2>&1; then
    echo "✅ Server is ready!"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS - waiting..."
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ Server did not start in time"
  exit 1
fi

echo ""
echo "Running AI analysis test..."
./test-ai-analysis.sh
