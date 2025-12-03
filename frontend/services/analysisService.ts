import axiosInstance from "./axiosInstance";

export type AnalysisType =
  | "performance"
  | "architecture"
  | "optimization"
  | "comparison"
  | "PROJECT_PERFORMANCE"
  | "ARCHITECTURE_COMPARISON"
  | "COST_ANALYSIS"
  | "SECURITY_ANALYSIS";

export interface AnalysisMetrics {
  [key: string]: any;
}

export interface Recommendation {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action?: string;
  impact?: string;
}

export interface Analysis {
  id: string;
  type: AnalysisType;
  project_id?: string;
  metrics: AnalysisMetrics;
  recommendations: Recommendation[];
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const analysisService = {
  /**
   * Analyze project performance
   * Generate comprehensive performance analysis including DORA metrics, CI/CD metrics
   */
  analyzeProject: async (
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Analysis> => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const resp = await axiosInstance.post(
        `/analysis/projects/${projectId}/analyze`,
        null,
        { params }
      );
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to analyze project";
      throw new Error(message);
    }
  },

  /**
   * Compare architectures
   * Compare performance metrics across different deployment architectures
   */
  compareArchitectures: async (
    startDate?: string,
    endDate?: string
  ): Promise<Analysis> => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const resp = await axiosInstance.post(
        "/analysis/compare-architectures",
        null,
        { params }
      );
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to compare architectures";
      throw new Error(message);
    }
  },

  /**
   * Get all analysis reports for a specific project
   */
  getProjectAnalyses: async (projectId: string): Promise<Analysis[]> => {
    try {
      const resp = await axiosInstance.get(`/analysis/projects/${projectId}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch project analyses";
      throw new Error(message);
    }
  },

  /**
   * Get the most recent analysis report
   */
  getLatestAnalysis: async (
    projectId?: string,
    type?: AnalysisType
  ): Promise<Analysis> => {
    try {
      const params: any = {};
      if (projectId) params.project_id = projectId;
      if (type) params.type = type;

      const resp = await axiosInstance.get("/analysis/latest", { params });
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch latest analysis";
      throw new Error(message);
    }
  },

  /**
   * Get analysis by ID
   */
  getAnalysisById: async (id: string): Promise<Analysis> => {
    try {
      const resp = await axiosInstance.get(`/analysis/${id}`);
      return resp.data?.data ?? resp.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch analysis";
      throw new Error(message);
    }
  },
};

export default analysisService;
