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

# Start backend and capture output to log
node dist/server.js 2>&1 &
BACKEND_PID=$!
echo "📌 Backend PID: $BACKEND_PID"

# Wait a moment then check if process is still running
sleep 5
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend process died immediately!"
    echo "Checking for dist/server.js..."
    ls -la dist/ 2>&1 || echo "dist directory not found"
else
    echo "✅ Backend process is running (PID: $BACKEND_PID)"
    
    # Test if it's actually listening
    sleep 3
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Backend is responding on port 5000"
    else
        echo "⚠️ Backend process running but not responding on port 5000"
    fi
fi

# Start Apache
echo "🌐 Starting Apache..."
exec apache2-foreground
