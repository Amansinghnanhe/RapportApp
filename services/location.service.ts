import api from '../utils/api';

export const updateMRLocation = async (
  lat: number,
  lng: number,
  speed?: number,
  accuracy?: number,
  batteryLevel?: number,
  isMockLocation?: boolean
) => {
  const res = await api.post('/mr/location', {
    lat, lng, speed, accuracy, batteryLevel, isMockLocation
  });
  return res.data.data;
};

export const getMRLocation = async (mrId: string) => {
  const res = await api.get('/mr/location/' + mrId);
  return res.data.data;
};

export const getNearbyMRs = async (lat: number, lng: number) => {
  const res = await api.get('/mr/location/nearby/search', {
    params: { lat, lng }
  });
  return res.data.data;
};

export const getMRPath = async (mrId: string) => {
  const res = await api.get('/mr/location/path/' + mrId);
  return res.data.data;
};

export const getOrderMRLocation = async (orderId: string) => {
  const res = await api.get('/mr/location/order/' + orderId);
  return res.data.data;
};

export const toggleMROnline = async () => {
  const res = await api.patch('/mr/toggle-online');
  return res.data.data;
};

export const getMRProfile = async () => {
  const res = await api.get('/mr/profile');
  return res.data.data;
};

export const getMRRetailers = async () => {
  const res = await api.get('/mr/retailers');
  return res.data.data;
};

export const getMROrders = async (view: 'active' | 'history' = 'active') => {
  const res = await api.get('/mr/orders', { params: { view } });
  return res.data.data;
};

export const updateMROrderStatus = async (
  orderId: string,
  status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'ESIM_ACTIVATED'
) => {
  const res = await api.patch('/mr/orders/' + orderId + '/update-status', { status });
  return res.data.data;
};