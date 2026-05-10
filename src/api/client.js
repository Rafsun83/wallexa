import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost/self_management";
// 'http://localhost:8080';

export const STORAGE = {
  ACCESS: "wallet.accessToken",
  REFRESH: "wallet.refreshToken",
  USER: "wallet.user",
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let onUnauthorized = null;
export function setUnauthorizedCallback(cb) {
  onUnauthorized = cb;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE.ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(STORAGE.ACCESS);
      localStorage.removeItem(STORAGE.REFRESH);
      localStorage.removeItem(STORAGE.USER);
      onUnauthorized?.();
    }
    return Promise.reject(err);
  },
);
