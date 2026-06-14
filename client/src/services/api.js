import axios from 'axios';

export const fetchDashboardData = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/balances`);
  return response.data;
};
