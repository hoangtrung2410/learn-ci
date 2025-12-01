import { Project } from "../types/types";
import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export const projectService = {
  getAll: async (params?: PaginationDto): Promise<Project[]> => {
    try {
      const resp = await axiosInstance.get("/projects", { params });
      return resp.data.data;
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      throw new Error("Failed to fetch projects");
    }
  },

  create: async (data: Omit<Project, "id" | "status">): Promise<Project> => {
    const resp = await axiosInstance.post("/projects", data);
    return resp.data.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const resp = await axiosInstance.put(`/projects/${id}`, data);
    return resp.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/projects/${id}`);
  },
};
