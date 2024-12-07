import axios from "axios";
import { create } from "zustand";
import { toast } from "react-hot-toast";

export interface SignUpCredentials {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isLoggingOut: false,
  login: async (credentials: LoginCredentials) => {
    set({ isLoggingIn: true });
    try {
      const response = await axios.post("/api/v1/auth/login", credentials);
      set({ user: await response.data.user });
      toast.success("Logged in successfully");
    } catch (error: any) {
      set({ isLoggingIn: false, user: null });
      toast.error(error.response.data.message || "Login failed");
    }
  },
  signup: async (credentials: SignUpCredentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axios.post("/api/v1/auth/register", credentials);
      set({ user: await response.data.user });
      toast.success("Account created successfully");
    } catch (error: any) {
      toast.error(error.response.data.message || "An error occurred");
      set({ isSigningUp: false, user: null });
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axios.post("/api/v1/auth/logout");
      set({ user: null, isLoggingOut: false });
      toast.success("Logged out successfully");
    } catch (error: any) {
      set({ isLoggingOut: false });
      toast.error(error.response.data.message || "Logged out failed");
    }
  },
  authCheck: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get("/api/v1/auth/check");
      set({ user: response.data.user, isCheckingAuth: false });
    } catch (error: any) {
      set({ user: null, isCheckingAuth: false });
      // toast.error(error.response.data.message || "An error occurred");
    }
  },
}));
