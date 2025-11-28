
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (session) are sent with requests when backend uses HttpOnly cookies
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Format error message
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    console.error(`API Error: ${message}`);
    return Promise.reject(new Error(message));
  }
);

// Attach access token from localStorage if present
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
