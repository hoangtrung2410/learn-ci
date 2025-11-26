import { Status, Run, ChartDataPoint, DoraMetric, ArchitectureComparison, Recommendation } from './types';

// Trỏ về Backend NestJS
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3456/api/v1';

// Mock data for development and testing

export const MOCK_RUNS: Run[] = [
  {
    id: 'run-8392',
    branch: 'main',
    commitMessage: 'feat: update styling for sidebar',
    author: 'alex.dev',
    status: Status.RUNNING,
    duration: '1m 20s',
    startedAt: 'Just now',
  },
  {
    id: 'run-8391',
    branch: 'fix/login-bug',
    commitMessage: 'fix: resolving race condition in auth',
    author: 'sarah.engineer',
    status: Status.FAILURE,
    duration: '4m 12s',
    startedAt: '15 mins ago',
    logs: `Error: Timeout of 5000ms exceeded. Ensure the done() callback is being called in this test.
    at /app/src/auth/tests/login.test.ts:45:12
    at Generator.next (<anonymous>)
    at fulfilled (/app/src/auth/tests/login.test.ts:5:58)

FAIL src/auth/tests/login.test.ts
  ● Auth Service › should handle concurrent login requests

  ReferenceError: process is not defined
    at Object.<anonymous> (src/utils/env.ts:3:15)
    at Object.asyncJestTest (src/auth/tests/login.test.ts:45:12)`
  },
  {
    id: 'run-8390',
    branch: 'main',
    commitMessage: 'chore: bump dependencies',
    author: 'bot-dependabot',
    status: Status.SUCCESS,
    duration: '12m 45s',
    startedAt: '1 hour ago',
  },
  {
    id: 'run-8389',
    branch: 'feat/new-dashboard',
    commitMessage: 'feat: add recharts integration',
    author: 'dave.ui',
    status: Status.SUCCESS,
    duration: '8m 30s',
    startedAt: '2 hours ago',
  },
  {
    id: 'run-8388',
    branch: 'fix/api-latency',
    commitMessage: 'perf: optimize database query',
    author: 'backend.ninja',
    status: Status.FAILURE,
    duration: '2m 05s',
    startedAt: '3 hours ago',
    logs: `ConnectionError: pool is draining and cannot accept work
    at Pool.acquire (/node_modules/pg-pool/index.js:20:12)
    at Client.connect (/src/db/connector.ts:89:15)

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`
  },
  {
    id: 'run-8387',
    branch: 'main',
    commitMessage: 'docs: update readme',
    author: 'alex.dev',
    status: Status.SUCCESS,
    duration: '1m 10s',
    startedAt: '5 hours ago',
  },
  {
    id: 'run-8386',
    branch: 'feat/user-profile',
    commitMessage: 'feat: add avatar upload',
    author: 'sarah.engineer',
    status: Status.SUCCESS,
    duration: '5m 22s',
    startedAt: '6 hours ago',
  },
  {
    id: 'run-8385',
    branch: 'chore/cleanup',
    commitMessage: 'refactor: remove unused variables',
    author: 'linter-bot',
    status: Status.CANCELED,
    duration: '0m 45s',
    startedAt: '8 hours ago',
  },
  {
    id: 'run-8384',
    branch: 'fix/mobile-nav',
    commitMessage: 'fix: z-index issue on mobile menu',
    author: 'dave.ui',
    status: Status.SUCCESS,
    duration: '3m 15s',
    startedAt: '1 day ago',
  }
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: 'Mon', success: 45, failure: 2 },
  { name: 'Tue', success: 52, failure: 5 },
  { name: 'Wed', success: 48, failure: 1 },
  { name: 'Thu', success: 61, failure: 8 },
  { name: 'Fri', success: 55, failure: 3 },
  { name: 'Sat', success: 20, failure: 0 },
  { name: 'Sun', success: 15, failure: 1 },
];

export const DORA_METRICS: DoraMetric[] = [
  {
    id: 'df',
    label: 'Deployment Frequency',
    value: '4/day',
    target: '>10/day',
    status: 'warning',
    description: 'How often an organization successfully releases to production.'
  },
  {
    id: 'lt',
    label: 'Lead Time for Changes',
    value: '28 hours',
    target: '<12 hours',
    status: 'warning',
    description: 'The amount of time it takes a commit to get into production.'
  },
  {
    id: 'cfr',
    label: 'Change Failure Rate',
    value: '12%',
    target: '<5%',
    status: 'critical',
    description: 'The percentage of deployments causing a failure in production.'
  },
  {
    id: 'mttr',
    label: 'Time to Restore',
    value: '45 mins',
    target: '<60 mins',
    status: 'healthy',
    description: 'How long it takes to recover from a failure in production.'
  }
];

export const ARCHITECTURE_SCENARIOS: ArchitectureComparison[] = [
  { attribute: 'Deploy Speed', monolith: 30, microservices: 85 },
  { attribute: 'Stability', monolith: 60, microservices: 75 },
  { attribute: 'Scalability', monolith: 40, microservices: 95 },
  { attribute: 'Complexity', monolith: 20, microservices: 80 },
  { attribute: 'Cost Efficiency', monolith: 80, microservices: 55 },
  { attribute: 'Dev Velocity', monolith: 50, microservices: 90 },
];

export const STRATEGIC_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Migrate Inventory Module to Microservice',
    category: 'Architecture',
    impact: 'High',
    description: 'The Inventory module causes 40% of Monolith build failures due to lock contention.',
    action: 'Split into independent service with own DB.'
  },
  {
    id: 'rec-2',
    title: 'Adopt Mono-repo Tooling (Nx/Turborepo)',
    category: 'Process',
    impact: 'Medium',
    description: 'Current Multi-repo setup adds 15m overhead to integration tests per PR.',
    action: 'Consolidate repositories and implement affected graph testing.'
  },
  {
    id: 'rec-3',
    title: 'Vertical Scaling for CI Nodes',
    category: 'Infrastructure',
    impact: 'Medium',
    description: 'Webpack builds are OOM-ing on 4GB nodes.',
    action: 'Upgrade CI runners to 8GB RAM instances.'
  }
];