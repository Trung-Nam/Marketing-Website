import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";

type Role = "user" | "admin" | string;

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  img: string;
};

type Credentials = { email: string; password: string };
type RegisterInput = { name: string; email: string; password: string };
type UpdateProfileInput = { name: string; img: string };
type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: Credentials) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  updateProfile: (payload: UpdateProfileInput) => Promise<void>;
  changePassword: (payload: ChangePasswordInput) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      async login(payload) {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", payload);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          toast.success("Đăng nhập thành công");
        } catch (error: unknown) {
          // Show specific error message from server if available
          const errorMessage =
            (error as ApiError)?.response?.data?.message ||
            "Đăng nhập thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      async register(payload) {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", payload);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          toast.success("Đăng ký thành công");
        } catch (error: unknown) {
          // Show specific error message from server if available
          const errorMessage =
            (error as ApiError)?.response?.data?.message || "Đăng ký thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      async updateProfile(payload) {
        set({ isLoading: true });
        try {
          const { data } = await api.put("/auth/me", payload);
          set({
            user: data.user || { ...get().user, ...payload },
          });
          toast.success("Cập nhật profile thành công");
        } catch (error: unknown) {
          // Show specific error message from server if available
          const errorMessage =
            (error as ApiError)?.response?.data?.message ||
            "Cập nhật profile thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      async changePassword(payload) {
        set({ isLoading: true });
        try {
          const { data } = await api.put("/auth/me/password", payload);
          if (data.ok && data.token) {
            // Update token with new one returned from server
            set({
              token: data.token,
            });
          }
          toast.success("Đổi mật khẩu thành công");
        } catch (error: unknown) {
          // Show specific error message from server if available
          const errorMessage =
            (error as ApiError)?.response?.data?.message ||
            (error as ApiError)?.response?.data?.error ||
            "Đổi mật khẩu thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      logout() {
        set({ user: null, token: null, isAuthenticated: false });
        toast.info("Đã đăng xuất");
      },
      hasRole(role) {
        const user = get().user;
        if (!user) return false;
        const userRole = String(user.role || "").toLowerCase();
        const target = String(role || "").toLowerCase();
        // Accept exact match or common prefixed formats like ROLE_ADMIN
        return (
          userRole === target ||
          userRole.endsWith(target) ||
          userRole.includes(target)
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
