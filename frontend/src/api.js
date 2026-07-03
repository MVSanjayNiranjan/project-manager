import axios from "axios";

// Use production API URL if available, otherwise proxy to localhost
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || "/api" 
});

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
