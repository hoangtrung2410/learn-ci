// Export all services for easy import
export { default as authService } from "./authService";
export { default as projectService } from "./projectService";
export { default as tokenService } from "./tokenService";
export { default as pipelineService } from "./pipelineService";
export { default as analysisService } from "./analysisService";
export { default as userService } from "./userService";
export { default as architectureService } from "./architectureService";
export * as geminiService from "./geminiService";

// Re-export types
export type { User, UpdateUserDto } from "./userService";
export type {
  Pipeline,
  PipelineStatus,
  CreatePipelineDto,
  UpdatePipelineDto,
  PipelineStatistics,
} from "./pipelineService";
export type {
  Analysis,
  AnalysisType,
  AnalysisMetrics,
  Recommendation,
} from "./analysisService";
export type {
  DeploymentArchitecture,
  ArchitectureType,
  CreateArchitectureDto,
  UpdateArchitectureDto,
  ArchitectureStatistics,
} from "./architectureService";
export type { CreateTokenDto, UpdateTokenDto } from "./tokenService";
export type { CreateProjectDto, UpdateProjectDto } from "./projectService";
