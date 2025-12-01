export enum Status {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  RUNNING = "RUNNING",
  QUEUED = "QUEUED",
  CANCELED = "CANCELED",
  SKIPPED = "SKIPPED",
}

export interface Step {
  id: string;
  name: string;
  status: Status;
  duration: string;
  startedAt: string;
  logs?: string;
}

export interface Job {
  id: string;
  name: string;
  status: Status;
  duration: string;
  steps: Step[];
}

export interface Run {
  id: string;
  branch: string;
  commitMessage: string;
  author: string;
  status: Status;
  duration: string;
  startedAt: string;
  jobs?: Job[]; // Added for Deep Dive
  logs?: string; // For AI analysis (aggregate)
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: number; // percentage
  trend: "up" | "down" | "neutral";
  description?: string;
}

export interface ChartDataPoint {
  name: string;
  success: number;
  failure: number;
}

export interface Token {
  id: number | string;
  name: string;
  token: string;
  created?: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  url_organization: string;
  token: Token;
  status?: string;
}

export interface User {
  refreshToken: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "developer" | "viewer";
  accessToken?: string;
}

// --- Insights / Optimizer Types ---

export interface DoraMetric {
  id: string;
  label: string;
  value: string;
  target: string;
  status: "healthy" | "warning" | "critical";
  description: string;
}

export interface ArchitectureComparison {
  attribute: string;
  monolith: number;
  microservices: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: "Architecture" | "Infrastructure" | "Process";
  impact: "High" | "Medium" | "Low";
  description: string;
  action: string;
}
