import api from '../utils/api';

export const getMRAssignedOrders = async (view: 'active' | 'history' = 'active') => {
  const res = await api.get('/orders/mr-assigned', { params: { view } });
  return res.data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'ESIM_ACTIVATED'
) => {
  const res = await api.put('/orders/' + orderId + '/status', { status });
  return res.data.data;
};

export const cancelMRAssignment = async (orderId: string) => {
  const res = await api.post('/orders/' + orderId + '/mr-cancel');
  return res.data.data;
};

export const getOrderById = async (orderId: string) => {
  const res = await api.get('/orders/' + orderId);
  return res.data.data;
};

export const createOrder = async (orderData: {
  orderType?: string;
  sessionId?: string;
  addressId?: string;
  paymentMethod?: string;
  existingNumber?: string;
  previousOperator?: string;
  fancyNumberId?: string;
  businessDetails?: {
    planId: string;
    numberOfSims: number;
    companyName: string;
    companyPhone: string;
    gstNumber?: string;
  };
}) => {
  const res = await api.post('/orders', orderData);
  return res.data.data;
};

export const getMyOrders = async (status?: string) => {
  const res = await api.get('/orders', { params: status ? { status } : {} });
  return res.data.data;
};

export const cancelOrder = async (orderId: string) => {
  const res = await api.post('/orders/' + orderId + '/cancel');
  return res.data.data;
};
