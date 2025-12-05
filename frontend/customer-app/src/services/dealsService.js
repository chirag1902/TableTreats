// src/services/dealsService.js
import api from "./api";

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
