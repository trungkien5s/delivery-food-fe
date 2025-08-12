// utils/axiosConfig.js
import axios from 'axios';
import { store } from '../redux/store/store'; // Import your Redux store
import { tokenExpired } from '../redux/store/slices/userSlice';

// Request interceptor để tự động attach token vào mọi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle token expiration
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu response có status 401 (Unauthorized), có thể token đã hết hạn
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Không dispatch tokenExpired nếu đang ở trang login hoặc register
      if (currentPath !== '/login' && currentPath !== '/register') {
        store.dispatch(tokenExpired());
        
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;