#!/bin/bash

# Run Laravel migrations
echo "🔄 Running Laravel migrations..."
php artisan migrate --force || true

# Default backend port if not provided
if [ -z "$BACKEND_PORT" ]; then
    export BACKEND_PORT=5000
fi

# Start Express backend with logging
echo "🚀 Starting Express backend..."
cd /var/www/html/backend

# Log environment for debugging
echo "📋 Environment variables for backend:"
echo "DB_HOST=$DB_HOST"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PORT=$DB_PORT"
echo "BACKEND_PORT=$BACKEND_PORT"

start_backend() {
    while true; do
        echo "🚀 Launching backend..."
        node dist/server.js
        exit_code=$?
        echo "❌ Backend exited with code ${exit_code}. Restarting in 2s..."
        sleep 2
    done
}

# Start backend in background (auto-restart on crash)
start_backend &
BACKEND_PID=$!
echo "📌 Backend supervisor PID: $BACKEND_PID"

# Wait a moment then check if process is listening
sleep 5
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is responding on port 5000"
else
    echo "⚠️ Backend not responding on port 5000 yet"
    echo "Checking for dist/server.js..."
    ls -la dist/ 2>&1 || echo "dist directory not found"
fi

# Start Apache
echo "🌐 Starting Apache..."
exec apache2-foreground
