import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  GitBranch,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Run, Status } from "../types/types";

interface RunTableProps {
  runs: Run[];
  onSelectRun: (run: Run) => void;
}

const RunTable: React.FC<RunTableProps> = ({ runs, onSelectRun }) => {
  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.SUCCESS:
        return <CheckCircle2 size={16} className="text-success" />;
      case Status.FAILURE:
        return <XCircle size={16} className="text-error" />;
      case Status.RUNNING:
        return <Loader2 size={16} className="text-primary animate-spin" />;
      default:
        return <Clock size={16} className="text-secondary" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.SUCCESS:
        return "bg-success/10 text-success border-success/20";
      case Status.FAILURE:
        return "bg-error/10 text-error border-error/20";
      case Status.RUNNING:
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-surfaceHighlight/30">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Run History
          </h3>
          <span className="bg-border text-slate-400 px-2 py-0.5 rounded-full text-xs font-mono">
            {runs.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
            Filter
          </button>
          <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
            Columns
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase text-slate-500 font-semibold bg-surface">
              <th className="px-5 py-3 w-12">Status</th>
              <th className="px-5 py-3">Commit & Message</th>
              <th className="px-5 py-3">Branch</th>
              <th className="px-5 py-3">Author</th>
              <th className="px-5 py-3 text-right">Timing</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs.map((run) => (
              <tr
                key={run.id}
                onClick={() => onSelectRun(run)}
                className="hover:bg-surfaceHighlight transition-colors cursor-pointer group"
              >
                <td className="px-5 py-3 align-top">
                  <div
                    className={`mt-1 w-6 h-6 rounded flex items-center justify-center ${getStatusColor(run.status)}`}
                  >
                    {getStatusIcon(run.status)}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors line-clamp-1">
                      {run.commitMessage}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1 hover:underline cursor-pointer">
                        <span className="text-primary opacity-80">#</span>
                        {run.id.split("-")[1]}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 align-top">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 bg-background border border-border px-2 py-1 rounded-md w-fit font-mono">
                    <GitBranch size={12} />
                    {run.branch}
                  </div>
                </td>
                <td className="px-5 py-3 align-top">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                      {run.author.charAt(0).toUpperCase()}
                    </div>
                    {run.author}
                  </div>
                </td>
                <td className="px-5 py-3 text-right align-top">
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-xs font-mono text-slate-300">
                      {run.duration}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {run.startedAt}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 align-middle text-right">
                  <ArrowRight
                    size={14}
                    className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunTable;
