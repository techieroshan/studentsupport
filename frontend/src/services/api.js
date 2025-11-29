/**
 * API Service Layer for Student Support Application
 * Handles all backend API calls with authentication
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  resendOTP: async (email, codeType = 'email') => {
    const response = await api.post('/auth/resend-otp', {
      email,
      code_type: codeType,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Meal Request APIs
export const requestAPI = {
  getRequests: async (params = {}) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },
};

// Meal Offer APIs
export const offerAPI = {
  getOffers: async (params = {}) => {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  getMyOffers: async () => {
    const response = await api.get('/offers/my-offers');
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post('/offers', offerData);
    return response.data;
  },
};

// Donor APIs
export const donorAPI = {
  getDonors: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/donors', { params });
    return response.data;
  },
};

export default api;
