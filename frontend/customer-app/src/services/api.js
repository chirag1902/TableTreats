// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "localhost:8000",
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

// ==================== RESERVATION API FUNCTIONS ====================

// Helper to set customer auth token
const setCustomerAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Get restaurant hours for a specific date
export const getRestaurantHours = async (restaurantId, date) => {
  try {
    const response = await api.get(
      `/api/restaurants/${restaurantId}/hours/${date}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant hours:", error);
    throw error;
  }
};

// Check availability for a specific time slot with seating areas
export const checkAvailability = async (
  restaurantId,
  date,
  timeSlot,
  numberOfGuests
) => {
  try {
    const response = await api.post("/api/reservations/check-availability", {
      restaurant_id: restaurantId,
      date: date,
      time_slot: timeSlot,
      number_of_guests: numberOfGuests,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
};

// Get daily availability for all time slots
export const getDailyAvailability = async (restaurantId, date) => {
  try {
    const response = await api.get(
      `/api/reservations/availability/${restaurantId}/${date}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching daily availability:", error);
    throw error;
  }
};

// Create a new reservation (customer-facing) - AUTO APPROVED
export const createReservation = async (reservationData) => {
  try {
    setCustomerAuthToken();
    const response = await api.post("/api/reservations", reservationData);
    return response.data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
};

// Get customer's reservations
export const getMyReservations = async () => {
  try {
    setCustomerAuthToken();
    const response = await api.get("/api/reservations/my-reservations");
    return response.data;
  } catch (error) {
    console.error("Error fetching my reservations:", error);
    throw error;
  }
};

// Get single reservation by ID
export const getReservationById = async (reservationId) => {
  try {
    setCustomerAuthToken();
    const response = await api.get(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservation:", error);
    throw error;
  }
};

// Cancel reservation
export const cancelReservation = async (reservationId) => {
  try {
    setCustomerAuthToken();
    const response = await api.delete(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("Error canceling reservation:", error);
    throw error;
  }
};

export default api;
