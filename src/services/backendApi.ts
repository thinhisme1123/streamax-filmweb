import axios from 'axios';

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api',
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

// Add a response interceptor to handle 401 Unauthorized errors globally
backendApi.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      console.warn('Token expired or unauthorized. Forcefully logging out...');
      
      // 1. Clear the token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('movie_user');
      
      // 2. Dispatch logout to global state (dynamically imported to prevent circular dependency)
      import('../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      }).catch(err => console.error("Error dispatching logout", err))
        .finally(() => {
          // 3. Soft refresh to completely reset the React tree with the logged-out state
          window.location.reload();
        });
    }
    return Promise.reject(error);
  }
);
