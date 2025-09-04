// Debug script to test API configuration
import api from './services/api';

console.log('API Base URL:', api.defaults.baseURL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Test API call
api.get('/health').then(response => {
  console.log('Health check response:', response.data);
}).catch(error => {
  console.error('Health check error:', error);
});

export default {};
