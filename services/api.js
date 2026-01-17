import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your PC's actual WiFi IP address for network communication
// Your phone connects to: http://101.0.0.53:5000
const API_BASE_URL = 'http://101.0.0.53:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getMe: () =>
    api.get('/auth/me'),

  updateProfile: (profileData) =>
    api.put('/auth/updateprofile', profileData),

  addFavorite: (locationId) =>
    api.post('/auth/addfavorite', { locationId }),

  removeFavorite: (locationId) =>
    api.delete(`/auth/removefavorite/${locationId}`),

  getHistory: () =>
    api.get('/auth/history'),
};

// ============ LOCATION ENDPOINTS ============
export const locationAPI = {
  getAll: () =>
    api.get('/locations'),

  getById: (id) =>
    api.get(`/locations/${id}`),

  getByFloor: (floor) =>
    api.get(`/locations/floor/${floor}`),

  getByBlock: (block) =>
    api.get(`/locations/block/${block}`),

  search: (query) =>
    api.get(`/locations/search/${query}`),

  create: (locationData) =>
    api.post('/locations', locationData),

  update: (id, locationData) =>
    api.put(`/locations/${id}`, locationData),

  delete: (id) =>
    api.delete(`/locations/${id}`),
};

// ============ QR CODE ENDPOINTS ============
export const qrAPI = {
  getById: (id) =>
    api.get(`/qrcodes/${id}`),

  getByLocation: (locationId) =>
    api.get(`/qrcodes/location/${locationId}`),

  scan: (qrId) =>
    api.post(`/qrcodes/scan/${qrId}`),

  getStats: () =>
    api.get('/qrcodes/stats'),

  getAll: () =>
    api.get('/qrcodes'),
};

// ============ AI ASSISTANT ENDPOINTS ============
export const aiAPI = {
  chat: (message, conversationHistory = []) =>
    api.post('/ai/chat', { message, conversationHistory }),

  getLocationInfo: (locationId) =>
    api.get(`/ai/location/${locationId}`),

  getNavigation: (fromLocation, toLocation) =>
    api.post('/ai/navigation', { fromLocation, toLocation }),
};

// ============ UTILITY FUNCTIONS ============
export const saveAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

export default api;
