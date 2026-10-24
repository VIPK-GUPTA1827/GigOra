import React from 'react';
import { Code2, Database, Cpu, Globe, Layers, Smartphone, MapPin } from 'lucide-react';

const TrustStrip = () => {
  const techStacks = [
    { name: 'React.js', icon: Globe },
    { name: 'Node.js', icon: Layers },
    { name: 'Python & FastAPI', icon: Cpu },
    { name: 'Next.js', icon: Code2 },
    { name: 'MongoDB', icon: Database },
    { name: 'Flutter & Mobile', icon: Smartphone }
  ];

  return (
    <div className="py-7 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Indian Tech Hubs indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Active Talent Hubs:</span>
            <span className="text-slate-500 font-medium">Mumbai • Bengaluru • Delhi NCR • Pune • Remote</span>
          </div>

          {/* Right: Modern Tech Stacks */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
            {techStacks.map((tech) => {
              const Icon = tech.icon;
              return (
                <div 
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition cursor-default"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrustStrip;
