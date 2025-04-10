// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API Endpoints
const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}${import.meta.env.VITE_API_LOGIN || '/login'}`,
  BRANCHES: `${API_BASE_URL}${import.meta.env.VITE_API_BRANCHES || '/branches'}`,
  USERS: `${API_BASE_URL}${import.meta.env.VITE_API_USERS || '/api/users'}`,
  DAILY_MAIN: `${API_BASE_URL}${import.meta.env.VITE_API_DAILY_MAIN || '/api/daily-main'}`,
  STORE_BRANCHES: `${API_BASE_URL}${import.meta.env.VITE_API_STORE_BRANCHES || '/api/store-branches'}`,
  WEEKLY_SALES_REPORT: `${API_BASE_URL}${import.meta.env.VITE_API_WEEKLY_SALES_REPORT || '/api/weekly-sales-report'}`,
  DRIVER_REPORTS: `${API_BASE_URL}${import.meta.env.VITE_API_DRIVER_REPORTS || '/api/driver-reports'}`
};

// Application Settings
const APP_NAME = import.meta.env.VITE_APP_NAME || 'SPA Sample';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export {
  API_BASE_URL,
  API_ENDPOINTS,
  APP_NAME,
  APP_VERSION
}; 