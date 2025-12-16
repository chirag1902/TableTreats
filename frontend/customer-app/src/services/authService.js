// src/services/authService.js

// Authentication service for customer sign up, login, and logout functionality
// Manages JWT token storage and automatic injection into API request headers
// Handles error formatting and user data extraction from authentication responses

import api from "./api";

export const signUp = async (userData) => {
  try {
    const response = await api.post("/auth/customers/signup", {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
    });
    return response.data;
  } catch (err) {
    // Extract error message from various possible formats
    const errorDetail =
      err?.detail ||
      err?.message ||
      err?.error ||
      "Signup failed. Please try again.";

    throw { detail: errorDetail };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/customers/login", credentials);
    const data = response.data;

    // Store JWT token
    if (data.access_token || data.token) {
      const token = data.access_token || data.token;

      // Set token in axios headers for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Return both token and user data for the component to handle
      return {
        token,
        user: {
          name: data.user?.full_name || data.full_name || "Guest",
          email: data.user?.email || data.email || credentials.email,
          location: data.user?.location || data.location || "New Brunswick, NJ",
        },
      };
    }

    throw { detail: "No authentication token received" };
  } catch (err) {
    const errorDetail =
      err?.detail ||
      err?.message ||
      err?.error ||
      "Login failed. Please check your credentials.";

    throw { detail: errorDetail };
  }
};

export const logout = () => {
  // Remove token from axios headers
  delete api.defaults.headers.common["Authorization"];
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
