import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertTriangle, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Run, Status } from '../types';
import { analyzeBuildError } from '../services/geminiService';

interface AICopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  run: Run | null;
}

const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ isOpen, onClose, run }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && run && run.status === Status.FAILURE && run.logs) {
      setIsLoading(true);
      setAnalysis(''); // Clear previous analysis
      
      analyzeBuildError(run.logs)
        .then((result) => {
          setAnalysis(result);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (isOpen && run && run.status !== Status.FAILURE) {
        setAnalysis("This run was successful! No errors to analyze.");
    }
  }, [isOpen, run]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Diagnostics</h2>
                <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {run && (
              <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${run.status === Status.FAILURE ? 'bg-error' : 'bg-success'}`} />
                <span className="font-mono text-sm text-slate-300">Run ID: {run.id}</span>
                <span className="text-slate-600">|</span>
                <span className="text-sm text-slate-300">{run.commitMessage}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 size={40} className="text-primary animate-spin" />
                <p className="text-slate-400 animate-pulse">Analyzing build logs...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {run?.status === Status.FAILURE ? (
                  <>
                     <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-400 overflow-x-auto max-h-48 custom-scrollbar">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2">
                            <Terminal size={14} />
                            <span>Raw Logs Snippet</span>
                        </div>
                        <pre>{run.logs || "No logs available."}</pre>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-indigo-400 mt-6 mb-3" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 text-slate-300" {...props} />,
                            code: ({node, ...props}) => <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                        }}
                      >
                        {analysis}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="text-success" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-white">All Clear!</h3>
                    <p className="text-slate-400 max-w-xs mt-2">
                      This run succeeded. AI analysis is typically used for diagnosing failures.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {run?.status === Status.FAILURE && !isLoading && (
              <div className="p-6 border-t border-border bg-surface/50">
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                          <p className="text-amber-200 font-medium">Suggestion</p>
                          <p className="text-amber-500/80 mt-1">This analysis is generated by AI. Always verify code changes locally before pushing.</p>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AICopilotPanel;
