import React from 'react';
import { Timer, Activity, AlertTriangle, TrendingDown } from 'lucide-react';
import { DORA_METRICS } from '../constants';

const DoraMetrics: React.FC = () => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'df': return <Activity size={18} />;
      case 'lt': return <Timer size={18} />;
      case 'cfr': return <AlertTriangle size={18} />;
      case 'mttr': return <TrendingDown size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'critical': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {DORA_METRICS.map((metric) => (
        <div 
          key={metric.id} 
          className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
               <div className={`p-1.5 rounded-md ${getStatusColor(metric.status)}`}>
                  {getIcon(metric.id)}
               </div>
               <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{metric.label}</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${
                metric.status === 'healthy' ? 'bg-emerald-500' : 
                metric.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></span>
          </div>
          
          <div className="mt-2">
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{metric.value}</span>
                <span className="text-xs text-slate-500 mb-1">vs target {metric.target}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                {metric.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoraMetrics;