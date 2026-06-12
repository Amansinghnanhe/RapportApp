import api from '../utils/api';

export const createRazorpayOrder = async (amount: number) => {
  const res = await api.post('/payment/razorpay/create', { amount });
  return res.data.order;
};

export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const res = await api.post('/payment/razorpay/verify', paymentData);
  return res.data;
};
