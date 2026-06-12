// utils/orderApi.ts
// ✅ FIX: Now uses the shared `api` axios instance (with token interceptor)
//         instead of raw fetch() with hardcoded IPs.
import api from './api';

// ── ORDER APIs ──────────────────────────────────────────

export const createCheckoutSession = async (
  items: { planId: string; quantity: number }[],
  orderType = 'NORMAL'
) => {
  const res = await api.post('/checkout-session', { items, orderType });
  return res.data;
};

export const createOrder = async (body: {
  sessionId: string;
  addressId: string;
  paymentMethod: 'COD' | 'UPI' | 'ONLINE' | 'NETBANKING';
  orderType?: string;
}) => {
  const res = await api.post('/orders', body);
  return res.data;
};

export const getMROrders = async (view: 'active' | 'history' = 'active') => {
  const res = await api.get(`/orders/mr/assigned?view=${view}`);
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await api.patch(`/orders/${orderId}/status/mr`, { status });
  return res.data;
};

export const getUserAddresses = async () => {
  const res = await api.get('/address');
  return res.data;
};

// ── LOCATION APIs ───────────────────────────────────────

export const updateMRLocation = async (lat: number, lng: number) => {
  const res = await api.post('/mr/location', {
    lat,
    lng,
    speed: 0,
    isMockLocation: false,
  });
  return res.data;
};

export const toggleMROnline = async () => {
  const res = await api.patch('/mr/toggle-online');
  return res.data;
};

// ── KYC APIs ────────────────────────────────────────────

export const sendAadhaarOtp = async (aadhaar: string) => {
  const res = await api.post('/kyc/aadhaar/send-otp', { aadhaar });
  return res.data;
};

export const verifyAadhaarOtp = async (refId: string, otp: string) => {
  const res = await api.post('/kyc/aadhaar/verify-otp', { refId, otp });
  return res.data;
};

export const verifyPan = async (pan: string) => {
  const res = await api.post('/kyc/pan/verify', { pan });
  return res.data;
};

export const verifyBank = async (account: string, ifsc: string) => {
  const res = await api.post('/kyc/bank/verify', { account, ifsc });
  return res.data;
};

export const getMyKyc = async () => {
  const res = await api.get('/kyc/me');
  return res.data;
};

// ── SUPPORT TICKET APIs ─────────────────────────────────

export const createTicket = async (title: string, description: string) => {
  const res = await api.post('/tickets', { title, description });
  return res.data;
};

export const getMyTickets = async () => {
  const res = await api.get('/tickets');
  return res.data;
};

// ── ANALYTICS APIs ──────────────────────────────────────

export const getDashboardSummary = async () => {
  const res = await api.get('/analytics/dashboard-summary');
  return res.data;
};

export const getSalesTrend = async () => {
  const res = await api.get('/analytics/sales-trend');
  return res.data;
};

export const getMRPerformance = async () => {
  const res = await api.get('/analytics/mr-performance');
  return res.data;
};