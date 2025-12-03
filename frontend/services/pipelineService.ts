import axiosInstance from "./axiosInstance";
import { PaginationDto } from "../types/model.type";

export type PipelineStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELED";

export interface Pipeline {
  id: string;
  project_id: string;
  pipeline_number: number;
  branch?: string;
  commit_hash?: string;
  commit_message?: string;
  author?: string;
  status: PipelineStatus;
  duration?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePipelineDto {
  project_id: string;
  branch?: string;
  commit_hash?: string;
  commit_message?: string;
  author?: string;
  status?: PipelineStatus;
}

export interface UpdatePipelineDto {
  branch?: string;
  commit_hash?: string;
  commit_message?: string;
  author?: string;
  status?: PipelineStatus;
  duration?: number;
  error_message?: string;
}

export interface PipelineStatistics {
  total: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  average_duration: number;
}

export const pipelineService = {

  getList: async (
    params?: PaginationDto & { project_id?: string; status?: PipelineStatus }
  ) => {
    try {
      const resp = await axiosInstance.get("/pipelines", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch pipelines";
      throw new Error(message);
    }
  },

  analyzeError: async (errorMessage: string): Promise<string> => {
    try {
      const resp = await axiosInstance.post("/pipelines/analyze-error", {
        error_message: errorMessage,
      });
      return resp.data?.data?.analysis ?? resp.data?.analysis;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to analyze error message";
      throw new Error(message);
    }
  },

  getStatistics: async (projectId?: string): Promise<PipelineStatistics> => {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const resp = await axiosInstance.get("/pipelines/statistics", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch statistics";
      throw new Error(message);
    }
  },

  getDetail: async (id: string): Promise<Pipeline> => {
    try {
      const resp = await axiosInstance.get(`/pipelines/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch pipeline";
      throw new Error(message);
    }
  },

  create: async (data: CreatePipelineDto): Promise<Pipeline> => {
    try {
      const resp = await axiosInstance.post("/pipelines", data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to create pipeline";
      throw new Error(message);
    }
  },


  update: async (id: string, data: UpdatePipelineDto): Promise<Pipeline> => {
    try {
      const resp = await axiosInstance.put(`/pipelines/${id}`, data);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to update pipeline";
      throw new Error(message);
    }
  },


  updateStatus: async (
    id: string,
    status: PipelineStatus,
    errorMessage?: string
  ): Promise<Pipeline> => {
    try {
      const resp = await axiosInstance.put(`/pipelines/${id}/status`, {
        status,
        error_message: errorMessage,
      });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update status";
      throw new Error(message);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/pipelines/${id}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to delete pipeline";
      throw new Error(message);
    }
  },
};

export default pipelineService;
