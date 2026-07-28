import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldAlert, Activity, FileText } from 'lucide-react';

export default function RiskMatrixWidget() {
  const { riskAnalysis } = useSelector((state) => state.complaint);

  if (!riskAnalysis) return null;

  const severity = riskAnalysis.severity_level || 'Major';
  const isReportable = riskAnalysis.regulatory_reportable;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Title & Severity Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-white">
            AI Risk Classification & Regulatory Status
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
            severity === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            (severity === 'Major' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
          }`}>
            Severity: {severity}
          </span>

          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700">
            Risk: {riskAnalysis.patient_health_risk || 'Medium'}
          </span>
        </div>
      </div>

      {/* FDA Reportable Warning Banner */}
      {isReportable ? (
        <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-red-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>REGULATORY ALERT: 21 CFR 314.81 FIELD ALERT REPORT REQUIRED</span>
          </div>
          <p className="text-xs text-red-200/90 leading-relaxed">
            {riskAnalysis.risk_justification || 'Critical quality defect impacting product safety/purity. Mandatory 15-day Field Alert Report (FAR) notification required.'}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{riskAnalysis.risk_justification || 'Internal QMS investigation assigned. Standard CAPA closure active.'}</span>
        </div>
      )}

      {/* Executive Summary */}
      {riskAnalysis.executive_summary && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>AI Executive Summary:</span>
          </span>
          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {riskAnalysis.executive_summary}
          </p>
        </div>
      )}
    </div>
  );
}
