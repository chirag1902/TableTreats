// src/services/authService.js
import api from './api';

export const signUp = async (userData) => {
  try {
    const response = await api.post('/customers/signup', {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/customers/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};