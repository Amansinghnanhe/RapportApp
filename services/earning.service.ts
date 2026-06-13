import api from '../utils/api';

export const getEarningDashboard = async () => {
  const res = await api.get('/mr/earnings/dashboard-summary');
  return res.data.data;
};