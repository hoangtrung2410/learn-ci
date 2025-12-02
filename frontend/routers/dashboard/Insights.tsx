import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { analysisService } from "../../services";
import { DoraMetric } from "../../types/types";

const Insights: React.FC = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [comparisonAnalysis, setComparisonAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    try {
      setLoading(true);

      // Load latest performance analysis
      const perfAnalysis = await analysisService.getLatestAnalysis(
        undefined,
        "PROJECT_PERFORMANCE"
      );
      setAnalysis(perfAnalysis);

      // Load architecture comparison
      const compAnalysis = await analysisService.getLatestAnalysis(
        undefined,
        "ARCHITECTURE_COMPARISON"
      );
      setComparisonAnalysis(compAnalysis);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (
    value: number,
    thresholds: { healthy: number; warning: number }
  ): DoraMetric["status"] => {
    if (value <= thresholds.healthy) return "healthy";
    if (value <= thresholds.warning) return "warning";
    return "critical";
  };

  const doraMetrics = analysis?.metrics?.dora
    ? [
        {
          id: "df",
          label: "Deployment Frequency",
          value: `${parseFloat(analysis.metrics.dora.deployment_frequency).toFixed(1)}/day`,
          target: "1+/day",
          status: getStatus(
            parseFloat(analysis.metrics.dora.deployment_frequency),
            { healthy: 5, warning: 1 }
          ),
        },
        {
          id: "lt",
          label: "Lead Time",
          value: `${analysis.metrics.dora.lead_time_for_changes}h`,
          target: "< 24h",
          status: getStatus(analysis.metrics.dora.lead_time_for_changes, {
            healthy: 24,
            warning: 48,
          }),
        },
        {
          id: "cfr",
          label: "Change Failure Rate",
          value: `${parseFloat(analysis.metrics.dora.change_failure_rate).toFixed(1)}%`,
          target: "< 15%",
          status: getStatus(
            parseFloat(analysis.metrics.dora.change_failure_rate),
            { healthy: 15, warning: 30 }
          ),
        },
        {
          id: "mttr",
          label: "Mean Time to Recover",
          value: `${analysis.metrics.dora.mean_time_to_recovery}m`,
          target: "< 60m",
          status: getStatus(analysis.metrics.dora.mean_time_to_recovery, {
            healthy: 60,
            warning: 120,
          }),
        },
      ]
    : [];

  // Architecture comparison radar data
  const architectureData = comparisonAnalysis?.comparison_data
    ? [
        {
          attribute: "Deploy Frequency",
          monolith:
            (comparisonAnalysis.comparison_data.monolithic
              .avg_deployment_frequency /
              20) *
            100,
          microservices:
            (comparisonAnalysis.comparison_data.microservices
              .avg_deployment_frequency /
              20) *
            100,
        },
        {
          attribute: "Build Speed",
          monolith:
            100 -
            (comparisonAnalysis.comparison_data.monolithic.avg_build_time /
              600) *
              100,
          microservices:
            100 -
            (comparisonAnalysis.comparison_data.microservices.avg_build_time /
              600) *
              100,
        },
        {
          attribute: "Success Rate",
          monolith:
            comparisonAnalysis.comparison_data.monolithic.avg_success_rate,
          microservices:
            comparisonAnalysis.comparison_data.microservices.avg_success_rate,
        },
        {
          attribute: "Recovery Time",
          monolith:
            100 -
            (comparisonAnalysis.comparison_data.monolithic.avg_recovery_time /
              300) *
              100,
          microservices:
            100 -
            (comparisonAnalysis.comparison_data.microservices
              .avg_recovery_time /
              300) *
              100,
        },
        {
          attribute: "Lead Time",
          monolith:
            100 -
            (comparisonAnalysis.comparison_data.monolithic.avg_lead_time / 72) *
              100,
          microservices:
            100 -
            (comparisonAnalysis.comparison_data.microservices.avg_lead_time /
              72) *
              100,
        },
      ]
    : [];

  const recommendations = analysis?.recommendations || [];

  const getStatusColor = (status: DoraMetric["status"]) => {
    switch (status) {
      case "healthy":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
      case "warning":
        return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case "critical":
        return "text-rose-500 border-rose-500/20 bg-rose-500/5";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: DoraMetric["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle size={16} />;
      case "warning":
        return <AlertCircle size={16} />;
      case "critical":
        return <TrendingDown size={16} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-fade-in space-y-6 mt-4">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            DevOps Insights & Optimization
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            ERP System Performance Analysis based on Pipeline Telemetry
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Last Analysis
          </span>
          <p className="text-sm font-mono text-slate-300">Today, 09:41 AM</p>
        </div>
      </div>

      {/* DORA Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doraMetrics.map((metric) => (
          <div
            key={metric.id}
            className={`p-5 rounded-lg border flex flex-col justify-between ${getStatusColor(metric.status)} bg-opacity-5`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                {metric.label}
              </span>
              {getStatusIcon(metric.status)}
            </div>
            <div className="mb-1">
              <span className="text-3xl font-bold tracking-tight">
                {metric.value}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-70">
              <span>Target: {metric.target}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Architecture Comparison Radar */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">
              Architecture Simulation: Monolith vs Microservices
            </h3>
            <p className="text-sm text-slate-500">
              Comparative analysis based on current ERP pipeline logs vs.
              projected Microservices performance.
            </p>
          </div>
          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={architectureData}
              >
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis
                  dataKey="attribute"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Current Monolith"
                  dataKey="monolith"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Target Microservices"
                  dataKey="microservices"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={20} className="text-amber-500" />
            <h3 className="text-lg font-semibold text-white">
              Optimization Strategy
            </h3>
          </div>

          <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar">
            {recommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-surfaceHighlight/30 border border-border hover:border-slate-600 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      rec.category === "architecture"
                        ? "bg-indigo-500/20 text-indigo-300"
                        : rec.category === "build" || rec.category === "cache"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {rec.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Priority: {rec.priority}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-1 group-hover:text-primary transition-colors">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {rec.description}
                </p>
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs mb-1">
                    <span className="text-primary font-medium">Impact:</span>
                    <span className="text-slate-300">{rec.impact}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-primary font-medium">Effort:</span>
                    <span className="text-slate-300">{rec.effort}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
              Generate Full Report <TrendingUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
