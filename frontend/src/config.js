// Use window.location.hostname to handle both development and production
const API_HOST = process.env.NODE_ENV === 'production' 
  ? window.location.hostname 
  : 'localhost';

export const API_BASE_URL = `http://${API_HOST}:5001`;

// For debugging
console.log('🔧 API URL:', API_BASE_URL); 