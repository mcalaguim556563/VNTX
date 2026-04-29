#!/bin/bash
set -e

# Run Laravel migrations (creates database tables if they don't exist)
php artisan migrate --force || true

# Build and start Express backend in background
cd /var/www/html/backend
npm install
npm run build
# Start backend in background
node dist/server.js &

# Start Apache in foreground
exec apache2-foreground
