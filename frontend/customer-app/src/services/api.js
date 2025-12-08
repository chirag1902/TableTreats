// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://tabletreats.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      delete api.defaults.headers.common["Authorization"];
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

// ==================== RESERVATION API FUNCTIONS ====================

const setCustomerAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

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

// ==================== BILL API FUNCTIONS ====================

export const getBill = async (reservationId) => {
  try {
    setCustomerAuthToken();
    const response = await api.get(`/api/reservations/${reservationId}/bill`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bill:", error);
    throw error;
  }
};

export const payBill = async (reservationId) => {
  try {
    setCustomerAuthToken();
    const response = await api.post(`/api/reservations/${reservationId}/pay`);
    return response.data;
  } catch (error) {
    console.error("Error paying bill:", error);
    throw error;
  }
};

export default api;
