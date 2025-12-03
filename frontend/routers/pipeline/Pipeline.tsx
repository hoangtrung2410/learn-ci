import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  GitBranch,
  GitCommit,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Circle,
  Eye,
  Trash2,
} from "lucide-react";
import { pipelineService, projectService } from "../../services";
import { Run, Status } from "../../types/types";

interface RunsProps {
  runs: Run[]; // không dùng nhiều (giữ tương thích)
  searchQuery: string; // không dùng nhiều (giữ tương thích)
  onRunSelect: (run: any) => void; // mở panel chi tiết
}

const Runs: React.FC<RunsProps> = ({ onRunSelect }) => {
  const navigate = useNavigate();

  // dữ liệu & tải
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // bộ lọc
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Status>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [branches, setBranches] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // phân trang client
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // tải dữ liệu
  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, statusFilter, branchFilter, dateFrom, dateTo, search]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1) Projects
      const projectData = await projectService.getAll({ limit: 50, offset: 0 });
      const projectsList = Array.isArray(projectData)
        ? projectData
        : Array.isArray(projectData.projects)
          ? projectData.projects
          : [];
      setProjects(projectsList);

      // 2) Pipelines (server side có thể filter theo project)
      const params: any = { limit: 1000, offset: 0 };
      if (selectedProject !== "ALL") params.project_id = selectedProject;
      const res = await pipelineService.getList(params);
      const all = res?.data || res || [];

      // branches unique
      const uniqBranches = Array.from(
        new Set(all.map((p: any) => p.branch).filter(Boolean))
      ) as string[];
      setBranches(uniqBranches);

      // client-side filters
      let filtered = [...all];

      // search
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((p: any) =>
          (p.commit_message || "").toLowerCase().includes(q) ||
          (p.branch || "").toLowerCase().includes(q) ||
          (p.author || "").toLowerCase().includes(q) ||
          (p.name || "").toLowerCase().includes(q)
        );
      }

      // status
      if (statusFilter !== "ALL") {
        const map: Record<Status, string> = {
          [Status.SUCCESS]: "success",
          [Status.FAILURE]: "failed",
          [Status.RUNNING]: "running",
          [Status.QUEUED]: "pending",
          [Status.CANCELED]: "cancelled",
          [Status.SKIPPED]: "skipped",
        };
        filtered = filtered.filter((p: any) => (p.status || "").toLowerCase() === map[statusFilter]);
      }

      // branch
      if (branchFilter !== "ALL") {
        filtered = filtered.filter((p: any) => p.branch === branchFilter);
      }

      // date range
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        filtered = filtered.filter((p: any) => {
          const d = new Date(p.started_at || p.createdAt);
          return d >= from;
        });
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter((p: any) => {
          const d = new Date(p.started_at || p.createdAt);
          return d <= to;
        });
      }

      setPipelines(filtered);
      setCurrentPage(1); // reset về trang đầu khi thay filter
    } catch (e) {
      console.error("Failed to load runs:", e);
    } finally {
      setLoading(false);
    }
  };

  // utils
  const relativeTime = (iso?: string) => {
    if (!iso) return "N/A";
    const now = Date.now();
    const past = new Date(iso).getTime();
    const diffMs = now - past;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const formatDuration = (started?: string, finished?: string | null, status?: string) => {
    if (!started) return "N/A";
    const s = (status || "").toLowerCase();
    if (s === "running") return "Running...";
    if (!finished) return "N/A";
    const st = new Date(started).getTime();
    const ft = new Date(finished).getTime();
    const sec = Math.max(0, Math.floor((ft - st) / 1000));
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return m > 0 ? `${m}m ${r}s` : `${r}s`;
  };

  const getStatusIcon = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "success") return <CheckCircle className="w-4 h-4" />;
    if (s === "failed") return <XCircle className="w-4 h-4" />;
    if (s === "running") return <Loader2 className="w-4 h-4 animate-spin" />;
    return <Circle className="w-4 h-4" />;
    ;
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    const map: Record<string, { bg: string; text: string; label: string }> = {
      success: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Success" },
      failed: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Failed" },
      running: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Running" },
      pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
      cancelled: { bg: "bg-slate-500/10", text: "text-slate-400", label: "Cancelled" },
      skipped: { bg: "bg-slate-500/10", text: "text-slate-400", label: "Skipped" },
    };
    const style = map[s] || map.pending;
    return (
      <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text} w-fit`}>
        {getStatusIcon(status)}
        {style.label}
      </span>
    );
  };

  const getTriggerBadge = (trigger?: string) => {
    if (!trigger) return null;
    const map: Record<string, { icon: string; color: string }> = {
      push: { icon: "📤", color: "bg-blue-500/10 text-blue-400" },
      pull_request: { icon: "🔀", color: "bg-purple-500/10 text-purple-400" },
      manual: { icon: "👤", color: "bg-slate-500/10 text-slate-400" },
      schedule: { icon: "⏰", color: "bg-indigo-500/10 text-indigo-400" },
      tag: { icon: "🏷️", color: "bg-emerald-500/10 text-emerald-400" },
    };
    const style = map[(trigger || "").toLowerCase()] || map.push;
    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${style.color}`}>{style.icon}</span>;
  };

  // actions
  const onView = (e: React.MouseEvent, pipeline: any) => {
    e.stopPropagation();
    navigate(`/pipeline/${pipeline.id}`);
  };

  const onDelete = async (e: React.MouseEvent, pipeline: any) => {
    e.stopPropagation();
    if (!pipeline?.id) return;
    const ok = window.confirm(`Delete run #${pipeline.id}? This cannot be undone.`);
    if (!ok) return;
    try {
      setDeletingId(pipeline.id);
      await pipelineService.delete(pipeline.id);
      setPipelines((prev) => prev.filter((p) => p.id !== pipeline.id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete run. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalCount = pipelines.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pipelines.slice(start, start + itemsPerPage);
  }, [pipelines, currentPage]);

  const clearFilters = () => {
    setSelectedProject("ALL");
    setStatusFilter("ALL");
    setBranchFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setCurrentPage(1);
  };
  const hasActiveFilters =
    selectedProject !== "ALL" ||
    statusFilter !== "ALL" ||
    branchFilter !== "ALL" ||
    !!dateFrom ||
    !!dateTo ||
    !!search;

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pipeline Runs</h2>
          <p className="text-slate-500 text-sm">View and manage all pipeline executions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        {/* Search */}
        <div className="w-full">
          <label className="block text-xs font-medium text-slate-400 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by commit message, branch, author, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Project */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Status Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${statusFilter === "ALL" ? "bg-primary text-white" : "bg-background text-slate-400 hover:text-white border border-border"}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter(Status.SUCCESS)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${statusFilter === Status.SUCCESS ? "bg-emerald-500 text-white" : "bg-background text-slate-400 hover:text-white border border-border"}`}
          >
            <CheckCircle className="w-3 h-3" /> Success
          </button>
          <button
            onClick={() => setStatusFilter(Status.FAILURE)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${statusFilter === Status.FAILURE ? "bg-rose-500 text-white" : "bg-background text-slate-400 hover:text-white border border-border"}`}
          >
            <XCircle className="w-3 h-3" /> Failures
          </button>
          <button
            onClick={() => setStatusFilter(Status.RUNNING)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${statusFilter === Status.RUNNING ? "bg-blue-500 text-white" : "bg-background text-slate-400 hover:text-white border border-border"}`}
          >
            <Loader2 className="w-3 h-3" /> Running
          </button>
          <button
            onClick={() => setStatusFilter(Status.QUEUED)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${statusFilter === Status.QUEUED ? "bg-amber-500 text-white" : "bg-background text-slate-400 hover:text-white border border-border"}`}
          >
            <Circle className="w-3 h-3" /> Pending
          </button>
        </div>

        {/* Footer of filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-border">
          <span>
            Showing {pipelines.length} run{pipelines.length !== 1 ? "s" : ""}
            {selectedProject !== "ALL" && " for selected project"}
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-primary hover:text-primary/80 font-medium transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-surface/50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : pipelines.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-surface/50">
          <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center mb-3">
            <Search size={20} className="text-slate-500" />
          </div>
          <p className="text-slate-300 font-medium">No runs found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-lg overflow-hidden flex-1">
            <table className="w-full">
              <thead className="bg-surfaceHighlight/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Run</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Commit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Started</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {pageItems.map((p: any) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/pipeline/${p.id}`)}
                    className="hover:bg-surfaceHighlight/30 transition-colors cursor-pointer"
                  >
                    {/* Status */}
                    <td className="px-4 py-3">{getStatusBadge(p.status || "pending")}</td>

                    {/* Run Name + flags */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {p.name || p.workflow_name || "Build & Deploy"}
                        </span>
                        {getTriggerBadge(p.trigger)}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.is_rollback && (
                          <span className="text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            ↩️ Rollback
                          </span>
                        )}
                        {p.is_failed_deployment && (
                          <span className="text-xs bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            ⚠️ Deploy Failed
                          </span>
                        )}
                        {p.failed_stage && (
                          <span className="text-xs bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            Failed at: {p.failed_stage}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <GitBranch size={14} className="text-slate-500" />
                        <span className="font-mono">{p.branch || "main"}</span>
                        {p.trigger === "tag" && p.tag && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">
                            🏷️ {p.tag}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Commit */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-white truncate">
                        {p.commit_message || "No commit message"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <GitCommit size={12} />
                        <span className="font-mono" title={p.commit_sha || "N/A"}>
                          {p.commit_sha?.substring(0, 7) || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                          {(p.author || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{p.author || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Started */}
                    <td className="px-4 py-3">
                      <div
                        className="text-sm text-slate-300"
                        title={p.started_at ? new Date(p.started_at).toISOString() : "N/A"}
                      >
                        {relativeTime(p.started_at || p.createdAt)}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-mono text-slate-300">
                          {formatDuration(p.started_at, p.finished_at || p.completed_at || null, p.status)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* <button
                          onClick={(e) => onView(e, p)}
                          className="px-2 py-1 rounded bg-background border border-border text-slate-300 hover:text-white hover:bg-surfaceHighlight transition-colors text-xs inline-flex items-center gap-1"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button> */}
                        <button
                          onClick={(e) => onDelete(e, p)}
                          disabled={deletingId === p.id}
                          className={`px-2 py-1 rounded border text-xs inline-flex items-center gap-1 transition-colors
                            ${deletingId === p.id
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-300 cursor-wait"
                              : "bg-background border-border text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 hover:border-rose-500/30"
                            }`}
                          title="Delete run"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} runs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm bg-background border border-border rounded text-white hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${pageNum === currentPage
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:text-white hover:bg-surfaceHighlight"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm bg-background border border-border rounded text-white hover:bg-surfaceHighlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Runs;
