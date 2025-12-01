import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { Run, Status, Job, Step } from "../types/types";
import { analyzeBuildError } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

interface RunDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  run: Run | null;
}

const RunDetailsPanel: React.FC<RunDetailsPanelProps> = ({
  isOpen,
  onClose,
  run,
}) => {
  const [activeTab, setActiveTab] = useState<"timeline" | "ai">("timeline");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && run?.status === Status.FAILURE) {
      // Auto-switch to AI tab if failed
      setActiveTab("ai");
      handleAnalyze();
    } else {
      setActiveTab("timeline");
      setAnalysis(null);
    }
    // Expand all jobs by default
    if (run?.jobs) {
      const allExpanded = run.jobs.reduce(
        (acc, job) => ({ ...acc, [job.id]: true }),
        {}
      );
      setExpandedJobs(allExpanded);
    }
  }, [isOpen, run]);

  const handleAnalyze = async () => {
    if (!run?.logs) return;
    setIsAnalyzing(true);
    const result = await analyzeBuildError(run.logs);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const toggleJob = (jobId: string) => {
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.SUCCESS:
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case Status.FAILURE:
        return <XCircle size={16} className="text-rose-500" />;
      case Status.RUNNING:
        return <Loader2 size={16} className="text-indigo-500 animate-spin" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
        );
    }
  };

  const getDurationWidth = (durationStr: string) => {
    // Mock calculation for visualization bar width
    if (durationStr.includes("m")) return "w-3/4";
    if (durationStr === "0s") return "w-0";
    return "w-1/4";
  };

  if (!isOpen || !run) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[600px] bg-[#0c0c0e] border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surfaceHighlight/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">#{run.id}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                run.status === Status.SUCCESS
                  ? "bg-emerald-500/10 text-emerald-400"
                  : run.status === Status.FAILURE
                    ? "bg-rose-500/10 text-rose-400"
                    : "bg-indigo-500/10 text-indigo-400"
              }`}
            >
              {run.status}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white mt-1 truncate max-w-[400px]">
            {run.commitMessage}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "timeline" ? "border-primary text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
        >
          Pipeline Deep Dive
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "ai" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
        >
          <Sparkles size={14} /> AI Analysis
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>Execution Graph</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Total Duration: {run.duration}
              </span>
            </div>

            {!run.jobs || run.jobs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No detailed job data available for this run.
              </div>
            ) : (
              <div className="space-y-3 relative">
                {/* Connector Line Logic can be added here for visualization */}

                {run.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-surface border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleJob(job.id)}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={16}
                          className={`text-slate-500 transition-transform ${expandedJobs[job.id] ? "rotate-90" : ""}`}
                        />
                        {getStatusIcon(job.status)}
                        <span className="text-sm font-medium text-slate-200">
                          {job.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {job.duration}
                      </span>
                    </div>

                    {expandedJobs[job.id] && (
                      <div className="border-t border-border/50 bg-[#050507]">
                        {job.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-4 px-4 py-2 pl-12 border-b border-border/20 last:border-0 hover:bg-white/5 group"
                          >
                            <div className="w-4 flex justify-center">
                              {getStatusIcon(step.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span
                                  className={`text-xs font-medium ${step.status === Status.FAILURE ? "text-rose-400" : "text-slate-300"}`}
                                >
                                  {step.name}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono">
                                  {step.duration}
                                </span>
                              </div>
                              {/* Visual Gantt Bar */}
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${step.status === Status.FAILURE ? "bg-rose-500" : "bg-emerald-500"}`}
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            </div>
                            {step.logs && (
                              <div className="p-2 mt-1 mx-4 bg-rose-950/30 border border-rose-900/50 rounded text-[10px] font-mono text-rose-300 whitespace-pre-wrap">
                                {step.logs}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ai" && (
          <div className="space-y-4 animate-fade-in">
            {run.status !== Status.FAILURE && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 size={20} />
                <div>
                  <p className="font-semibold">Build Successful</p>
                  <p className="text-xs opacity-80">
                    No errors detected. AI analysis is optimized for failure
                    triage.
                  </p>
                </div>
              </div>
            )}

            {run.logs && (
              <div className="bg-[#1e1e24] rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-2 bg-black/40 border-b border-border flex items-center gap-2">
                  <Terminal size={12} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">
                    build_logs.txt
                  </span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {run.logs}
                  </pre>
                </div>
              </div>
            )}

            {run.status === Status.FAILURE && (
              <div className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-semibold text-white">
                    Gemini Analysis
                  </h3>
                </div>

                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <Loader2 size={24} className="animate-spin mb-2" />
                    <span className="text-xs">Analyzing log patterns...</span>
                  </div>
                ) : analysis ? (
                  <div className="prose prose-invert prose-sm max-w-none text-xs">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={handleAnalyze}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded transition-colors"
                    >
                      Start Root Cause Analysis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-surface">
        <button
          onClick={onClose}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default RunDetailsPanel;
