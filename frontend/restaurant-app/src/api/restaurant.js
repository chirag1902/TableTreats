import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001/api",
  headers: { "Content-Type": "application/json" },
});

export async function restaurantSignup(payload) {
  const { data } = await api.post("/restaurant/signup", payload);
  return data;
}

export async function restaurantLogin(credentials) {
  const { data } = await api.post("/restaurant/login", credentials);
  return data;
}
