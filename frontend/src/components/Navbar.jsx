import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab, toggleChatDrawer, resetForm } from '../store/complaintSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const { activeTab, isChatDrawerOpen, savedComplaints } = useSelector((state) => state.complaint);

  const navs = [
    { id: 'logger', label: 'Complaint Form' },
    { id: 'database', label: 'Database', count: savedComplaints.length },
    { id: 'audit', label: '21 CFR Audit Trail' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-6 h-16 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
          AQ
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-white tracking-tight">AIVOA</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Pharma QMS
            </span>
          </div>
          <p className="text-xs text-slate-400">Customer Complaint Management System</p>
        </div>
      </div>

      {/* Main Workspace Nav Links */}
      <nav className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        {navs.map((n) => {
          const active = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => dispatch(setActiveTab(n.id))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{n.label}</span>
              {n.count !== undefined && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded bg-slate-800 font-mono">
                  {n.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Top Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(resetForm())}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
        >
          Clear Form
        </button>

        <button
          onClick={() => dispatch(toggleChatDrawer())}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            isChatDrawerOpen
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          AI Form Assistant
        </button>
      </div>
    </header>
  );
}
