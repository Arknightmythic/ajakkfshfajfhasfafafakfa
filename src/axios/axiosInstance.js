import axios from 'axios';

const createAxiosInstance = (baseURL) => {
  return axios.create({
    baseURL,
    // timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const axiosInstance = {
  general: createAxiosInstance(import.meta.env.VITE_API_URL_GENERAL),
  synchronize: createAxiosInstance(import.meta.env.VITE_API_URL_SYNCHRONIZE)
};

export default axiosInstance;