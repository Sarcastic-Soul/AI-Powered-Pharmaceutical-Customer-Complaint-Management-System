import React from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CompletenessWidget() {
  const { completeness } = useSelector((state) => state.complaint);
  const score = completeness?.score_percentage || 0;
  const missing = completeness?.missing_fields || [];

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Title & Score Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Complaint Completeness
            </h3>
            <p className="text-xs text-slate-400">Regulatory Field Evaluator</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-white font-mono">{score}%</span>
          <div className="text-xs text-slate-400 font-medium">
            {completeness?.status_label || 'Evaluated Live'}
          </div>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 85 ? 'bg-emerald-500' : (score >= 60 ? 'bg-amber-500' : 'bg-red-500')
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Missing Fields List */}
      {missing.length > 0 ? (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Missing Mandatory Fields ({missing.length}):</span>
          </span>
          <div className="space-y-1.5">
            {missing.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">{item.field_name}</span>
                <span className="text-xs font-mono font-semibold text-amber-400">
                  -{item.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All mandatory fields populated for QMS registration!</span>
        </div>
      )}
    </div>
  );
}
