import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export const userService = {
  /**
   * Get all users with pagination
   */
  getAllUsers: async (params?: PaginationDto & { search?: string }) => {
    try {
      const resp = await axiosInstance.get("/users", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch users";
      throw new Error(message);
    }
  },

  /**
   * Get deleted users
   */
  getDeletedUsers: async (params?: PaginationDto) => {
    try {
      const resp = await axiosInstance.get("/users/deleted", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch deleted users";
      throw new Error(message);
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const resp = await axiosInstance.get(`/users/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch user";
      throw new Error(message);
    }
  },

  /**
   * Get current user's profile
   */
  getMyProfile: async (): Promise<User> => {
    try {
      const resp = await axiosInstance.get("/users/me/profile");
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch profile";
      throw new Error(message);
    }
  },

  /**
   * Update user profile
   */
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    try {
      const resp = await axiosInstance.put(`/users/${id}`, data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update user";
      throw new Error(message);
    }
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/users/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete user";
      throw new Error(message);
    }
  },

  /**
   * Restore deleted user
   */
  restoreUser: async (id: string): Promise<User> => {
    try {
      const resp = await axiosInstance.put(`/users/restore/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to restore user";
      throw new Error(message);
    }
  },
};

export default userService;
