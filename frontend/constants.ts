import {
  Status,
  Run,
  ChartDataPoint,
  DoraMetric,
  ArchitectureComparison,
  Recommendation,
} from "./types/types";

// API Configuration
// We use import.meta.env for Vite environment variables
// Fallback to localhost:3456 if env var is not set
export const API_BASE_URL = "http://localhost:3456/api/v1";

export const MOCK_RUNS: Run[] = [
  {
    id: "run-8392",
    branch: "main",
    commitMessage: "feat: update styling for sidebar",
    author: "alex.dev",
    status: Status.RUNNING,
    duration: "1m 20s",
    startedAt: "Just now",
    jobs: [
      {
        id: "job-1",
        name: "Build Frontend",
        status: Status.SUCCESS,
        duration: "45s",
        steps: [
          {
            id: "s1",
            name: "Checkout",
            status: Status.SUCCESS,
            duration: "5s",
            startedAt: "00:00",
          },
          {
            id: "s2",
            name: "Install Deps",
            status: Status.SUCCESS,
            duration: "25s",
            startedAt: "00:05",
          },
          {
            id: "s3",
            name: "Vite Build",
            status: Status.SUCCESS,
            duration: "15s",
            startedAt: "00:30",
          },
        ],
      },
      {
        id: "job-2",
        name: "Unit Tests",
        status: Status.RUNNING,
        duration: "35s",
        steps: [
          {
            id: "s4",
            name: "Run Jest",
            status: Status.RUNNING,
            duration: "35s",
            startedAt: "00:45",
          },
        ],
      },
    ],
  },
  {
    id: "run-8391",
    branch: "fix/login-bug",
    commitMessage: "fix: resolving race condition in auth",
    author: "sarah.engineer",
    status: Status.FAILURE,
    duration: "4m 12s",
    startedAt: "15 mins ago",
    logs: `Error: Timeout of 5000ms exceeded. Ensure the done() callback is being called in this test.
    at /app/src/auth/tests/login.test.ts:45:12`,
    jobs: [
      {
        id: "job-1",
        name: "Build Backend",
        status: Status.SUCCESS,
        duration: "1m 20s",
        steps: [
          {
            id: "s1",
            name: "Checkout",
            status: Status.SUCCESS,
            duration: "10s",
            startedAt: "00:00",
          },
          {
            id: "s2",
            name: "Nest Build",
            status: Status.SUCCESS,
            duration: "1m 10s",
            startedAt: "00:10",
          },
        ],
      },
      {
        id: "job-2",
        name: "Integration Tests",
        status: Status.FAILURE,
        duration: "2m 52s",
        steps: [
          {
            id: "s3",
            name: "Setup DB",
            status: Status.SUCCESS,
            duration: "20s",
            startedAt: "01:20",
          },
          {
            id: "s4",
            name: "Auth Tests",
            status: Status.FAILURE,
            duration: "2m 32s",
            startedAt: "01:40",
            logs: "Error: Timeout of 5000ms exceeded...",
          },
          {
            id: "s5",
            name: "User Tests",
            status: Status.SKIPPED,
            duration: "0s",
            startedAt: "-",
          },
        ],
      },
    ],
  },
  {
    id: "run-8390",
    branch: "main",
    commitMessage: "chore: bump dependencies",
    author: "bot-dependabot",
    status: Status.SUCCESS,
    duration: "12m 45s",
    startedAt: "1 hour ago",
    jobs: [
      {
        id: "job-1",
        name: "Security Scan",
        status: Status.SUCCESS,
        duration: "2m 10s",
        steps: [
          {
            id: "s1",
            name: "Trivy Scan",
            status: Status.SUCCESS,
            duration: "2m 10s",
            startedAt: "00:00",
          },
        ],
      },
      {
        id: "job-2",
        name: "E2E Tests",
        status: Status.SUCCESS,
        duration: "10m 35s",
        steps: [
          {
            id: "s2",
            name: "Cypress Run",
            status: Status.SUCCESS,
            duration: "10m 35s",
            startedAt: "02:10",
          },
        ],
      },
    ],
  },
  {
    id: "run-8389",
    branch: "feat/new-dashboard",
    commitMessage: "feat: add recharts integration",
    author: "dave.ui",
    status: Status.SUCCESS,
    duration: "8m 30s",
    startedAt: "2 hours ago",
    jobs: [],
  },
  {
    id: "run-8388",
    branch: "fix/api-latency",
    commitMessage: "perf: optimize database query",
    author: "backend.ninja",
    status: Status.FAILURE,
    duration: "2m 05s",
    startedAt: "3 hours ago",
    logs: `ConnectionError: pool is draining`,
    jobs: [
      {
        id: "job-1",
        name: "Lint",
        status: Status.SUCCESS,
        duration: "45s",
        steps: [],
      },
      {
        id: "job-2",
        name: "Unit Tests",
        status: Status.FAILURE,
        duration: "1m 20s",
        steps: [],
      },
    ],
  },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: "Mon", success: 45, failure: 2 },
  { name: "Tue", success: 52, failure: 5 },
  { name: "Wed", success: 48, failure: 1 },
  { name: "Thu", success: 61, failure: 8 },
  { name: "Fri", success: 55, failure: 3 },
  { name: "Sat", success: 20, failure: 0 },
  { name: "Sun", success: 15, failure: 1 },
];

export const DORA_METRICS: DoraMetric[] = [
  {
    id: "df",
    label: "Deployment Frequency",
    value: "High",
    target: "On Demand",
    status: "healthy",
    description: "Deploying multiple times per day on demand.",
  },
  {
    id: "lt",
    label: "Lead Time for Changes",
    value: "45m",
    target: "< 1h",
    status: "healthy",
    description: "Time from commit to production is optimized.",
  },
  {
    id: "cfr",
    label: "Change Failure Rate",
    value: "12%",
    target: "< 5%",
    status: "warning",
    description: "Failure rate is slightly above threshold due to flaky tests.",
  },
  {
    id: "mttr",
    label: "Mean Time to Restore",
    value: "1h 20m",
    target: "< 30m",
    status: "critical",
    description: "Recovery time is too slow. Needs automated rollbacks.",
  },
];

export const ARCHITECTURE_SCENARIOS: ArchitectureComparison[] = [
  { attribute: "Deploy Speed", monolith: 30, microservices: 85 },
  { attribute: "Stability", monolith: 60, microservices: 75 },
  { attribute: "Scalability", monolith: 40, microservices: 95 },
  { attribute: "Complexity", monolith: 20, microservices: 80 },
  { attribute: "Cost Efficiency", monolith: 80, microservices: 55 },
  { attribute: "Dev Velocity", monolith: 50, microservices: 90 },
];

export const STRATEGIC_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    title: "Migrate Inventory Module to Microservice",
    category: "Architecture",
    impact: "High",
    description:
      "The Inventory module causes 40% of Monolith build failures due to lock contention.",
    action: "Split into independent service with own DB.",
  },
  {
    id: "rec-2",
    title: "Adopt Mono-repo Tooling (Nx/Turborepo)",
    category: "Process",
    impact: "Medium",
    description:
      "Current Multi-repo setup adds 15m overhead to integration tests per PR.",
    action: "Consolidate repositories and implement affected graph testing.",
  },
  {
    id: "rec-3",
    title: "Vertical Scaling for CI Nodes",
    category: "Infrastructure",
    impact: "Medium",
    description: "Webpack builds are OOM-ing on 4GB nodes.",
    action: "Upgrade CI runners to 8GB RAM instances.",
  },
];
