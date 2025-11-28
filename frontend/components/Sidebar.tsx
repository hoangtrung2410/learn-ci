import React from 'react';
import { 
  LayoutGrid, 
  GitBranch, 
  Settings, 
  Activity, 
  ShieldAlert, 
  Layers,
  ChevronDown,
  PieChart,
  Cpu,
  LogOut
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'runs', label: 'Workflow Runs', icon: Activity },
    { id: 'insights', label: 'Insights', icon: PieChart },
    { id: 'optimizer', label: 'System Optimizer', icon: Cpu },
    { id: 'tests', label: 'Test Analytics', icon: Layers },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-background font-bold text-xl leading-none">
            T
          </div>
          <span className="text-lg font-bold tracking-tight text-white">TrunkLike</span>
        </div>
      </div>

      {/* Organization Switcher Context */}
      <div className="px-4 py-4">
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-200 bg-background border border-border rounded-lg hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">A</div>
            <span>Acme Corp</span>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-3 mb-2">Platform</p>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative ${
                isActive
                  ? 'bg-surfaceHighlight text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceHighlight/50'
              }`}
            >
              <Icon size={18} className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
              {item.label}
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-surfaceHighlight/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-slate-700 p-[1px] overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="User" className="w-full h-full rounded-full" />
               ) : (
                 <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                   {user?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
               )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate max-w-[90px]">{user?.name}</span>
              <span className="text-xs text-slate-500 truncate max-w-[90px]">{user?.email}</span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;