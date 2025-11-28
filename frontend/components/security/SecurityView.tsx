
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ExternalLink, 
  Github, 
  Key, 
  Copy, 
  Edit, 
  Trash2, 
  Lock, 
  Loader2 
} from 'lucide-react';
import { Token } from '../../types';
import { tokenService } from '../../services/tokenService';
import TokenModal from './TokenModal';

const SecurityView: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<Token | null>(null);

  // Fetch Tokens
  const fetchTokens = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tokenService.getAll();
      setTokens(Array.isArray(data) ? data : []); 
    } catch (err) {
      console.warn("API Error:", err);
      // Fallback for demo if API is offline
      setTokens([
        { id: 'demo-1', name: 'DEMO_KEY (Backend Offline)', token: 'ghp_demo123...', created: 'Just now' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Handle Create/Update passed to Modal
  const handleModalSubmit = async (data: { name: string; token: string }) => {
    try {
      if (editingToken) {
        await tokenService.update(editingToken.id, data);
      } else {
        await tokenService.create(data);
      }
      
      await fetchTokens();
      setIsModalOpen(false);
      setEditingToken(null);
    } catch (err: any) {
      alert(`Failed to save token: ${err.message}`);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this token? This action cannot be undone.')) return;
    
    try {
      await tokenService.delete(id);
      await fetchTokens();
    } catch (err) {
      alert('Failed to delete token');
    }
  };

  const openCreateModal = () => {
    setEditingToken(null);
    setIsModalOpen(true);
  };

  const openEditModal = (token: Token) => {
    setEditingToken(token);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in space-y-6 mt-4 relative">
      {/* Project Identity Card */}
      <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner">
            <Github size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AGIVietNam</h2>
            <div className="flex items-center gap-2 text-slate-400 mt-1">
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">Public Repository</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm">Source Control</span>
            </div>
          </div>
        </div>

        <a 
          href="https://github.com/AGIVietNam" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white text-background hover:bg-slate-200 font-medium text-sm rounded-lg transition-colors z-10 shadow-md"
        >
          View on GitHub <ExternalLink size={14} />
        </a>
      </div>

      {/* Token Management Section */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surfaceHighlight/20">
          <div>
            <h3 className="text-base font-semibold text-white">Project Secrets & Tokens</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage access tokens for your CI/CD pipelines.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={14} /> Add New Token
          </button>
        </div>

        <div className="overflow-x-auto min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <Loader2 size={24} className="text-primary animate-spin" />
              <span className="text-sm text-slate-500">Loading tokens...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceHighlight/50 border-b border-border text-xs uppercase text-slate-500 font-semibold">
                  <th className="px-6 py-3 w-1/3">Name</th>
                  <th className="px-6 py-3">Token Value</th>
                  <th className="px-6 py-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                      No tokens found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  tokens.map((token) => (
                    <tr key={token.id} className="hover:bg-surfaceHighlight/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                             <Key size={14} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-200">{token.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-slate-400 bg-black/40 px-2 py-1 rounded border border-border/50 max-w-[200px] truncate block">
                            {token.token}
                          </code>
                          <button 
                            className="text-slate-500 hover:text-white transition-colors p-1" 
                            title="Copy to clipboard"
                            onClick={() => navigator.clipboard.writeText(token.token)}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(token)}
                            className="p-1.5 hover:bg-indigo-500/10 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(token.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-error transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="px-6 py-4 bg-amber-500/5 border-t border-border flex items-start gap-3">
          <Lock size={16} className="text-amber-500 mt-0.5" />
          <div className="text-xs text-slate-400">
            <p className="text-amber-200 font-medium mb-1">Security Note</p>
            <p>Tokens provided here are encrypted at rest. Ensure you rotate your secrets periodically to maintain security integrity.</p>
          </div>
        </div>
      </div>

      <TokenModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingToken}
      />
    </div>
  );
};

export default SecurityView;
