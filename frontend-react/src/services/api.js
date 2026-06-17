import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const predictConsumption = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/predict-with-recommendations`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error in prediction:', error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
