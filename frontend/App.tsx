import React, { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Search, 
  Bell, 
  Filter, 
  ExternalLink, 
  Play, 
  Plus, 
  Sliders, 
  Check, 
  Shield,
  LogOut
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import MetricsCard from './components/MetricsCard';
import RunTable from './components/RunTable';
import AICopilotPanel from './components/AICopilotPanel';
import SecurityView from './components/security/SecurityView';
import InsightsView from './components/InsightsView';
import SystemOptimizerView from './components/optimizer/SystemOptimizerView';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import LoginView from './components/auth/LoginView';

import { MOCK_RUNS, MOCK_CHART_DATA } from './constants';
import { Run, Status } from './types';

// --- Authenticated Layout Content ---

const AuthenticatedApp: React.FC = () => {
  // --- Global State ---
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [runs, setRuns] = useState<Run[]>(MOCK_RUNS);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // --- Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');

  // --- Derived State ---
  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- Handlers ---
  const handleRunSelect = (run: Run) => {
    setSelectedRun(run);
    setIsPanelOpen(true);
  };

  const handleTriggerRun = () => {
    const newId = `run-${8393 + runs.length}`;
    const newRun: Run = {
      id: newId,
      branch: 'feat/simulation-demo',
      commitMessage: 'chore: manual trigger from dashboard',
      author: user?.name || 'you',
      status: Status.RUNNING,
      duration: '0s',
      startedAt: 'Just now'
    };
    
    setRuns([newRun, ...runs]);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setRuns(currentRuns => currentRuns.map(r => {
        if (r.id === newId) {
          // 30% chance of failure for demo purposes
          const failed = Math.random() < 0.3; 
          return {
            ...r,
            status: failed ? Status.FAILURE : Status.SUCCESS,
            duration: '3s',
            logs: failed ? 'Error: Simulation failed due to random chaos monkey.\n    at Chaos.trigger (src/chaos.ts:42)' : undefined
          };
        }
        return r;
      }));
    }, 3000);
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Metrics Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard metric={{ label: 'Pass Rate', value: '94.2%', change: 2.5, trend: 'up' }} />
        <MetricsCard metric={{ label: 'P95 Duration', value: '4m 12s', change: -12, trend: 'up' }} />
        <MetricsCard metric={{ label: 'Weekly Runs', value: runs.length.toString(), change: 8.4, trend: 'up' }} />
        <MetricsCard metric={{ label: 'Active Issues', value: runs.filter(r => r.status === Status.FAILURE).length.toString(), change: 5, trend: 'down' }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Stability Trend</h3>
                <p className="text-xs text-slate-500">Success vs Failure rate over time</p>
              </div>
              <button className="text-xs text-primary hover:underline flex items-center gap-1">
                View Report <ExternalLink size={10} />
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CHART_DATA} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '6px' }}
                    cursor={{fill: '#27272a', opacity: 0.4}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                  <Bar dataKey="success" name="Passed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failure" name="Failed" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Pipeline Health */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Pipeline Health</h3>
              <div className="space-y-6">
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Code Coverage</span>
                          <span className="text-white font-mono">86%</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '86%' }}></div>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Flaky Tests</span>
                          <span className="text-amber-500 font-mono">Low (3)</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                  </div>
              </div>
            </div>
            
            <div className="p-3 bg-surfaceHighlight/50 rounded-lg border border-border mt-4">
               <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-white">Security Scan</span>
               </div>
               <p className="text-xs text-slate-400">No high severity vulnerabilities detected in the last scan.</p>
            </div>
        </div>
      </div>

      <div className="flex-1">
         <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Recent Activity</h3>
            <button onClick={() => setActivePage('runs')} className="text-xs text-primary hover:text-indigo-400">View All</button>
         </div>
         <RunTable runs={runs.slice(0, 5)} onSelectRun={handleRunSelect} />
      </div>
    </div>
  );

  const renderRunsList = () => (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
       <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
             <button 
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'ALL' ? 'bg-primary text-white' : 'bg-background text-slate-400 hover:text-white'}`}
             >
                All Runs
             </button>
             <button 
                onClick={() => setStatusFilter(Status.FAILURE)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === Status.FAILURE ? 'bg-error text-white' : 'bg-background text-slate-400 hover:text-white'}`}
             >
                Failures
             </button>
             <button 
                onClick={() => setStatusFilter(Status.SUCCESS)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === Status.SUCCESS ? 'bg-success text-white' : 'bg-background text-slate-400 hover:text-white'}`}
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
             <RunTable runs={filteredRuns} onSelectRun={handleRunSelect} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-surface/50">
               <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center mb-3">
                  <Search size={20} className="text-slate-500" />
               </div>
               <p className="text-slate-300 font-medium">No runs found</p>
               <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto w-full animate-fade-in space-y-8 mt-4">
       <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
             <h3 className="text-lg font-medium text-white">General Settings</h3>
             <p className="text-sm text-slate-500">Manage your project configuration</p>
          </div>
          <div className="p-6 space-y-6">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input type="text" defaultValue="TrunkLike Dashboard" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Branch</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                   <option>main</option>
                   <option>master</option>
                   <option>develop</option>
                </select>
             </div>
             <div className="flex items-center justify-between pt-4">
                <div>
                   <h4 className="text-sm font-medium text-white">Public Dashboard</h4>
                   <p className="text-xs text-slate-500">Allow anyone with the link to view metrics</p>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>
          </div>
          <div className="px-6 py-4 bg-surfaceHighlight/30 border-t border-border flex justify-end">
             <button className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors">
                Save Changes
             </button>
          </div>
       </div>

       <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
             <h3 className="text-lg font-medium text-white">Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
             {['Build Failures', 'Deployment Success', 'New Pull Requests'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded border border-slate-500 bg-transparent flex items-center justify-center text-transparent hover:border-primary cursor-pointer">
                      <Check size={10} />
                   </div>
                   <span className="text-sm text-slate-300">{item}</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur z-20 px-6 flex items-center justify-between sticky top-0">
          
          <div className="flex items-center gap-4">
             <h1 className="text-sm font-semibold text-slate-300">
                Dashboard / <span className="text-white capitalize">{activePage}</span>
             </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Contextual Search */}
            <div className="relative group mr-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={14} />
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
              
              {/* Header Actions (Conditional) */}
              {activePage === 'runs' && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Workflow Runs</h2>
                      <p className="text-slate-500 text-sm">History across all branches</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-surface border border-border rounded text-slate-400 hover:text-white"><Filter size={16} /></button>
                        <button className="p-2 bg-surface border border-border rounded text-slate-400 hover:text-white"><Sliders size={16} /></button>
                    </div>
                </div>
              )}

              {/* Render Active View */}
              {activePage === 'dashboard' && renderDashboard()}
              {activePage === 'runs' && renderRunsList()}
              {activePage === 'settings' && renderSettings()}
              {activePage === 'security' && <SecurityView />}
              {activePage === 'insights' && <InsightsView />}
              {activePage === 'optimizer' && <SystemOptimizerView />}
              
              {/* Fallback for other pages */}
              {['tests', 'branches'].includes(activePage) && (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                    <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4">
                       <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-white">Under Construction</h3>
                    <p className="text-sm mt-1">The {activePage} module is coming soon.</p>
                 </div>
              )}
           </div>
        </div>
      </main>

      {/* AI Panel Overlay */}
      <AICopilotPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        run={selectedRun} 
      />
    </div>
  );
};

// --- App Container with Auth Check ---

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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