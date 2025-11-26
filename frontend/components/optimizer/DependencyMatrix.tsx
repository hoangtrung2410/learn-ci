
import React, { useState } from 'react';
import { Info } from 'lucide-react';

const DependencyMatrix: React.FC = () => {
  // Mock Matrix Data (Rows: Sources, Cols: Targets)
  // Values: 0 (No Dep), 1 (Low/Loose), 2 (High/Tight)
  const modules = ['Auth', 'User', 'Order', 'Inv', 'Pay', 'Notif', 'Report'];
  const matrix = [
    [0, 0, 0, 0, 0, 1, 0], // Auth
    [1, 0, 1, 0, 1, 1, 0], // User
    [0, 1, 0, 2, 1, 1, 1], // Order
    [0, 0, 0, 0, 0, 0, 1], // Inv
    [0, 0, 2, 0, 0, 1, 0], // Pay
    [0, 0, 0, 0, 0, 0, 0], // Notif
    [1, 1, 1, 1, 1, 0, 0], // Report (Coupled to everything)
  ];

  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const getCellConfig = (value: number) => {
    switch(value) {
      case 2: return { bg: 'bg-rose-500', text: 'text-white', label: 'Tight' }; 
      case 1: return { bg: 'bg-indigo-500/50', text: 'text-indigo-100', label: 'Loose' };
      default: return { bg: 'bg-surfaceHighlight/30', text: 'text-transparent', label: '' };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-0 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surfaceHighlight/20 flex justify-between items-center">
        <div>
           <h3 className="text-sm font-semibold text-white">Coupling Analysis</h3>
           <p className="text-xs text-slate-500">Service Dependency Heatmap</p>
        </div>
        <div className="group relative">
           <Info size={16} className="text-slate-500 hover:text-primary cursor-help" />
           <div className="absolute right-0 top-6 w-48 bg-surface border border-border p-3 rounded shadow-xl text-[10px] text-slate-300 z-10 hidden group-hover:block">
              Rows depend on Columns.
              <br/>Red = Tight Coupling (Hard to split).
              <br/>Purple = Loose Coupling (API calls).
           </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-auto">
        <div 
           className="grid gap-1" 
           style={{ gridTemplateColumns: `auto repeat(${modules.length}, minmax(36px, 1fr))` }}
           onMouseLeave={() => { setHoverRow(null); setHoverCol(null); }}
        >
          
          {/* Header Row */}
          <div className="h-8"></div> {/* Empty corner */}
          {modules.map((mod, i) => (
            <div key={i} className="flex items-end justify-center h-20 pb-2">
               <span className={`text-[10px] font-mono uppercase tracking-wider -rotate-90 origin-bottom translate-y-2 transition-colors ${hoverCol === i ? 'text-white font-bold' : 'text-slate-500'}`}>
                 {mod}
               </span>
            </div>
          ))}

          {/* Matrix Rows */}
          {matrix.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Row Label */}
              <div className="flex items-center justify-end pr-3 h-9">
                <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${hoverRow === rowIndex ? 'text-white font-bold' : 'text-slate-500'}`}>
                  {modules[rowIndex]}
                </span>
              </div>
              
              {/* Cells */}
              {row.map((val, colIndex) => {
                 const config = getCellConfig(val);
                 const isHovered = hoverRow === rowIndex || hoverCol === colIndex;
                 const isTarget = hoverRow === rowIndex && hoverCol === colIndex;
                 
                 return (
                  <div 
                    key={colIndex} 
                    className="h-9 w-full relative group"
                    onMouseEnter={() => { setHoverRow(rowIndex); setHoverCol(colIndex); }}
                  >
                      <div className={`w-full h-full rounded transition-all duration-200 flex items-center justify-center text-[10px] font-bold border border-transparent
                        ${config.bg} ${config.text}
                        ${isHovered ? 'opacity-100' : 'opacity-80'}
                        ${isTarget ? 'border-white/50 scale-105 z-10 shadow-lg' : ''}
                      `}>
                          {val > 0 ? val : '·'}
                      </div>
                  </div>
                 );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex gap-6 text-xs bg-surfaceHighlight/20 px-4 py-2 rounded-full border border-border">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> <span className="text-slate-400">Tight (Risk)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500/50 rounded-sm"></div> <span className="text-slate-400">Loose (API)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-surfaceHighlight/30 rounded-sm border border-slate-700"></div> <span className="text-slate-600">None</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyMatrix;
