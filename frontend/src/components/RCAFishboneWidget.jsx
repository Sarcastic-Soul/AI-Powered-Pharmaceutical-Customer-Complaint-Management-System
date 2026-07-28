import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GitCommit, Cpu, UserCheck, TestTube2, Compass, Thermometer } from 'lucide-react';

export default function RCAFishboneWidget() {
  const { rcaCapa } = useSelector((state) => state.complaint);
  const [viewMode, setViewMode] = useState('5whys');

  if (!rcaCapa) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 italic">
        Click "Run QMS AI Analysis" or paste a complaint log to generate 5-Whys Root Cause Analysis.
      </div>
    );
  }

  const fiveWhys = rcaCapa.five_whys || [];
  const fishbone = rcaCapa.fishbone_diagram || {};

  const categories = [
    { name: 'Man', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Machine', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { name: 'Material', icon: TestTube2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Method', icon: Compass, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { name: 'Measurement', icon: GitCommit, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Milieu', icon: Thermometer, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
  ];

  return (
    <div className="space-y-4">
      {/* Sub Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-300 font-semibold leading-relaxed">
          <strong className="text-blue-400 font-mono">Root Cause Summary:</strong> {rcaCapa.root_cause_summary}
        </p>

        <div className="flex space-x-1 shrink-0">
          <button
            onClick={() => setViewMode('5whys')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${viewMode === '5whys' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'}`}
          >
            5 Whys
          </button>
          <button
            onClick={() => setViewMode('fishbone')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${viewMode === 'fishbone' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'}`}
          >
            6M Fishbone
          </button>
        </div>
      </div>

      {/* 5 Whys Flow */}
      {viewMode === '5whys' && (
        <div className="space-y-2.5 pt-1">
          {fiveWhys.map((item, idx) => (
            <div key={idx} className="relative pl-5 border-l-2 border-slate-800 space-y-0.5">
              <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500" />
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                  Why #{item.step || idx+1}
                </span>
                <span className="text-xs font-semibold text-slate-200">{item.why}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                → {item.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 6M Fishbone */}
      {viewMode === 'fishbone' && (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const items = fishbone[cat.name] || [];
            return (
              <div key={idx} className={`p-2.5 rounded-xl border ${cat.bg} space-y-1`}>
                <div className="flex items-center space-x-1.5">
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <h5 className={`text-[11px] font-bold uppercase ${cat.color}`}>
                    {cat.name}
                  </h5>
                </div>
                {items.length > 0 ? (
                  <ul className="space-y-0.5">
                    {items.map((it, iIdx) => (
                      <li key={iIdx} className="text-[11px] text-slate-300">
                        • {it}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No issues</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
