// src/services/restaurantService.js

// Restaurant data fetching service providing various restaurant listing endpoints
// Supports filtering by city, cuisine, and pagination for different restaurant categories
// Includes functions for premium restaurants, deals, top-rated, open now, new arrivals, and search functionality

import api from "./api";

export const getAllRestaurants = async (params = {}) => {
  try {
    const { city, cuisine, skip = 0, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (city) queryParams.append("city", city);
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch restaurants";
    throw { detail: errorDetail };
  }
};

export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await api.get(`/customers/restaurants/${restaurantId}`);
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch restaurant details";
    throw { detail: errorDetail };
  }
};

export const searchRestaurants = async (query, skip = 0, limit = 20) => {
  try {
    const queryParams = new URLSearchParams({
      query,
      skip,
      limit,
    });

    const response = await api.get(
      `/customers/restaurants/search?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to search restaurants";
    throw { detail: errorDetail };
  }
};

export const getPremiumRestaurants = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/premium?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch premium restaurants";
    throw { detail: errorDetail };
  }
};

export const getTodaysDeals = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 50 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/todays-deals?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch today's deals";
    throw { detail: errorDetail };
  }
};

export const getTopRated = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/top-rated?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch top rated restaurants";
    throw { detail: errorDetail };
  }
};

export const getOpenNow = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/open-now?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch open restaurants";
    throw { detail: errorDetail };
  }
};

export const getNewArrivals = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 20 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/new-arrivals?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch new arrivals";
    throw { detail: errorDetail };
  }
};

export const getRestaurantsByLocation = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 50 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/by-location?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch restaurants by location";
    throw { detail: errorDetail };
  }
};

export const getRestaurantsByPromo = async (params = {}) => {
  try {
    const { cuisine, skip = 0, limit = 50 } = params;

    const queryParams = new URLSearchParams();
    if (cuisine) queryParams.append("cuisine", cuisine);
    queryParams.append("skip", skip);
    queryParams.append("limit", limit);

    const response = await api.get(
      `/customers/restaurants/by-promo?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch restaurants by promo";
    throw { detail: errorDetail };
  }
};

export const getRestaurantDeals = async (restaurantId) => {
  try {
    const response = await api.get(`/api/restaurants/${restaurantId}/deals`);
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch restaurant deals";
    throw { detail: errorDetail };
  }
};

export const getApplicableDeals = async (restaurantId, date, timeSlot) => {
  try {
    const queryParams = new URLSearchParams({
      date,
      time_slot: timeSlot,
    });

    const response = await api.get(
      `/api/restaurants/${restaurantId}/deals/applicable?${queryParams.toString()}`
    );
    return response.data;
  } catch (err) {
    const errorDetail =
      err?.detail || err?.message || "Failed to fetch applicable deals";
    throw { detail: errorDetail };
  }
};
