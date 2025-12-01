import axios from "axios";
import { API_BASE_URL } from "../constants";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "API Request Failed";
    console.error(`API Error: ${message}`);
    return Promise.reject(new Error(message));
  }
);

// Attach access token from localStorage if present
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
        config.headers["Cache-Control"] = "no-cache";
        config.headers["Pragma"] = "no-cache";
      }
    } catch (e) {
      console.error("Failed to attach token to request:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
