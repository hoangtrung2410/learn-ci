import React, { useState, useEffect } from "react";
import {
  Plus,
  FolderGit,
  Github,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Project, Token } from "../../types/types";
import { projectService } from "../../services/projectService";
import { tokenService } from "../../services/tokenService";
import ProjectModal from "../projects/ProjectModal";

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const [projData, tokenData] = await Promise.all([
        projectService.getAll({ limit: itemsPerPage, offset }),
        tokenService.getAll(),
      ]);
      setProjects(projData.projects || []);
      setTotalProjects(projData.total || 0);
      setTokens(tokenData);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadData();
    }
  }, [searchQuery, selectedToken]);

  const handleCreateOrUpdate = async (data: {
    name: string;
    description: string;
    url_organization: string;
    token: Token;
  }) => {
    try {
      if (editingProject) {
        await projectService.update(editingProject.id, data);
      } else {
        await projectService.create(data);
        setCurrentPage(1); // Reset to first page on create
      }
      await loadData();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (e) {
      alert("Error saving project");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this project configuration?")) {
      await projectService.delete(id);
      await loadData();
    }
  };

  const openCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setIsModalOpen(true);
  };
  const getTokenName = (token: Token) => {
    return token ? token.name : "Unknown Token";
  };

  const totalPages = Math.ceil(totalProjects / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.url_organization?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesToken =
      selectedToken === "ALL" || project.token?.id?.toString() === selectedToken;

    return matchesSearch && matchesToken;
  });

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-fade-in space-y-6 mt-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Projects
          </h2>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} /> Connect Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Search Projects
          </label>
          <input
            type="text"
            placeholder="Search by name, description, or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Filter by Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-colors"
          >
            <option value="ALL">All Tokens</option>
            {tokens.map((token) => (
              <option key={token.id} value={token.id.toString()}>
                {token.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg bg-surface/50">
          <FolderGit size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-300 font-medium">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">
            {projects.length === 0
              ? "Create your first project to get started"
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <>
          {/* Table View */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-surfaceHighlight/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Organization URL
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Webhook Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <FolderGit size={18} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {project.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.url_organization ? (
                        <a
                          href={project.url_organization}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors"
                        >
                          <Github size={14} />
                          <span className="max-w-[200px] truncate">
                            {project.url_organization.replace("https://github.com/", "")}
                          </span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
                        {getTokenName(project.token)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.github_webhook_active ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-medium w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500 bg-slate-500/10 px-2 py-1 rounded text-xs font-medium w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalProjects > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg">
              <div className="text-sm text-slate-400">
                Showing {filteredProjects.length} of {totalProjects} projects
                {(searchQuery || selectedToken !== "ALL") && " (filtered)"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-surfaceHighlight rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${page === currentPage
                        ? "bg-primary text-white"
                        : "text-slate-400 hover:text-white hover:bg-surfaceHighlight"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-surfaceHighlight rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProject}
        availableTokens={tokens}
      />
    </div>
  );
};

export default Projects;
