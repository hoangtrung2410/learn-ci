import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ExternalLink, Shield } from "lucide-react";
import MetricsCard from "../../components/MetricsCard";
import DoraMetrics from "../../components/DoraMetrics";
import RunTable from "../../components/RunTable";
import { Run, Status } from "../../types/types";
import {
  pipelineService,
  analysisService,
  projectService,
} from "../../services";
import type { PipelineStatistics } from "../../services";

interface DashboardProps {
  runs: Run[];
  onRunSelect: (run: Run) => void;
  setActivePage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  runs: initialRuns,
  onRunSelect,
  setActivePage,
}) => {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<PipelineStatistics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  useEffect(() => {
    loadDashboardData();
  }, [selectedProject]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsData = await projectService.getAll({
        limit: 50,
        offset: 0,
      });
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);

      // Load pipelines with optional project filter
      const pipelineParams: any = { limit: 50, offset: 0 };
      if (selectedProject !== "ALL") {
        pipelineParams.project_id = selectedProject;
      }
      const pipelineData = await pipelineService.getList(pipelineParams);
      setPipelines(pipelineData?.data || pipelineData || []);

      // Load statistics with optional project filter
      const stats = await pipelineService.getStatistics(selectedProject !== "ALL" ? selectedProject : undefined);
      setStatistics(stats);

      // Generate chart data from last 7 days
      generateChartData(pipelineData?.data || pipelineData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (pipelinesData: any[]) => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayPipelines = pipelinesData.filter((p) => {
        const pDate = new Date(p.started_at || p.createdAt);
        return pDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        name: dateStr,
        success: dayPipelines.filter((p) => p.status === "success").length,
        failure: dayPipelines.filter((p) => p.status === "failed").length,
      });
    }

    setChartData(last7Days);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const runs = pipelines.map((p) => ({
    id: p.id,
    branch: p.branch || "main",
    commitMessage: p.commit_message || "No message",
    author: p.author || "Unknown",
    status:
      p.status === "success"
        ? Status.SUCCESS
        : p.status === "failed"
          ? Status.FAILURE
          : p.status === "running"
            ? Status.RUNNING
            : Status.QUEUED,
    duration: p.duration ? formatDuration(p.duration) : "0m 0s",
    startedAt: p.started_at || p.createdAt,
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Project Filter */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-400 whitespace-nowrap">
            Filter by Project:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="flex-1 max-w-xs bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
          >
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {selectedProject !== "ALL" && (
            <span className="text-xs text-slate-500">
              Showing data for selected project only
            </span>
          )}
        </div>
      </div>

      {/* Section: DORA Engine */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          DORA Metrics Engine
        </h2>
        <DoraMetrics projectId={selectedProject} />
      </div>

      {/* Section: Real-time Stats */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Operational Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            metric={{
              label: "Pass Rate",
              value: statistics?.success_rate
                ? `${statistics.success_rate.toFixed(1)}%`
                : "0%",
              change: 2.5,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "Avg Duration",
              value: statistics
                ? formatDuration(Math.floor(statistics.average_duration))
                : "0m 0s",
              change: -12,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "Total Runs",
              value: statistics?.total
                ? statistics.total.toString()
                : runs.length.toString(),
              change: 8.4,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "Failed Runs",
              value: statistics?.failed_count?.toString() || "0",
              change: 5,
              trend: "down",
            }}
          />
        </div>
      </div>

      {/* Section: Charts & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Stability Trend
              </h3>
              <p className="text-xs text-slate-500">
                Success vs Failure rate over time
              </p>
            </div>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              View Report <ExternalLink size={10} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    color: "#fff",
                    borderRadius: "6px",
                  }}
                  cursor={{ fill: "#27272a", opacity: 0.4 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="success"
                  name="Passed"
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="failure"
                  name="Failed"
                  stackId="a"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Pipeline Health
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Code Coverage</span>
                  <span className="text-white font-mono">86%</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: "86%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Flaky Tests</span>
                  <span className="text-amber-500 font-mono">Low (3)</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: "12%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tech Debt Ratio</span>
                  <span className="text-emerald-500 font-mono">A (1.2%)</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: "95%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surfaceHighlight/50 rounded-lg border border-border mt-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-white">
                Security Scan
              </span>
            </div>
            <p className="text-xs text-slate-400">
              No high severity vulnerabilities detected in the last scan.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Recent Activity
          </h3>
          <button
            onClick={() => setActivePage("runs")}
            className="text-xs text-primary hover:text-indigo-400"
          >
            View All
          </button>
        </div>
        <RunTable runs={runs.slice(0, 5)} onSelectRun={onRunSelect} />
      </div>
    </div>
  );
};

export default Dashboard;
