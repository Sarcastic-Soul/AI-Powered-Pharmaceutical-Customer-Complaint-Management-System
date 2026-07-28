import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';

export default function CAPARecommendation() {
  const { rcaCapa } = useSelector((state) => state.complaint);

  if (!rcaCapa || !rcaCapa.capa_items || rcaCapa.capa_items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 italic">
        No CAPA actions generated yet. Click "Run QMS AI Analysis" to generate recommendations.
      </div>
    );
  }

  const items = rcaCapa.capa_items;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Action</th>
              <th className="py-2 px-2">Owner</th>
              <th className="py-2 px-2">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((capa, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition">
                <td className="py-2.5 px-2 font-mono font-bold text-blue-400">
                  {capa.id || `CAPA-0${idx+1}`}
                </td>
                <td className="py-2.5 px-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    capa.type === 'Corrective' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {capa.type}
                  </span>
                </td>
                <td className="py-2.5 px-2 font-medium text-slate-200 leading-relaxed">
                  {capa.action}
                </td>
                <td className="py-2.5 px-2 text-slate-400 font-medium">
                  {capa.owner}
                </td>
                <td className="py-2.5 px-2 font-mono text-slate-300">
                  {capa.target_days}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
