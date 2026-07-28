import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, saveComplaintToDb, runFullQMSAnalysis } from '../store/complaintSlice';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const { activeForm, highlightedFields, isSaving, groqApiKey, statusMessage } = useSelector((state) => state.complaint);

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleRunAnalysis = () => {
    dispatch(runFullQMSAnalysis({ form: activeForm, groqApiKey }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(saveComplaintToDb(activeForm));
  };

  const isHighlighted = (field) => highlightedFields.includes(field);

  return (
    <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <h2 className="text-base font-bold text-white">
          Pharmaceutical QMS Complaint Form
        </h2>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-400 transition"
          >
            Run QMS Analysis
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save to QMS Database'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          {statusMessage}
        </div>
      )}

      {/* SECTION 1: Customer & Facility */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Customer & Manufacturing Facility
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer / Reporter Name</label>
            <input
              type="text"
              value={activeForm.customer_name || ''}
              onChange={(e) => handleChange('customer_name', e.target.value)}
              placeholder="e.g. Sandoz Global QA"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('customer_name') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Email</label>
            <input
              type="email"
              value={activeForm.customer_email || ''}
              onChange={(e) => handleChange('customer_email', e.target.value)}
              placeholder="qa@client.com"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('customer_email') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Manufacturing Unit / Plant</label>
            <input
              type="text"
              value={activeForm.company_site || ''}
              onChange={(e) => handleChange('company_site', e.target.value)}
              placeholder="e.g. Unit 3 - Synthesis Plant"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('company_site') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Product Specs */}
      <div className="space-y-3 pt-3 border-t border-slate-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Product & Batch Specifications (API vs FDF)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
            <input
              type="text"
              value={activeForm.product_name || ''}
              onChange={(e) => handleChange('product_name', e.target.value)}
              placeholder="e.g. Paracetamol API / Atorvastatin 20mg"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('product_name') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Type</label>
            <select
              value={activeForm.product_type || 'FDF'}
              onChange={(e) => handleChange('product_type', e.target.value)}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-blue-500 ${
                isHighlighted('product_type') ? 'field-ai-highlight' : ''
              }`}
            >
              <option value="API">API (Active Ingredient)</option>
              <option value="FDF">FDF (Finished Dosage Form)</option>
              <option value="FDF Injectable">FDF Injectable / Sterile</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batch / Lot Number</label>
            <input
              type="text"
              value={activeForm.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              placeholder="e.g. B-2026-9041"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-blue-500 ${
                isHighlighted('batch_number') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dosage Form</label>
            <input
              type="text"
              value={activeForm.dosage_form || ''}
              onChange={(e) => handleChange('dosage_form', e.target.value)}
              placeholder="Tablet / Powder / Injection"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('dosage_form') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Conditions</label>
            <input
              type="text"
              value={activeForm.storage_conditions || ''}
              onChange={(e) => handleChange('storage_conditions', e.target.value)}
              placeholder="Store below 25°C"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('storage_conditions') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Manufacturing Date</label>
            <input
              type="date"
              value={activeForm.mfg_date || ''}
              onChange={(e) => handleChange('mfg_date', e.target.value)}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('mfg_date') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
            <input
              type="date"
              value={activeForm.expiry_date || ''}
              onChange={(e) => handleChange('expiry_date', e.target.value)}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('expiry_date') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Defect Details */}
      <div className="space-y-3 pt-3 border-t border-slate-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Defect Details & Investigation Report
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Type</label>
            <select
              value={activeForm.defect_type || 'Quality Defect'}
              onChange={(e) => handleChange('defect_type', e.target.value)}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('defect_type') ? 'field-ai-highlight' : ''
              }`}
            >
              <option value="Quality Defect">Quality Defect</option>
              <option value="Packaging & Seal">Packaging & Seal</option>
              <option value="Impurity / OOS">Impurity / Out of Spec (OOS)</option>
              <option value="Contamination">Contamination / Particulate</option>
              <option value="Labeling / Mislabeling">Labeling / Mislabeling</option>
              <option value="Adverse Event">Adverse Event</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Category</label>
            <input
              type="text"
              value={activeForm.defect_category || ''}
              onChange={(e) => handleChange('defect_category', e.target.value)}
              placeholder="e.g. Blister Delamination / High Impurity"
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                isHighlighted('defect_category') ? 'field-ai-highlight' : ''
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Defect Description</label>
          <textarea
            rows={3}
            value={activeForm.defect_description || ''}
            onChange={(e) => handleChange('defect_description', e.target.value)}
            placeholder="Description of quality flaw, test findings, or customer report..."
            className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
              isHighlighted('defect_description') ? 'field-ai-highlight' : ''
            }`}
          />
        </div>
      </div>

      {/* SECTION 4: Severity & Regulatory Alert */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/60">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
          <div className="flex space-x-2">
            {['Critical', 'Major', 'Minor'].map((level) => {
              const active = activeForm.severity_level === level;
              const colorMap = {
                Critical: 'bg-red-500/20 text-red-300 border-red-500/40',
                Major: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                Minor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              };
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => handleChange('severity_level', level)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    active ? colorMap[level] + ' shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Regulatory Alert (FDA / EMA)</label>
          <button
            type="button"
            onClick={() => handleChange('regulatory_reportable', !activeForm.regulatory_reportable)}
            className={`w-full py-2 px-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
              activeForm.regulatory_reportable
                ? 'bg-red-950/70 text-red-300 border-red-600/60'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>{activeForm.regulatory_reportable ? 'FDA 15-Day Reportable' : 'Internal QMS Only'}</span>
            <span className="text-xs font-bold">{activeForm.regulatory_reportable ? 'YES' : 'NO'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Sample Received</label>
          <button
            type="button"
            onClick={() => handleChange('sample_available', !activeForm.sample_available)}
            className={`w-full py-2 px-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
              activeForm.sample_available
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span>{activeForm.sample_available ? 'Sample in QC Lab' : 'No Sample'}</span>
            <span className="text-xs font-bold">{activeForm.sample_available ? 'YES' : 'NO'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
