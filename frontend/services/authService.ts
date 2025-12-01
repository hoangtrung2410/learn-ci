// src/services/authService.ts
import { LoginResponse } from "@/types/model.type";
import { User } from "@/types/types";
import axiosInstance from "./axiosInstance";

const MOCK_USER: User = {
  id: "u-trung-1",
  name: "Hoang Van Trung",
  email: "hoangvantrung24102k@gmail.com",
  role: "developer",
  avatar: "https://github.com/shadcn.png",
  accessToken: "mock-jwt-token-xyz",
  refreshToken: "mock-refresh-token-abc",
};

const SIMULATED_DELAY = 800;

export const authService = {
  loginWithGithub: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
    return {
      ...MOCK_USER,
      name: "GitHub User",
      email: "github_dev@example.com",
      avatar: "https://github.com/github.png",
    };
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const resp = await axiosInstance.post("/auth/login", { email, password });
      const data = resp.data?.data ?? resp.data;

      if (data && (data.accessToken || data.refreshToken)) {
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }

      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const resp = await axiosInstance.post("/auth/register", {
        email,
        password,
        name,
      });
      return resp.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const resp = await axiosInstance.get("/users/me/profile");
      return resp.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch profile";
      throw new Error(message);
    }
  },
};
export default authService;
