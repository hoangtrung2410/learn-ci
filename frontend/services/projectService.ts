import { Project } from "../types/types";
import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export interface CreateProjectDto {
  name: string;
  description?: string;
  url_organization?: string;
  token?: any;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  url_organization?: string;
  token?: any;
  status?: string;
}

export const projectService = {
  /**
   * Get all projects with pagination
   */
  getAll: async (params?: PaginationDto): Promise<Project[]> => {
    try {
      const resp = await axiosInstance.get("/projects", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch projects";
      throw new Error(message);
    }
  },

  /**
   * Get project by ID
   */
  getDetail: async (id: string): Promise<Project> => {
    try {
      const resp = await axiosInstance.get(`/projects/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch project";
      throw new Error(message);
    }
  },

  /**
   * Create a new project
   */
  create: async (data: CreateProjectDto): Promise<Project> => {
    try {
      const resp = await axiosInstance.post("/projects", data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create project";
      throw new Error(message);
    }
  },

  /**
   * Update a project
   */
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    try {
      const resp = await axiosInstance.put(`/projects/${id}`, data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update project";
      throw new Error(message);
    }
  },

  /**
   * Delete a project
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete project";
      throw new Error(message);
    }
  },
};

export default projectService;
