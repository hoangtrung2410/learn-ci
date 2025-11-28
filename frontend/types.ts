export enum Status {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RUNNING = 'RUNNING',
  QUEUED = 'QUEUED',
  CANCELED = 'CANCELED'
}

export interface Run {
  id: string;
  branch: string;
  commitMessage: string;
  author: string;
  status: Status;
  duration: string;
  startedAt: string;
  logs?: string; // For AI analysis
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: number; // percentage
  trend: 'up' | 'down' | 'neutral';
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'viewer';
  accessToken?: string;
}

// --- Insights / Optimizer Types ---

export interface DoraMetric {
  id: string;
  label: string;
  value: string;
  target: string;
  status: 'healthy' | 'warning' | 'critical';
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
  category: 'Architecture' | 'Infrastructure' | 'Process';
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  action: string;
}