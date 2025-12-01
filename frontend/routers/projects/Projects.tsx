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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projData, tokenData] = await Promise.all([
        projectService.getAll(),
        tokenService.getAll(),
      ]);
      setProjects(projData);
      setTokens(tokenData);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-fade-in space-y-6 mt-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Projects
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage repositories and CI/CD configurations
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} /> Connect Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-border rounded-lg p-5 hover:border-slate-600 transition-all group shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-surfaceHighlight rounded-lg border border-white/5">
                  <FolderGit size={24} className="text-indigo-400" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                {project.name}
              </h3>
              <a
                href={project.url_organization}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 mb-4 truncate"
              >
                <Github size={12} />{" "}
                {project.url_organization.replace("https://github.com/", "")}{" "}
                <ExternalLink size={10} />
              </a>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Description</span>
                  <span className="text-slate-300 text-right max-w-[200px] truncate">
                    {project.description || "No description"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                    {project.status || "Active"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Secret Key</span>
                  <span className="font-mono text-slate-300">
                    {getTokenName(project.token)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
