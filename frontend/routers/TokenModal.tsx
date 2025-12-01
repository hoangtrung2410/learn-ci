import React, { useState, useEffect } from "react";
import { X, Save, Key } from "lucide-react";
import { Token } from "../types/types";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; token: string }) => Promise<void>;
  initialData: Token | null;
}

const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({ name: "", token: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name, token: initialData.token });
    } else {
      setFormData({ name: "", token: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surfaceHighlight/20">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? "Edit Token" : "Add New Token"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Token Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. AWS_PRODUCTION_KEY"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Token Value
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.token}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
                placeholder="ghp_..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all pr-10"
              />
              <div className="absolute right-3 top-2.5 text-slate-500">
                <Key size={14} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {initialData ? "Update Token" : "Create Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TokenModal;
