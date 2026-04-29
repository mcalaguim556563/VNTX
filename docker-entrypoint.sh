#!/bin/bash

# Run Laravel migrations
echo "🔄 Running Laravel migrations..."
php artisan migrate --force || true

# Start Express backend (already built in Dockerfile)
echo "� Starting Express backend..."
cd /var/www/html/backend
node dist/server.js &

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Backend is running on port 5000"
        break
    fi
    sleep 1
done

# Start Apache
echo "🌐 Starting Apache..."
exec apache2-foreground
