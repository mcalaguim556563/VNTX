// API configuration
// Production: uses the same domain (relative path)
// Development: falls back to localhost
export const API_URL = import.meta.env.PROD
  ? '/api'  // Production - same domain
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
