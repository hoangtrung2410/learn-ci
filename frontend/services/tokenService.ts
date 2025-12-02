import { Token } from "../types/types";
import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export interface CreateTokenDto {
  name: string;
  token: string;
}

export interface UpdateTokenDto {
  name?: string;
  token?: string;
}

export const tokenService = {
  /**
   * Get all tokens with pagination
   */
  getAll: async (params?: PaginationDto): Promise<Token[]> => {
    try {
      const resp = await axiosInstance.get("/tokens", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch tokens";
      throw new Error(message);
    }
  },

  /**
   * Get token by ID
   */
  getById: async (id: number | string): Promise<Token> => {
    try {
      const resp = await axiosInstance.get(`/tokens/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch token";
      throw new Error(message);
    }
  },

  /**
   * Create a new token
   */
  create: async (data: CreateTokenDto): Promise<Token> => {
    try {
      const resp = await axiosInstance.post("/tokens", data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create token";
      throw new Error(message);
    }
  },

  /**
   * Update a token
   */
  update: async (id: number | string, data: UpdateTokenDto): Promise<Token> => {
    try {
      const resp = await axiosInstance.put(`/tokens/${id}`, data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update token";
      throw new Error(message);
    }
  },

  /**
   * Delete a token
   */
  delete: async (id: number | string): Promise<void> => {
    try {
      await axiosInstance.delete(`/tokens/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete token";
      throw new Error(message);
    }
  },
};

export default tokenService;
