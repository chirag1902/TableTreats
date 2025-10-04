import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: global response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Forward backend errors
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
