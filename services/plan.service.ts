import api from '../utils/api';

export const getAllPlans = async (filters?: {
  operatorId?: string;
  networkType?: string;
}) => {
  const res = await api.get('/plans', { params: filters });
  return res.data.data;
};

export const getPlanById = async (id: string) => {
  const res = await api.get(`/plans/${id}`);
  return res.data.data;
};