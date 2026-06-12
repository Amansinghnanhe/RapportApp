// utils/api.ts
import axios from 'axios';
import { getToken } from './storage';

// ✅ FIX: Replace with your actual local IP (run `ipconfig` on Windows or `ifconfig` on Mac/Linux)
// Example: 'http://192.168.29.108:5000/api/v1'
export const BASE_URL = 'http://192.168.29.108:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;