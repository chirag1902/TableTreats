// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear auth and trigger logout event
      delete api.defaults.headers.common["Authorization"];

      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    // Return error in consistent format
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export default api;
