import { Token } from "../types/types";
import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export const tokenService = {
  getAll: async (params?: PaginationDto): Promise<Token[]> => {
    try {
      const resp = await axiosInstance.get("/tokens", { params });
      return resp.data.data;
    } catch (err: any) {
      console.error("Failed to fetch tokens:", err);
      throw new Error("Failed to fetch tokens");
    }
  },
  create: async (data: { name: string; token: string }): Promise<Token> => {
    const resp = await axiosInstance.post("/tokens", data);
    return resp.data.data;
  },

  update: async (
    id: number | string,
    data: { name: string; token: string }
  ): Promise<Token> => {
    const resp = await axiosInstance.put(`/tokens/${id}`, data);
    return resp.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`/tokens/${id}`);
  },
};
