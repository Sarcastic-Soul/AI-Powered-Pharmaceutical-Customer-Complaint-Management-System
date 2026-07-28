import React from 'react';
import { useSelector } from 'react-redux';
import { Layers } from 'lucide-react';

export default function DuplicateDetector() {
  const { duplicates } = useSelector((state) => state.complaint);

  if (!duplicates || duplicates.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 italic">
        No recurring batch or duplicate complaint matches found in database.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {duplicates.map((dup, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-blue-400">{dup.complaint_number}</span>
              <span className="font-semibold text-white">{dup.product_name}</span>
              {dup.batch_number && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Batch: {dup.batch_number}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
              {dup.confidence_score}% Match
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Historical Investigation Notes:</strong> {dup.historical_root_cause}
          </p>
        </div>
      ))}
    </div>
  );
}
