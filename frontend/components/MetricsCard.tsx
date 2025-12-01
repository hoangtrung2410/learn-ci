import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { StatMetric } from "../types/types";

interface MetricsCardProps {
  metric: StatMetric;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metric }) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-error";
      default:
        return "text-secondary";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp size={12} strokeWidth={3} />;
      case "down":
        return <ArrowDown size={12} strokeWidth={3} />;
      default:
        return <Minus size={12} strokeWidth={3} />;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between hover:border-slate-600 transition-colors group h-full">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
          {metric.label}
        </span>
        {metric.change !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold ${getTrendColor(metric.trend)} bg-opacity-10 px-1.5 py-0.5 rounded`}
          >
            {getTrendIcon(metric.trend)}
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <span className="text-2xl font-bold text-white tracking-tight">
          {metric.value}
        </span>
      </div>
    </div>
  );
};

export default MetricsCard;
