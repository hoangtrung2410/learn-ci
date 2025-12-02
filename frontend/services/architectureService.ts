import axiosInstance from "./axiosInstance";

export type ArchitectureType =
  | "MONOLITHIC"
  | "MICROSERVICES"
  | "SERVERLESS"
  | "HYBRID";

export interface DeploymentArchitecture {
  id: string;
  key: string;
  name: string;
  type: ArchitectureType;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateArchitectureDto {
  key: string;
  name: string;
  type: ArchitectureType;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

export interface UpdateArchitectureDto {
  name?: string;
  type?: ArchitectureType;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

export interface ArchitectureStatistics {
  total_projects: number;
  average_performance: number;
  success_rate: number;
  [key: string]: any;
}

export const architectureService = {
  /**
   * Get all deployment architectures
   */
  getAll: async (): Promise<DeploymentArchitecture[]> => {
    try {
      const resp = await axiosInstance.get("/architectures");
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch architectures";
      throw new Error(message);
    }
  },

  /**
   * Get architecture by ID
   */
  getById: async (id: string): Promise<DeploymentArchitecture> => {
    try {
      const resp = await axiosInstance.get(`/architectures/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch architecture";
      throw new Error(message);
    }
  },

  /**
   * Get architecture by key
   */
  getByKey: async (key: string): Promise<DeploymentArchitecture> => {
    try {
      const resp = await axiosInstance.get(`/architectures/key/${key}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch architecture";
      throw new Error(message);
    }
  },

  /**
   * Create a new architecture
   */
  create: async (
    data: CreateArchitectureDto
  ): Promise<DeploymentArchitecture> => {
    try {
      const resp = await axiosInstance.post("/architectures", data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to create architecture";
      throw new Error(message);
    }
  },

  /**
   * Update an architecture
   */
  update: async (
    id: string,
    data: UpdateArchitectureDto
  ): Promise<DeploymentArchitecture> => {
    try {
      const resp = await axiosInstance.put(`/architectures/${id}`, data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to update architecture";
      throw new Error(message);
    }
  },

  /**
   * Delete an architecture
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/architectures/${id}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to delete architecture";
      throw new Error(message);
    }
  },

  /**
   * Get architecture statistics
   */
  getStatistics: async (id: string): Promise<ArchitectureStatistics> => {
    try {
      const resp = await axiosInstance.get(`/architectures/${id}/statistics`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch statistics";
      throw new Error(message);
    }
  },
};

export default architectureService;
