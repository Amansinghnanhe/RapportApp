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