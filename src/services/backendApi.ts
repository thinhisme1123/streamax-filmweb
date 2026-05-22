import axios from 'axios';

export const backendApi = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend running on port 5000
  timeout: 10000,
});

// Add a request interceptor to attach the JWT token
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
