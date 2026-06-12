import api from '../utils/api';

export const addToCart    = (planId: string, quantity: number) =>
  api.post('/cart', { planId, quantity });

export const getCart      = () => api.get('/cart');

export const updateCart   = (planId: string, quantity: number) =>
  api.put(`/cart/${planId}`, { quantity });

export const removeFromCart = (planId: string) =>
  api.delete(`/cart/${planId}`);

export const clearCart    = () => api.delete('/cart/clear');