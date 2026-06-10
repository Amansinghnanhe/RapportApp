import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.5:3000/api/v1';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ── ORDER APIs ──────────────────────────────────────────

export const createCheckoutSession = async (
  items: { planId: string; quantity: number }[],
  orderType = 'NORMAL'
) => {
  const res = await fetch(`${BASE_URL}/checkout-session`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ items, orderType }),
  });
  return res.json();
};

export const createOrder = async (body: {
  sessionId: string;
  addressId: string;
  paymentMethod: 'COD' | 'UPI' | 'ONLINE' | 'NETBANKING';
  orderType?: string;
}) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
};

export const getMROrders = async (view: 'active' | 'history' = 'active') => {
  const res = await fetch(`${BASE_URL}/orders/mr/assigned?view=${view}`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status/mr`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const getUserAddresses = async () => {
  const res = await fetch(`${BASE_URL}/address`, {
    headers: await getHeaders(),
  });
  return res.json();
};

// ── LOCATION APIs ───────────────────────────────────────

export const updateMRLocation = async (lat: number, lng: number) => {
  const res = await fetch(`${BASE_URL}/mr/location`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      lat,
      lng,
      speed: 0,
      isMockLocation: false,
    }),
  });
  return res.json();
};

export const toggleMROnline = async () => {
  const res = await fetch(`${BASE_URL}/mr/toggle-online`, {
    method: 'PATCH',
    headers: await getHeaders(),
  });
  return res.json();
};

// ── KYC APIs ────────────────────────────────────────────

export const sendAadhaarOtp = async (aadhaar: string) => {
  const res = await fetch(`${BASE_URL}/kyc/aadhaar/send-otp`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ aadhaar }),
  });
  return res.json();
};

export const verifyAadhaarOtp = async (refId: string, otp: string) => {
  const res = await fetch(`${BASE_URL}/kyc/aadhaar/verify-otp`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ refId, otp }),
  });
  return res.json();
};

export const verifyPan = async (pan: string) => {
  const res = await fetch(`${BASE_URL}/kyc/pan/verify`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ pan }),
  });
  return res.json();
};

export const verifyBank = async (account: string, ifsc: string) => {
  const res = await fetch(`${BASE_URL}/kyc/bank/verify`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ account, ifsc }),
  });
  return res.json();
};

export const getMyKyc = async () => {
  const res = await fetch(`${BASE_URL}/kyc/me`, {
    headers: await getHeaders(),
  });
  return res.json();
};

// ── SUPPORT TICKET APIs ─────────────────────────────────

export const createTicket = async (title: string, description: string) => {
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ title, description }),
  });
  return res.json();
};

export const getMyTickets = async () => {
  const res = await fetch(`${BASE_URL}/tickets`, {
    headers: await getHeaders(),
  });
  return res.json();
};

// ── ANALYTICS APIs ──────────────────────────────────────

export const getDashboardSummary = async () => {
  const res = await fetch(`${BASE_URL}/analytics/dashboard-summary`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const getSalesTrend = async () => {
  const res = await fetch(`${BASE_URL}/analytics/sales-trend`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const getMRPerformance = async () => {
  const res = await fetch(`${BASE_URL}/analytics/mr-performance`, {
    headers: await getHeaders(),
  });
  return res.json();
};