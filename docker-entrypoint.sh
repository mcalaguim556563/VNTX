#!/bin/bash

# Run Laravel migrations (creates database tables if they don't exist)
echo "🔄 Running Laravel migrations..."
php artisan migrate --force || true

# Build and start Express backend in background
echo "🔄 Setting up Express backend..."
cd /var/www/html/backend

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Build the backend
echo "🔨 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    # Still start Apache so we can see the error
else
    echo "✅ Backend built successfully"
    
    # Start backend in background with logging
    echo "🚀 Starting Express backend..."
    node dist/server.js > /var/log/backend.log 2>&1 &
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Express backend is running!"
    else
        echo "⚠️  Express backend may not have started properly"
        echo "📋 Backend logs:"
        cat /var/log/backend.log || echo "No log file"
    fi
fi

# Start Apache in foreground
echo "🌐 Starting Apache..."
exec apache2-foreground
