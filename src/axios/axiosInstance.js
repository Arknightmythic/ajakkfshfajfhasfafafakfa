import axios from 'axios';

const createAxiosInstance = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
};

const axiosInstance = {
  dashboardapi: createAxiosInstance(import.meta.env.VITE_DASHBOARD_API_URL),
};

export default axiosInstance;