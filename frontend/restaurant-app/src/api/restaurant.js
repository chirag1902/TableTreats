import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

export async function restaurantSignup(payload) {
  const { data } = await api.post("/restaurants/signup", payload);
  return data;           // returns {token, restaurant_id, ...}
}