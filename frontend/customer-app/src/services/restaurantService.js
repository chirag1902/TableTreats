// src/services/restaurantService.js
import api from "./api";

export const getAllRestaurants = async (params = {}) => {
  try {
    const { city, cuisine, skip = 0, limit = 20 } = params;
    
    const queryParams = new URLSearchParams();
    if (city) queryParams.append('city', city);
    if (cuisine) queryParams.append('cuisine', cuisine);
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/customers/restaurants?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    const errorDetail = err?.detail || err?.message || "Failed to fetch restaurants";
    throw { detail: errorDetail };
  }
};

export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await api.get(`/customers/restaurants/${restaurantId}`);
    return response.data;
  } catch (err) {
    const errorDetail = err?.detail || err?.message || "Failed to fetch restaurant details";
    throw { detail: errorDetail };
  }
};

export const searchRestaurants = async (query, skip = 0, limit = 20) => {
  try {
    const queryParams = new URLSearchParams({
      query,
      skip,
      limit
    });
    
    const response = await api.get(`/customers/restaurants/search?${queryParams.toString()}`);
    return response.data;
  } catch (err) {
    const errorDetail = err?.detail || err?.message || "Failed to search restaurants";
    throw { detail: errorDetail };
  }
};