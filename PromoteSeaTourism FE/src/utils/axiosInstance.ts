import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7206/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message ?? "Đã xảy ra lỗi";
    const url = error?.config?.url;

    // Don't show toast for login/register errors - let the auth store handle them
    const isAuthEndpoint =
      url?.includes("/auth/login") ||
      url?.includes("/auth/register") ||
      url?.includes("/auth/me/password");

    if (status === 401) {
      // Only show session expired message for authenticated requests, not login attempts
      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }
    } else if (status >= 500) {
      toast.error("Lỗi máy chủ, vui lòng thử lại sau");
    } else if (!isAuthEndpoint) {
      // Only show error message for non-auth endpoints
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
