import Constants from 'expo-constants';

// API Configuration for different environments
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:3001',
  },
  staging: {
    BASE_URL: 'https://pandanleaf-backend-production.up.railway.app', // Railway staging URL
  },
  production: {
    BASE_URL: 'https://pandanleaf-backend-production.up.railway.app', // Railway production URL
  }
};

// Determine current environment
const getEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  
  // Check if this is a preview/staging build
  if (Constants.expoConfig?.extra?.releaseChannel?.includes('staging')) {
    return 'staging';
  }
  
  return 'production';
};

const currentEnv = getEnvironment();
const config = API_CONFIG[currentEnv];

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: config.BASE_URL,
  
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register', 
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  
  // Products & Menu
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
  },
  
  // Orders
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
  },
  
  // Chefs
  CHEFS: {
    LIST: '/api/chefs',
    PROFILE: '/api/chefs/profile',
    PRODUCTS: '/api/chefs/products',
  },
  
  // Admin
  ADMIN: {
    STATS: '/api/admin/stats',
    PENDING_CHEFS: '/api/admin/chefs/pending',
    APPROVE_CHEF: (id: string) => `/api/admin/chefs/${id}/approve`,
  },
  
  // Health Check
  HEALTH: '/health',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${config.BASE_URL}${endpoint}`;
};

// Export current environment for debugging
export const CURRENT_ENV = currentEnv;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000; // 10 seconds

console.log(`🌐 API Environment: ${currentEnv}`);
console.log(`🔗 API Base URL: ${config.BASE_URL}`); 