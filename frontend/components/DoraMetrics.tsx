import React, { useEffect, useState } from "react";
import { Timer, Activity, AlertTriangle, TrendingDown } from "lucide-react";
import { analysisService } from "../services";

interface DoraMetricsProps {
  projectId?: string;
}

const DoraMetrics: React.FC<DoraMetricsProps> = ({ projectId }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoraMetrics();
  }, [projectId]);

  const loadDoraMetrics = async () => {
    try {
      const analysis = await analysisService.getLatestAnalysis(
        projectId && projectId !== "ALL" ? projectId : undefined,
        "performance"
      );
      if (analysis && analysis.metrics?.dora) {
        setMetrics(analysis.metrics.dora);
      } else {
        setMetrics(null);
      }
    } catch (error) {
      console.error("Failed to load DORA metrics:", error);
      // Set empty metrics on error to prevent crashes
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (
    value: number,
    thresholds: { healthy: number; warning: number }
  ) => {
    if (value <= thresholds.healthy) return "healthy";
    if (value <= thresholds.warning) return "warning";
    return "critical";
  };

  const doraMetrics = [
    {
      id: "df",
      label: "Deployment Frequency",
      value: metrics
        ? `${parseFloat(metrics.deployment_frequency).toFixed(1)}/day`
        : "Loading...",
      target: "1+/day",
      status: metrics
        ? getStatus(parseFloat(metrics.deployment_frequency), {
          healthy: 5,
          warning: 1,
        })
        : "healthy",
      description: "How often code is deployed to production",
    },
    {
      id: "lt",
      label: "Lead Time",
      value: metrics ? `${metrics.lead_time_for_changes}h` : "Loading...",
      target: "< 24h",
      status: metrics
        ? getStatus(metrics.lead_time_for_changes, { healthy: 24, warning: 48 })
        : "healthy",
      description: "Time from commit to production deployment",
    },
    {
      id: "cfr",
      label: "Change Failure Rate",
      value: metrics
        ? `${parseFloat(metrics.change_failure_rate).toFixed(1)}%`
        : "Loading...",
      target: "< 15%",
      status: metrics
        ? getStatus(parseFloat(metrics.change_failure_rate), {
          healthy: 15,
          warning: 30,
        })
        : "healthy",
      description: "Percentage of deployments causing failures",
    },
    {
      id: "mttr",
      label: "Mean Time to Recover",
      value: metrics ? `${metrics.mean_time_to_recovery}m` : "Loading...",
      target: "< 60m",
      status: metrics
        ? getStatus(metrics.mean_time_to_recovery, {
          healthy: 60,
          warning: 120,
        })
        : "healthy",
      description: "Average time to recover from failures",
    },
  ];

  const getIcon = (id: string) => {
    switch (id) {
      case "df":
        return <Activity size={18} />;
      case "lt":
        return <Timer size={18} />;
      case "cfr":
        return <AlertTriangle size={18} />;
      case "mttr":
        return <TrendingDown size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "critical":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {doraMetrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-md ${getStatusColor(metric.status)}`}
              >
                {getIcon(metric.id)}
              </div>
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                {metric.label}
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${metric.status === "healthy"
                ? "bg-emerald-500"
                : metric.status === "warning"
                  ? "bg-amber-500"
                  : "bg-rose-500"
                }`}
            ></span>
          </div>

          <div className="mt-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {metric.value}
              </span>
              <span className="text-xs text-slate-500 mb-1">
                vs target {metric.target}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              {metric.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoraMetrics;
