import api from '../utils/api';

export const createCheckoutSession = async (
  type: 'DIRECT' | 'THROUGHCART',
  planId?: string,
  quantity?: number
) => {
  const res = await api.post('/checkout/session', { type, planId, quantity });
  return res.data.data.sessionId;
};

export const getCheckoutSession = async (sessionId: string) => {
  const res = await api.get(`/checkout/session/${sessionId}`);
  return res.data.data;
};