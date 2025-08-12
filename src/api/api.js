import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE, // nhớ set biến môi trường
});

// Gắn access_token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// (Tuỳ chọn) Tự refresh access token khi bị 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_BASE}/auth/refresh`,
            { refresh_token: refresh }
          );
          const newToken = data?.data?.access_token;
          if (newToken) {
            localStorage.setItem("access_token", newToken);
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original); // gọi lại request cũ
          }
        } catch (e) {
          // Refresh fail → xoá token, chuyển về login nếu cần
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
