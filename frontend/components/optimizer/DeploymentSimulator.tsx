
import React, { useState } from 'react';
import { ShieldCheck, Zap, Layers, AlertTriangle, Check, ArrowRight } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  desc: string;
  speed: number; // 0-100
  safety: number; // 0-100
  cost: number; // 0-100
  complexity: 'Low' | 'Medium' | 'High';
  recommendedFor: string;
}

const strategies: Strategy[] = [
  { 
    id: 'rolling', 
    name: 'Rolling Update', 
    desc: 'Incrementally replaces instances with new ones. Standard Kubernetes strategy.', 
    speed: 40, safety: 70, cost: 20, complexity: 'Low',
    recommendedFor: 'Standard microservices, low budget'
  },
  { 
    id: 'bluegreen', 
    name: 'Blue/Green', 
    desc: 'Runs two identical environments. Switches traffic instantly. Requires 2x resources.', 
    speed: 90, safety: 95, cost: 90, complexity: 'Medium',
    recommendedFor: 'Critical Payment/Auth services'
  },
  { 
    id: 'canary', 
    name: 'Canary Release', 
    desc: 'Rollout to a small subset of users (e.g. 5%) first. Metric-driven promotion.', 
    speed: 60, safety: 85, cost: 50, complexity: 'High',
    recommendedFor: 'High-traffic, feature-flagged apps'
  },
];

const DeploymentSimulator: React.FC = () => {
  const [selected, setSelected] = useState<string>('rolling');

  const activeStrategy = strategies.find(s => s.id === selected) || strategies[0];

  const renderMeter = (label: string, value: number, colorClass: string) => (
    <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="text-white font-mono font-bold">{value}/100</span>
        </div>
        <div className="w-full h-2.5 bg-background border border-white/5 rounded-full overflow-hidden relative">
            {/* Tick marks */}
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/5"></div>
            <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/5"></div>
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/5"></div>
            
            <div className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${colorClass}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col h-full shadow-sm overflow-hidden">
       <div className="px-6 py-4 border-b border-border bg-surfaceHighlight/20">
        <h3 className="text-sm font-semibold text-white">Strategy Simulator</h3>
        <p className="text-xs text-slate-500">Compare Deployment Models</p>
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-background rounded-lg border border-border">
          {strategies.map(s => (
              <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`py-2 rounded-md text-xs font-medium transition-all ${
                      selected === s.id 
                      ? 'bg-surfaceHighlight text-white shadow-sm ring-1 ring-border' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                  {s.name}
              </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
            <div className="flex items-start gap-4 mb-6 animate-fade-in">
              <div className={`p-3 rounded-xl border ${
                  selected === 'rolling' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  selected === 'bluegreen' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                  {selected === 'rolling' && <Layers size={24} />}
                  {selected === 'bluegreen' && <ShieldCheck size={24} />}
                  {selected === 'canary' && <Zap size={24} />}
              </div>
              <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">{activeStrategy.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">{activeStrategy.desc}</p>
              </div>
            </div>

            <div className="space-y-2 bg-surfaceHighlight/10 p-5 rounded-xl border border-border/50">
              {renderMeter('Speed to Production', activeStrategy.speed, 'bg-gradient-to-r from-emerald-600 to-emerald-400')}
              {renderMeter('Rollback Safety', activeStrategy.safety, 'bg-gradient-to-r from-indigo-600 to-indigo-400')}
              {renderMeter('Resource Cost', activeStrategy.cost, 'bg-gradient-to-r from-rose-600 to-rose-400')}
            </div>
            
            <div className="mt-auto pt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                 <AlertTriangle size={14} className="text-amber-500" />
                 <span className="text-slate-400">Implementation Complexity:</span>
                 <span className={`font-bold px-2 py-0.5 rounded ${
                    activeStrategy.complexity === 'High' ? 'bg-rose-500/20 text-rose-300' :
                    activeStrategy.complexity === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                 }`}>
                    {activeStrategy.complexity}
                 </span>
              </div>

              <div className="flex items-start gap-2 text-xs bg-white/5 p-3 rounded-lg border border-white/5">
                 <Check size={14} className="text-primary mt-0.5" />
                 <div>
                    <span className="block text-primary font-bold mb-0.5">Best Used For:</span>
                    <span className="text-slate-300">{activeStrategy.recommendedFor}</span>
                 </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSimulator;
