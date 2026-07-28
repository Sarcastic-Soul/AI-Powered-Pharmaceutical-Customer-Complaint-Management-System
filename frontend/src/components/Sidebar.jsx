import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../store/complaintSlice';
import { FileEdit, Database, ShieldAlert, BarChart3, Pill, ExternalLink } from 'lucide-react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { activeTab, savedComplaints } = useSelector((state) => state.complaint);

  const navItems = [
    {
      id: 'logger',
      label: 'Complaint Logger',
      icon: FileEdit,
      badge: null
    },
    {
      id: 'database',
      label: 'QMS Database',
      icon: Database,
      badge: savedComplaints.length
    },
    {
      id: 'audit',
      label: '21 CFR Part 11 Trail',
      icon: ShieldAlert,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Quality Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 glass-panel flex flex-col justify-between hidden lg:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            QMS Workspaces
          </h4>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch(setActiveTab(item.id))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pharma QMS Scope Info */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Pill className="w-4 h-4 text-emerald-400" />
            <span>API & FDF Compliance</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Engineered for Active Pharmaceutical Ingredients (API) & Finished Dosage Forms (FDF) complaint lifecycle, RCA 5-Whys, CAPA tracking & FDA/EMA risk reporting.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800">
        <a
          href="https://aivoa.ai"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-xs text-slate-400 hover:text-blue-400 transition"
        >
          <span>Company: <strong className="text-white">aivoa.ai</strong></span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
