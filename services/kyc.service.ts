import api from '../utils/api';

export const getMyKyc = async () => {
  const res = await api.get('/kyc/me');
  return res.data;
};

export const sendAadhaarOtp = async (aadhaar: string) => {
  const res = await api.post('/kyc/aadhaar/send-otp', { aadhaar });
  return res.data;
};

export const resendAadhaarOtp = async (aadhaar: string) => {
  const res = await api.post('/kyc/aadhaar/resend-otp', { aadhaar });
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

export const verifyBank = async (account: string, ifsc: string, phone?: string) => {
  const res = await api.post('/kyc/bank/verify', { account, ifsc, phone: phone || '' });
  return res.data;
};

export const uploadKycVideo = async (formData: FormData) => {
  const res = await api.post('/kyc/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
