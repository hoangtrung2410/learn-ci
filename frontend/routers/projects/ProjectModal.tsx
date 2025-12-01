import React, { useState, useEffect } from "react";
import { X, Save, FolderGit, Link as LinkIcon, Lock } from "lucide-react";
import { Project, Token } from "../../types/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    url_organization: string;
    token: Token;
  }) => Promise<void>;
  initialData: Project | null;
  availableTokens: Token[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availableTokens,
}) => {
  type FormState = {
    id: string;
    name: string;
    description: string;
    url_organization: string;
    tokenId: string | number;
  };

  const [formData, setFormData] = useState<FormState>({
    id: "",
    name: "",
    description: "",
    url_organization: "",
    tokenId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description || "",
        url_organization: initialData.url_organization,
        tokenId: initialData.token.id ?? "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        url_organization: "",
        tokenId: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedToken = availableTokens.find(
      (t) => t.id.toString() === formData.tokenId.toString()
    );
    if (!selectedToken) {
      alert("Please select a valid token");
      return;
    }
    await onSubmit({
      name: formData.name,
      description: formData.description,
      url_organization: formData.url_organization,
      token: selectedToken,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surfaceHighlight/20">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderGit size={20} className="text-primary" />
            {initialData ? "Edit Project" : "Connect New Project"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. PCU Server Backend"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the project"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Organization URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Organization URL
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={formData.url_organization}
                onChange={(e) =>
                  setFormData({ ...formData, url_organization: e.target.value })
                }
                placeholder="https://github.com/org"
                className="w-full bg-background border border-border rounded-md px-3 py-2 pl-9 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <LinkIcon
                size={14}
                className="absolute left-3 top-2.5 text-slate-500"
              />
            </div>
          </div>

          {/* Secret Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              CI/CD Secret Key
            </label>
            <div className="relative">
              <select
                required
                value={formData.tokenId}
                onChange={(e) =>
                  setFormData({ ...formData, tokenId: e.target.value })
                }
                className="w-full bg-background border border-border rounded-md px-3 py-2 pl-9 text-sm text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              >
                <option value="" disabled>
                  -- Select a Secret Token --
                </option>
                {availableTokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.name}
                  </option>
                ))}
              </select>
              <Lock
                size={14}
                className="absolute left-3 top-2.5 text-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Select the access token this project will use for pipelines.
              Manage tokens in Security.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Save size={16} />
              {initialData ? "Update Project" : "Connect Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
