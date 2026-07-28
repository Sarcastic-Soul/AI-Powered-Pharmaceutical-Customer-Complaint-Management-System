import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CompletenessWidget from './CompletenessWidget';
import RiskMatrixWidget from './RiskMatrixWidget';
import RCAFishboneWidget from './RCAFishboneWidget';
import CAPARecommendation from './CAPARecommendation';
import DuplicateDetector from './DuplicateDetector';

export default function AIIntelligencePanel() {
  const [activeTab, setActiveTab] = useState('rca'); // 'rca', 'capa', 'risk', 'duplicates'
  const { duplicates } = useSelector((state) => state.complaint);

  const tabs = [
    { id: 'rca', label: 'Root Cause (RCA)' },
    { id: 'capa', label: 'CAPA Plan' },
    { id: 'risk', label: 'Risk & Summary' },
    { id: 'duplicates', label: `Duplicates (${duplicates?.length || 0})` }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Fixed Height Completeness Meter */}
      <CompletenessWidget />

      {/* 2. Unified Tabbed AI Analysis Container */}
      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-1.5 px-2 font-bold rounded-lg transition text-center ${
                  active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'rca' && <RCAFishboneWidget />}
          {activeTab === 'capa' && <CAPARecommendation />}
          {activeTab === 'risk' && <RiskMatrixWidget />}
          {activeTab === 'duplicates' && <DuplicateDetector />}
        </div>
      </div>
    </div>
  );
}
