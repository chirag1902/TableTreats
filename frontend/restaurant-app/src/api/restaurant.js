import axios from "axios";

// Hardcoded API URL for production
const API_URL = "https://tabletreats-restaurantapp.onrender.com/api";

console.log("🔍 API Configuration:", {
  API_URL,
});

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function restaurantSignup(payload) {
  const { data } = await api.post("/restaurant/signup", payload);
  return data;
}

export async function restaurantLogin(credentials) {
  const { data } = await api.post("/restaurant/login", credentials);

  // Only store token if it exists
  if (data.access_token) {
    localStorage.setItem("restaurant_token", data.access_token);
  } else {
    console.error("⚠️ No access_token received from server");
    throw new Error("Authentication failed - no token received");
  }

  return data;
}

export async function completeOnboarding(formData) {
  const token = localStorage.getItem("restaurant_token");

  const payload = new FormData();

  payload.append("restaurant_name", formData.restaurantName);
  payload.append("address", formData.address);
  payload.append("city", formData.city);
  payload.append("zipcode", formData.zipcode);
  payload.append("phone", formData.phone);
  payload.append("description", formData.description || "");

  payload.append("cuisine", JSON.stringify(formData.cuisine));
  payload.append("features", JSON.stringify(formData.features));
  payload.append("hours", JSON.stringify(formData.hours));

  if (formData.thumbnail) {
    payload.append("thumbnail", formData.thumbnail);
  }

  formData.ambiancePhotos.forEach((photo, index) => {
    payload.append(`ambiance_photo_${index}`, photo);
  });

  formData.menuPhotos.forEach((photo, index) => {
    payload.append(`menu_photo_${index}`, photo);
  });

  const { data } = await axios.post(
    `${API_URL}/restaurant/complete-profile`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function getTodayReservations() {
  const token = localStorage.getItem("restaurant_token");

  // Debug logging
  console.log("📍 getTodayReservations called");
  console.log("🔑 Token exists:", !!token);
  console.log("🌐 API_URL:", API_URL);
  console.log("🎯 Full URL:", `${API_URL}/restaurant/reservations/today`);

  if (!token) {
    console.error("❌ No token found in localStorage");
    throw new Error("Not authenticated");
  }

  // Log first 20 chars of token for debugging (not the full token for security)
  console.log("🔑 Token preview:", token.substring(0, 20) + "...");

  try {
    console.log("📡 Making API request...");
    const { data } = await axios.get(
      `${API_URL}/restaurant/reservations/today`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Success! Data received:", data);
    return data;
  } catch (error) {
    console.error("❌ API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers,
      message: error.message,
    });
    throw error;
  }
}

export async function getRestaurantProfile() {
  const token = localStorage.getItem("restaurant_token");

  const { data } = await api.get("/restaurant/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateRestaurantProfile(formData) {
  const token = localStorage.getItem("restaurant_token");

  const payload = new FormData();

  payload.append("restaurant_name", formData.restaurantName);
  payload.append("address", formData.address);
  payload.append("city", formData.city);
  payload.append("zipcode", formData.zipcode);
  payload.append("phone", formData.phone);
  payload.append("description", formData.description || "");

  payload.append("cuisine", JSON.stringify(formData.cuisine));
  payload.append("features", JSON.stringify(formData.features));
  payload.append("hours", JSON.stringify(formData.hours));

  if (formData.thumbnail) {
    payload.append("thumbnail", formData.thumbnail);
  }

  formData.ambiancePhotos.forEach((photo, index) => {
    payload.append(`ambiance_photo_${index}`, photo);
  });

  formData.menuPhotos.forEach((photo, index) => {
    payload.append(`menu_photo_${index}`, photo);
  });

  const { data } = await axios.put(`${API_URL}/restaurant/profile`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
