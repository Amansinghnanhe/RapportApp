import axios from 'axios';
import { getToken } from './storage';

export const BASE_URL = 'http://192.168.29.108:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log('TOKEN:', token);
  console.log('URL:', config.baseURL + config.url);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API ERROR:', error.message);
    console.log('STATUS:', error.response?.status);
    console.log('DATA:', JSON.stringify(error.response?.data));
    return Promise.reject(error);
  }
);

export default api;