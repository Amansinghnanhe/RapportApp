export const API_URL = 'http://192.168.29.108:5000/api/v1';

export const ENDPOINTS = {
  login:          `${API_URL}/auth/login`,
  register:       `${API_URL}/auth/register`,
  verifyOtp:      `${API_URL}/auth/verify-otp`,
  profile:        `${API_URL}/user/profile`,
  changePassword: `${API_URL}/user/change-password`,
  retailers:      `${API_URL}/marketR`,        // ✅ Yahi sahi hai
  orders:         `${API_URL}/checkout`,        // ✅ Yahi sahi hai
  kyc:            `${API_URL}/kyc`,
  analytics:      `${API_URL}/analytics`,
  visitLog:       `${API_URL}/mr/location`,     // ✅ Yahi sahi hai
  tickets:        `${API_URL}/admin/tickets`,
  mrProfile:      `${API_URL}/mr/profile`,      // ✅ Naya add kiya
  toggleOnline:   `${API_URL}/mr/toggle-online`,// ✅ Naya add kiya
};