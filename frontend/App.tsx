import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, Play, Plus } from "lucide-react";

// Components
import Sidebar from "./components/Sidebar";
import RunDetailsPanel from "./components/RunDetailsPanel";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";

// Routers (Pages)
import Dashboard from "./routers/dashboard/Dashboard";
import Runs from "./routers/dashboard/Runs";
import Settings from "./routers/settings/Settings";
import LoginView from "./routers/auth/LoginView";
import Security from "./routers/tokens/Security";
import Insights from "./routers/dashboard/Insights";
import Optimizer from "./routers/dashboard/Optimizer";
import Projects from "./routers/projects/Projects";

import { MOCK_RUNS } from "./constants";
import { Run, Status } from "./types/types";

// --- Authenticated Layout Content ---

const AuthenticatedApp: React.FC = () => {
  // --- Global State ---
  const { user } = useAuth();
  const location = useLocation();
  const [activePage, setActivePage] = useState<string>(() => {
    // derive initial page from location on first render
    try {
      const p = window.location.pathname;
      if (!p || p === "/" || p === "/home") return "dashboard";
      return p.replace(/^\//, "");
    } catch (_) {
      return "dashboard";
    }
  });
  const [runs, setRuns] = useState<Run[]>(MOCK_RUNS);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Handlers ---
  const handleRunSelect = (run: Run) => {
    setSelectedRun(run);
    setIsPanelOpen(true);
  };

  const handleTriggerRun = () => {
    const newId = `run-${8393 + runs.length}`;
    const newRun: Run = {
      id: newId,
      branch: "feat/simulation-demo",
      commitMessage: "chore: manual trigger from dashboard",
      author: user?.name || "you",
      status: Status.RUNNING,
      duration: "0s",
      startedAt: "Just now",
      jobs: [
        {
          id: "job-1",
          name: "Initialize",
          status: Status.RUNNING,
          duration: "0s",
          steps: [],
        },
      ],
    };

    setRuns([newRun, ...runs]);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setRuns((currentRuns) =>
        currentRuns.map((r) => {
          if (r.id === newId) {
            // 30% chance of failure for demo purposes
            const failed = Math.random() < 0.3;
            return {
              ...r,
              status: failed ? Status.FAILURE : Status.SUCCESS,
              duration: "3s",
              jobs: [
                {
                  id: "job-1",
                  name: "Initialize",
                  status: Status.SUCCESS,
                  duration: "1s",
                  steps: [],
                },
                {
                  id: "job-2",
                  name: "Build & Test",
                  status: failed ? Status.FAILURE : Status.SUCCESS,
                  duration: "2s",
                  steps: [],
                },
              ],
              logs: failed
                ? "Error: Simulation failed due to random chaos monkey.\n    at Chaos.trigger (src/chaos.ts:42)"
                : undefined,
            };
          }
          return r;
        })
      );
    }, 3000);
  };

  // --- Route Renderer ---
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            runs={runs}
            onRunSelect={handleRunSelect}
            setActivePage={setActivePage}
          />
        );
      case "projects":
        return <Projects />;
      case "runs":
        return (
          <Runs
            runs={runs}
            searchQuery={searchQuery}
            onRunSelect={handleRunSelect}
          />
        );
      case "settings":
        return <Settings />;
      case "security":
        return <Security />;
      case "insights":
        return <Insights />;
      case "optimizer":
        return <Optimizer />;
      case "branches":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
            <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-medium text-white">
              Under Construction
            </h3>
            <p className="text-sm mt-1">
              The {activePage} module is coming soon.
            </p>
          </div>
        );
      default:
        return (
          <Dashboard
            runs={runs}
            onRunSelect={handleRunSelect}
            setActivePage={setActivePage}
          />
        );
    }
  };

  // Keep activePage in sync with location (so direct URL visits work)
  useEffect(() => {
    try {
      const p = location.pathname || "/";
      if (p === "/" || p === "/home") setActivePage("dashboard");
      else setActivePage(p.replace(/^\//, ""));
    } catch (_) { }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans flex">
      {/* Sidebar Navigation */}
      {/* Sidebar: show on md+ like original layout; hidden on small screens */}
      <div className="hidden md:block md:fixed md:left-0 md:top-0 md:bottom-0">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur z-20 px-6 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
              {activePage}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Contextual Search */}
            <div className="relative group mr-2">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
                size={14}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branches, commits..."
                className="w-64 bg-surface border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="h-6 w-px bg-border mx-1"></div>

            <button
              onClick={handleTriggerRun}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-background hover:bg-slate-200 rounded-md text-xs font-bold transition-colors shadow-sm shadow-white/10 active:scale-95"
            >
              <Play size={10} fill="currentColor" />
              Trigger Run
            </button>

            <button className="p-2 text-slate-400 hover:text-white transition-colors relative ml-1">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background"></span>
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Pipeline Deep Dive Panel (Replacing Copilot Panel) */}
      <RunDetailsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        run={selectedRun}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <LoginView />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
