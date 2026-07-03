import axios from "axios";

// All requests go to /api — proxied to http://localhost:5000 in dev
const API = axios.create({ baseURL: "/api" });

// Attach JWT token automatically to every request
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem("pm_user");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
