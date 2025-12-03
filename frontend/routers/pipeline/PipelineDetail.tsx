import React, { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router";
import { pipelineService } from "../../services/pipelineService";

interface PipelineLog {
    id: string;
    stage: string;
    level: string;
    message: string;
    stack_trace?: string;
    timestamp?: string;
}

interface PipelineData {
    id: string;
    status: string;
    commit_message?: string;
    commit_sha?: string;
    branch?: string;
    author?: string;
    started_at?: string;
    duration?: number;
    error_message?: string;
    stages?: { id: string; name: string; status: string }[];
    logs?: PipelineLog[];
}

interface PipelineDetailProps {
    isOpen?: boolean;
    onClose?: () => void;
    runId?: string;
}

export default function PipelineDetail({ isOpen, onClose, runId }: PipelineDetailProps) {
    const navigate = useNavigate();
    const getIdFromUrl = () => {
        const path = window.location.pathname;
        const match = path.match(/\/pipeline\/([^\/]+)/);
        return match ? match[1] : null;
    };

    const urlId = getIdFromUrl();
    const isRoute = !!urlId && !runId;

    const [data, setData] = useState<PipelineData | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<"summary" | "stages" | "logs" | "ai">("summary");
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const idToLoad = runId || urlId;
        console.log("🔍 PipelineDetail useEffect:", { runId, urlId, idToLoad, isRoute, pathname: window.location.pathname });
        if (idToLoad) {
            console.log("📡 Calling fetchPipeline with id:", idToLoad);
            fetchPipeline(idToLoad);
        } else {
            console.warn("⚠️ No ID to load pipeline detail");
        }
    }, [runId, urlId]);

    async function fetchPipeline(id: string) {
        console.log("🚀 fetchPipeline started for id:", id);
        setLoading(true);
        try {
            const pipeline = await pipelineService.getDetail(id);
            console.log("✅ Pipeline data received:", pipeline);
            setData(pipeline);
        } catch (err) {
            console.error("❌ Failed to fetch pipeline:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    async function startAIAnalysis() {
        if (!data?.error_message) return;
        setAiLoading(true);
        try {
            const result = await pipelineService.analyzeError(data.error_message);
            setAnalysis(result || result);
            setTab("ai");
        } catch (err) {
            console.error("AI analysis failed:", err);
        } finally {
            setAiLoading(false);
        }
    }

    const badgeClass = (status?: string) => {
        if (!status) return "bg-slate-500/10 text-slate-400";
        const s = status.toLowerCase();
        if (s === "success") return "bg-emerald-500/10 text-emerald-400";
        if (s === "failed") return "bg-rose-500/10 text-rose-400";
        if (s === "running") return "bg-indigo-500/10 text-indigo-400";
        if (s === "pending") return "bg-amber-500/10 text-amber-400";
        return "bg-slate-500/10 text-slate-400";
    };

    const handleClose = () => {
        if (isRoute) navigate(-1);
        else onClose?.();
    };

    if (!isRoute && !isOpen) return null;

    // Modern container with better spacing
    if (isRoute) {
        return (
            <div className="min-h-screen bg-background">
                <HeaderRoute data={data} loading={loading} onClose={handleClose} />

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                    {/* Pills-style Tabs */}
                    <div className="bg-surface/50 backdrop-blur border border-border rounded-xl p-1.5 inline-flex gap-1">
                        {["summary", "stages", "logs", "ai"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t as any)}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:text-white hover:bg-surface"
                                    }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="animate-fade-in">
                        {tab === "summary" && <SummaryTab data={data} loading={loading} />}
                        {tab === "stages" && <StagesTab data={data} badge={badgeClass} />}
                        {tab === "logs" && <LogsTab data={data} />}
                        {tab === "ai" && <AITab data={data} analysis={analysis} aiLoading={aiLoading} startAI={startAIAnalysis} />}
                    </div>
                </div>
            </div>
        );
    }

    // Slide-over panel mode
    return (
        <div className={`fixed inset-y-0 right-0 w-[900px] bg-background border-l border-border shadow-2xl z-50 transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}>
            <Header data={data} loading={loading} onClose={handleClose} />

            <div className="flex border-b border-border px-6 bg-surface/30">
                {["summary", "stages", "logs", "ai"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-white" : "border-transparent text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-300 space-y-6">
                {tab === "summary" && <SummaryTab data={data} loading={loading} />}
                {tab === "stages" && <StagesTab data={data} badge={badgeClass} />}
                {tab === "logs" && <LogsTab data={data} />}
                {tab === "ai" && <AITab data={data} analysis={analysis} aiLoading={aiLoading} startAI={startAIAnalysis} />}
            </div>

            <div className="p-4 border-t border-border bg-surface">
                <button
                    onClick={handleClose}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

/** Header for Route Mode */
function HeaderRoute({ data, loading, onClose }: { data: PipelineData | null; loading: boolean; onClose: () => void }) {
    const getStatusColor = (status?: string) => {
        const s = status?.toLowerCase();
        if (s === "success") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (s === "failed") return "bg-rose-500/20 text-rose-400 border-rose-500/30";
        if (s === "running") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    };

    return (
        <div className="border-b border-border bg-gradient-to-b from-surface/50 to-transparent backdrop-blur">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surface rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                            <span className="text-sm font-mono text-slate-500">Pipeline #{data?.id}</span>
                            {loading && <Loader2 className="animate-spin text-primary" size={18} />}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 truncate">
                            {data?.commit_message || "Pipeline Run"}
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full border font-semibold ${getStatusColor(data?.status)}`}>
                                {data?.status || "Unknown"}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400">{data?.branch || "main"}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400">{data?.author || "Unknown"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Header for Panel Mode */
function Header({ data, loading, onClose }: { data: PipelineData | null; loading: boolean; onClose: () => void }) {
    return (
        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface/30 backdrop-blur">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">#{data?.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${data?.status}`}>{data?.status}</span>
                    {loading && <Loader2 className="animate-spin text-slate-500" size={14} />}
                </div>
                <h2 className="text-sm font-semibold text-white truncate">{data?.commit_message || "Pipeline Run"}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
    );
}

/** Summary Tab */
function SummaryTab({ data, loading }: { data: PipelineData | null; loading?: boolean }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return <p className="text-slate-500 text-center py-10">No data available</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commit Info Card */}
            <div className="bg-surface/50 backdrop-blur border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Commit Details</h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-white font-medium mb-1">{data.commit_message || "No commit message"}</p>
                        <p className="text-xs text-slate-500 font-mono bg-black/20 px-2 py-1 rounded inline-block">
                            {data.commit_sha || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pipeline Info Card */}
            <div className="bg-surface/50 backdrop-blur border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline Info</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-slate-400 text-sm">Branch</span>
                        <span className="text-white font-mono text-sm">{data.branch || "main"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-slate-400 text-sm">Author</span>
                        <span className="text-white text-sm">{data.author || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-slate-400 text-sm">Started</span>
                        <span className="text-white text-sm">{data.started_at || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">Duration</span>
                        <span className="text-white font-mono text-sm">{data.duration ? `${data.duration}s` : "N/A"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Stages Tab */
function StagesTab({ data, badge }: { data: PipelineData | null; badge: (status?: string) => string }) {
    if (!data?.stages?.length) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-slate-500" />
                </div>
                <p className="text-slate-400">No stages recorded for this pipeline</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.stages.map((s, idx) => (
                <div
                    key={s.id}
                    className="bg-surface/50 backdrop-blur border border-border rounded-xl p-5 hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="text-white font-semibold">{s.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Stage {idx + 1}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${badge(s.status)}`}>
                            {s.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Logs Tab */
function LogsTab({ data }: { data: PipelineData | null }) {
    if (!data?.logs?.length) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-slate-500" />
                </div>
                <p className="text-slate-400">No logs available for this pipeline</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.logs.map((log) => (
                <div key={log.id} className="bg-surface/50 backdrop-blur border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-center px-5 py-3 bg-surfaceHighlight/50 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-sm font-medium text-white">{log.stage}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="p-5">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-slate-300 leading-relaxed">{log.message}</pre>
                        {log.stack_trace && (
                            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                <div className="text-xs font-semibold text-rose-400 mb-2">Stack Trace</div>
                                <pre className="text-xs whitespace-pre-wrap font-mono text-rose-300 leading-relaxed">{log.stack_trace}</pre>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** AI Tab */
function AITab({ data, analysis, aiLoading, startAI }: { data: PipelineData | null; analysis: string | null; aiLoading: boolean; startAI: () => void }) {
    if (!data) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data.status !== "failed") {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Build Successful</h3>
                <p className="text-slate-400">No errors to analyze — everything looks good!</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Available</h3>
                <p className="text-slate-400 mb-6">Get intelligent insights about what went wrong</p>
                <button
                    onClick={startAI}
                    disabled={aiLoading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                    {aiLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Start AI Root Cause Analysis"
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-surface/50 backdrop-blur border border-border rounded-xl p-6">
            <div className="prose prose-invert prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-white 
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-slate-300 prose-p:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-code:bg-black/30 prose-code:text-indigo-300 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-black/40 prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                prose-ul:text-slate-300 prose-ol:text-slate-300
                prose-li:marker:text-indigo-400
                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        </div>
    );
}
