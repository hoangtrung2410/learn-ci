import React, { useState, useEffect } from "react";
import { Search, Filter, Sliders } from "lucide-react";
import RunTable from "../../components/RunTable";
import { Run, Status } from "../../types/types";
import { pipelineService, projectService } from "../../services";

interface RunsProps {
  runs: Run[];
  searchQuery: string;
  onRunSelect: (run: Run) => void;
}

const Runs: React.FC<RunsProps> = ({
  runs: initialRuns,
  searchQuery,
  onRunSelect,
}) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | Status>("ALL");
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  useEffect(() => {
    loadRunsData();
  }, []);

  const loadRunsData = async () => {
    try {
      setLoading(true);
      const [pipelineData, projectData] = await Promise.all([
        pipelineService.getList({ limit: 100, offset: 0 }),
        projectService.getAll({ limit: 50, offset: 0 }),
      ]);

      setPipelines(pipelineData?.data || pipelineData || []);
      setProjects(projectData || []);
    } catch (error) {
      console.error("Failed to load runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const runs: Run[] = pipelines.map((p) => ({
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
            : p.status === "pending"
              ? Status.QUEUED
              : Status.QUEUED,
    duration: p.duration ? formatDuration(p.duration) : "0m 0s",
    startedAt: p.started_at || p.createdAt,
  }));

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || run.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      {/* Runs Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Workflow Runs
          </h2>
          <p className="text-slate-500 text-sm">History across all branches</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-surface border border-border rounded text-slate-400 hover:text-white">
            <Filter size={16} />
          </button>
          <button className="p-2 bg-surface border border-border rounded text-slate-400 hover:text-white">
            <Sliders size={16} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === "ALL" ? "bg-primary text-white" : "bg-background text-slate-400 hover:text-white"}`}
          >
            All Runs
          </button>
          <button
            onClick={() => setStatusFilter(Status.FAILURE)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === Status.FAILURE ? "bg-error text-white" : "bg-background text-slate-400 hover:text-white"}`}
          >
            Failures
          </button>
          <button
            onClick={() => setStatusFilter(Status.SUCCESS)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === Status.SUCCESS ? "bg-success text-white" : "bg-background text-slate-400 hover:text-white"}`}
          >
            Success
          </button>
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredRuns.length} runs
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {filteredRuns.length > 0 ? (
          <RunTable runs={filteredRuns} onSelectRun={onRunSelect} />
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-surface/50">
            <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center mb-3">
              <Search size={20} className="text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium">No runs found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Runs;
