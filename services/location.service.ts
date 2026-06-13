import api from '../utils/api';

export type LocationDataInput = {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  batteryLevel?: number;
  isMockLocation?: boolean;
};

// ── 1. LOCATION APIs (Sahi Backend Route Ke Saath) ───────────────────
export const updateMRLocation = async (locationData: LocationDataInput) => {
  const res = await api.post('/mr/update-location', {
    lat: locationData.latitude,
    lng: locationData.longitude,
    speed: locationData.speed ?? 0,
    accuracy: locationData.accuracy ?? 0,
    batteryLevel: locationData.batteryLevel ?? 100,
    isMockLocation: locationData.isMockLocation ?? false
  });
  return res.data.data;
};

// ── 2. MR ORDERS FETCH (Dono frontend calls ko ek kiya) ──────────────
export const getMROrders = async (view: 'active' | 'history' = 'active') => {
  // Check karein aapke backend router mein exact path kya hai: '/orders/mr-assigned' ya '/mr/orders'
  const res = await api.get('/orders/mr-assigned', { params: { view } });
  return res.data.data;
};

// ── 3. UPDATE ORDER STATUS ──────────────────────────────────────────
export const updateMROrderStatus = async (
  orderId: string,
  status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'ESIM_ACTIVATED' | 'CANCELLED'
) => {
  // Backend controller 'updateOrderStatusMR' expects patch on orderId directly
  const res = await api.patch(`/orders/${orderId}/status/mr`, { status });
  return res.data.data;
};

// ── 4. KYC UTILS ────────────────────────────────────────────────────
export const sendAadhaarOtp = async (aadhaar: string) => {
  const res = await api.post('/kyc/aadhaar/send-otp', { aadhaar });
  return res.data;
};

export const verifyAadhaarOtp = async (refId: string, otp: string) => {
  const res = await api.post('/kyc/aadhaar/verify-otp', { refId, otp });
  return res.data;
};