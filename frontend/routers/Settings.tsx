import React from 'react';
import { Check } from 'lucide-react';

const Settings: React.FC = () => {
  return (
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
};

export default Settings;