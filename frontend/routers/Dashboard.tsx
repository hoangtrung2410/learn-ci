import React from "react";
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
import MetricsCard from "../components/MetricsCard";
import DoraMetrics from "../components/DoraMetrics";
import RunTable from "../components/RunTable";
import { Run, Status } from "../types/types";
import { MOCK_CHART_DATA } from "../constants";

interface DashboardProps {
  runs: Run[];
  onRunSelect: (run: Run) => void;
  setActivePage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  runs,
  onRunSelect,
  setActivePage,
}) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Section: DORA Engine */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          DORA Metrics Engine
        </h2>
        <DoraMetrics />
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
              value: "94.2%",
              change: 2.5,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "P95 Duration",
              value: "4m 12s",
              change: -12,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "Weekly Runs",
              value: runs.length.toString(),
              change: 8.4,
              trend: "up",
            }}
          />
          <MetricsCard
            metric={{
              label: "Active Issues",
              value: runs
                .filter((r) => r.status === Status.FAILURE)
                .length.toString(),
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
              <BarChart data={MOCK_CHART_DATA} barSize={20}>
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
