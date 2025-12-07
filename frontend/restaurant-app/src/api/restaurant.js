import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8001/api";

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

  if (data.access_token) {
    localStorage.setItem("restaurant_token", data.access_token);
  } else {
    localStorage.setItem("restaurant_token", "logged_in");
    localStorage.setItem("restaurant_email", credentials.email);
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

// FIXED: Removed duplicate /api from the URL
export async function getTodayReservations() {
  const token = localStorage.getItem("restaurant_token");

  const { data } = await axios.get(
    `${API_URL}/restaurant/reservations/today`, // Fixed: removed /api
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
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
