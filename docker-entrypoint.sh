#!/bin/bash
set -e

# Run Laravel migrations (creates database tables if they don't exist)
php artisan migrate --force || true

# Start Apache
exec apache2-foreground
