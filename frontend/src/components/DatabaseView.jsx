import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/complaintSlice';
import { Database, Search, Eye, X } from 'lucide-react';

export default function DatabaseView() {
  const dispatch = useDispatch();
  const { savedComplaints } = useSelector((state) => state.complaint);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const filtered = savedComplaints.filter((item) => {
    if (filterType !== 'ALL' && item.product_type !== filterType) return false;
    if (filterSeverity !== 'ALL' && item.severity_level !== filterSeverity) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchNum = (item.complaint_number || '').toLowerCase().includes(term);
      const matchProd = (item.product_name || '').toLowerCase().includes(term);
      const matchBatch = (item.batch_number || '').toLowerCase().includes(term);
      const matchCust = (item.customer_name || '').toLowerCase().includes(term);
      return matchNum || matchProd || matchBatch || matchCust;
    }
    return true;
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Pharmaceutical QMS Complaints Database
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Central repository of logged API & FDF complaints, batch audits, and CAPA statuses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaint #, batch, product..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold"
          >
            <option value="ALL">All Product Types</option>
            <option value="API">API</option>
            <option value="FDF">FDF</option>
            <option value="FDF Injectable">FDF Injectable</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Complaint #</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Batch #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    {comp.complaint_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {comp.product_name || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                      {comp.product_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-300 font-bold">
                    {comp.batch_number || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{comp.customer_name || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      comp.severity_level === 'Critical' ? 'bg-red-500/20 text-red-300' :
                      (comp.severity_level === 'Major' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300')
                    }`}>
                      {comp.severity_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-400">
                    {comp.investigation_status}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedComplaint(comp)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-white border border-slate-800 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500 text-xs italic">
                  No complaints found in QMS database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono font-bold text-blue-400 text-sm">{selectedComplaint.complaint_number}</span>
                <h3 className="text-lg font-bold text-white">{selectedComplaint.product_name}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Batch Number:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{selectedComplaint.batch_number}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Severity:</span>
                <span className="font-bold text-red-400 text-sm">{selectedComplaint.severity_level}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300 uppercase">Defect Description:</span>
              <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {selectedComplaint.defect_description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
