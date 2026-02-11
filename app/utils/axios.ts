import axios from 'axios';

// API Base URL - Update this to match your backend
export const API_BASE_URL = 'https://resback.sampaarsh.cloud';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { getMockData } from './mockData';

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If offline/mock mode, intercept 401s and return mock data
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && token && token.startsWith('mock-token')) {
      console.warn(`[Mock Mode] Intercepted 401 for ${error.config.url}. Returning mock data.`);
      return Promise.resolve({
        data: getMockData(error.config.url || ''),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
