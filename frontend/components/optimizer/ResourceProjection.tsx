
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Calculator, DollarSign, Cpu, Server, RefreshCw, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

const ResourceProjection: React.FC = () => {
  // --- State for User Inputs ---
  const [monolithStats, setMonolithStats] = useState({
    cpu: 32,      // Cores per instance
    ram: 64,      // GB per instance
    cost: 1200,   // USD/month per instance
    instances: 2  // Number of running instances
  });

  const [microserviceConfig, setMicroserviceConfig] = useState({
    serviceCount: 8,
    avgCpuPerService: 2,
    avgRamPerService: 4,
    baseCostPerService: 150, // Base infra cost (LB, Logs, Monitoring)
    overheadMultiplier: 1.2  // Orchestration overhead (K8s daemonsets, sidecars)
  });

  // --- Derived Metrics ---
  // Fix: Initialize all properties to avoid undefined access during first render
  const [metrics, setMetrics] = useState<any>({ 
    savings: 0, 
    isCheaper: false,
    monoCost: 0,
    microCost: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Calculate Monolith Totals
    const monoTotalCpu = monolithStats.cpu * monolithStats.instances;
    const monoTotalRam = monolithStats.ram * monolithStats.instances;
    const monoTotalCost = monolithStats.cost * monolithStats.instances;

    // 2. Calculate Microservices Totals
    // CPU/RAM = (Count * Avg) * Overhead
    const microTotalCpu = (microserviceConfig.serviceCount * microserviceConfig.avgCpuPerService) * microserviceConfig.overheadMultiplier;
    const microTotalRam = (microserviceConfig.serviceCount * microserviceConfig.avgRamPerService) * microserviceConfig.overheadMultiplier;
    
    // Cost = (Count * BaseCost) + (Hardware Cost Estimate proportional to resource usage - simplified here)
    // For simulation, we assume baseCost covers the instance types selected for those services.
    const microTotalCost = microserviceConfig.serviceCount * microserviceConfig.baseCostPerService;

    // 3. Savings Analysis
    const savings = monoTotalCost - microTotalCost;
    const isCheaper = savings > 0;

    setMetrics({
      savings: Math.abs(savings),
      isCheaper,
      monoCost: monoTotalCost,
      microCost: microTotalCost
    });

    setChartData([
      {
        name: 'CPU (Cores)',
        Monolith: monoTotalCpu,
        Microservices: parseFloat(microTotalCpu.toFixed(1)),
        unit: 'vCPU'
      },
      {
        name: 'RAM (GB)',
        Monolith: monoTotalRam,
        Microservices: parseFloat(microTotalRam.toFixed(1)),
        unit: 'GB'
      },
      {
        name: 'Mthly Cost ($)',
        Monolith: monoTotalCost,
        Microservices: microTotalCost,
        unit: '$'
      }
    ]);
  }, [monolithStats, microserviceConfig]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const unit = payload[0].payload.unit;
      return (
        <div className="bg-surface border border-border p-3 rounded shadow-xl text-xs z-50">
          <p className="font-bold text-slate-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1" style={{ color: entry.color }}>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-mono font-bold">
                {unit === '$' ? '$' : ''}{(entry.value || 0).toLocaleString()}{unit !== '$' ? ` ${unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* LEFT: Visualization & Results */}
      <div className="flex-1 bg-surface border border-border rounded-lg flex flex-col min-h-[450px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center bg-surfaceHighlight/20">
          <div>
            <h3 className="text-sm font-semibold text-white">Resource Projection</h3>
            <p className="text-xs text-slate-500">Infrastructure Comparison</p>
          </div>
          
          {/* ROI Indicator */}
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${metrics.isCheaper ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
             {metrics.isCheaper ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
             <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{metrics.isCheaper ? 'Est. Savings' : 'Cost Increase'}</span>
                <span className={`text-sm font-bold font-mono ${metrics.isCheaper ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${(metrics.savings || 0).toLocaleString()}<span className="text-[10px] font-sans text-slate-500 font-normal">/mo</span>
                </span>
             </div>
          </div>
        </div>
        
        <div className="flex-1 w-full p-5 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={40} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#27272a', opacity: 0.4}} />
              <Bar dataKey="Monolith" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Monolith" />
              <Bar dataKey="Microservices" fill="#6366f1" radius={[4, 4, 0, 0]} name="Microservices" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Key Stats Footer */}
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-background">
             <div className="p-4 flex items-center justify-between group">
                <div>
                   <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Server size={12}/> Current Spend</p>
                   <p className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">${(metrics.monoCost || 0).toLocaleString()}</p>
                </div>
                <div className="text-right opacity-50">
                   <p className="text-[10px] text-slate-500">Nodes</p>
                   <p className="text-xs font-mono text-slate-300">{monolithStats.instances}</p>
                </div>
             </div>
             <div className="p-4 flex items-center justify-between group">
                <div>
                   <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu size={12}/> Projected Spend</p>
                   <p className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">${(metrics.microCost || 0).toLocaleString()}</p>
                </div>
                <div className="text-right opacity-50">
                   <p className="text-[10px] text-slate-500">Services</p>
                   <p className="text-xs font-mono text-slate-300">{microserviceConfig.serviceCount}</p>
                </div>
             </div>
        </div>
      </div>

      {/* RIGHT: Simulator Controls */}
      <div className="w-full lg:w-96 bg-surface border border-border rounded-lg flex flex-col h-full overflow-hidden shadow-sm">
         <div className="px-5 py-4 border-b border-border bg-surfaceHighlight/20 flex items-center gap-2">
            <Calculator size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-white">Simulator Inputs</h3>
         </div>

         <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            
            {/* 1. Monolith Settings */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Server size={12} /> Monolith Config
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">AS-IS</span>
               </div>
               
               <div className="p-4 rounded-lg border border-border bg-surfaceHighlight/10 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <label className="text-slate-400">Instance Count</label>
                      <span className="text-white font-mono">{monolithStats.instances}</span>
                    </div>
                    <input 
                      type="range" min="1" max="20" step="1"
                      value={monolithStats.instances} 
                      onChange={(e) => setMonolithStats({...monolithStats, instances: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">CPU (Cores)</label>
                      <input 
                        type="number" 
                        value={monolithStats.cpu}
                        onChange={(e) => setMonolithStats({...monolithStats, cpu: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-background border border-border rounded px-2 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">RAM (GB)</label>
                      <input 
                        type="number" 
                        value={monolithStats.ram}
                        onChange={(e) => setMonolithStats({...monolithStats, ram: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-background border border-border rounded px-2 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none transition-colors" 
                      />
                    </div>
                  </div>
                  
                  <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Cost / Node ($)</label>
                      <div className="relative mt-1">
                          <DollarSign size={12} className="absolute top-2 left-2 text-slate-500" />
                          <input 
                          type="number" 
                          value={monolithStats.cost}
                          onChange={(e) => setMonolithStats({...monolithStats, cost: parseInt(e.target.value)})}
                          className="w-full bg-background border border-border rounded pl-6 pr-2 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none transition-colors" 
                          />
                      </div>
                  </div>
               </div>
            </div>

            {/* 2. Microservices Settings */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={12} /> Target Config
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono">TO-BE</span>
               </div>
               
               <div className="p-4 rounded-lg border border-border bg-surfaceHighlight/10 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <label className="text-slate-400">Target Services</label>
                      <span className="text-white font-mono">{microserviceConfig.serviceCount}</span>
                    </div>
                    <input 
                      type="range" min="2" max="50" step="1"
                      value={microserviceConfig.serviceCount} 
                      onChange={(e) => setMicroserviceConfig({...microserviceConfig, serviceCount: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Avg. Cost / Service ($)</label>
                      <div className="relative mt-1">
                          <DollarSign size={12} className="absolute top-2 left-2 text-slate-500" />
                          <input 
                          type="number" 
                          value={microserviceConfig.baseCostPerService}
                          onChange={(e) => setMicroserviceConfig({...microserviceConfig, baseCostPerService: parseInt(e.target.value)})}
                          className="w-full bg-background border border-border rounded pl-6 pr-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                          />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 italic">Includes RDS, Cache, LB, & Compute</p>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-700">
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-400">Orchestration Overhead</label>
                        <span className="text-[10px] font-bold text-indigo-300">{(microserviceConfig.overheadMultiplier - 1) * 100}%</span>
                     </div>
                     <input 
                      type="range" min="1.0" max="2.0" step="0.1"
                      value={microserviceConfig.overheadMultiplier} 
                      onChange={(e) => setMicroserviceConfig({...microserviceConfig, overheadMultiplier: parseFloat(e.target.value)})}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                    />
                  </div>
               </div>
            </div>

            <button 
                onClick={() => {
                    setMonolithStats({ cpu: 32, ram: 64, cost: 1200, instances: 2 });
                    setMicroserviceConfig({ serviceCount: 8, avgCpuPerService: 2, avgRamPerService: 4, baseCostPerService: 150, overheadMultiplier: 1.2 });
                }}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all border border-transparent hover:border-slate-600"
            >
                <RefreshCw size={12} /> Reset Parameters
            </button>
         </div>
      </div>
    </div>
  );
};

export default ResourceProjection;
