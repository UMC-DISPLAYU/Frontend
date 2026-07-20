import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

export const axiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json');

  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});
