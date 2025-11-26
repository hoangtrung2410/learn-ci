
import React from 'react';
import DependencyMatrix from './DependencyMatrix';
import DeploymentSimulator from './DeploymentSimulator';
import ResourceProjection from './ResourceProjection';

const SystemOptimizerView: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-fade-in space-y-6 mt-4 pb-10">
      <div className="flex justify-between items-end pb-2 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Optimizer</h2>
          <p className="text-slate-400 text-sm mt-1">
             Architectural Decision Support System (ADSS)
          </p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full font-medium">v2.1 Simulator</span>
        </div>
      </div>

      {/* Row 1: Resource Simulator (Full Width) */}
      <div className="w-full">
         <ResourceProjection />
      </div>

      {/* Row 2: Matrix & Deployment */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[500px]">
         <DependencyMatrix />
         <DeploymentSimulator />
      </div>
    </div>
  );
};

export default SystemOptimizerView;
