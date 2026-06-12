// utils/config.ts
// ✅ FIX: Single source of truth for API URL — change this one place only
export const API_URL = 'http://192.168.29.108:5000/api/v1';

export const ENDPOINTS = {
  login:          `${API_URL}/auth/login`,
  register:       `${API_URL}/auth/register`,
  verifyOtp:      `${API_URL}/auth/verify-otp`,
  profile:        `${API_URL}/user/profile`,
  changePassword: `${API_URL}/user/change-password`,
  retailers:      `${API_URL}/mr/retailers`,
  orders:         `${API_URL}/orders`,
  kyc:            `${API_URL}/kyc`,
  analytics:      `${API_URL}/analytics`,
  visitLog:       `${API_URL}/mr/location`,
  tickets:        `${API_URL}/admin/tickets`,
  mrProfile:      `${API_URL}/mr/profile`,
  toggleOnline:   `${API_URL}/mr/toggle-online`,
  checkout:       `${API_URL}/checkout-session`,
};