import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  extractFieldsFromText,
  uploadAndExtractFile,
  setRawLogText,
  runFullQMSAnalysis
} from '../store/complaintSlice';
import { getApiUrl } from '../apiConfig';
import { Sparkles, Loader2 } from 'lucide-react';

export default function DocumentUploader() {
  const dispatch = useDispatch();
  const { groqApiKey, isExtracting } = useSelector((state) => state.complaint);
  const [presets, setPresets] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [activePresetId, setActivePresetId] = useState('');

  useEffect(() => {
    fetch(getApiUrl('/api/presets'))
      .then((res) => res.json())
      .then((data) => setPresets(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Presets error:', err));
  }, []);

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setTextInput(preset.text);
    dispatch(setRawLogText(preset.text));
  };

  const handleExtractText = () => {
    if (!textInput.trim()) return;
    dispatch(setRawLogText(textInput));
    dispatch(extractFieldsFromText({ text: textInput, groqApiKey })).then((res) => {
      if (res.payload && res.payload.form_data) {
        dispatch(runFullQMSAnalysis({ form: res.payload.form_data, groqApiKey }));
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(uploadAndExtractFile({ file })).then((res) => {
        if (res.payload && res.payload.form_data) {
          dispatch(runFullQMSAnalysis({ form: res.payload.form_data, groqApiKey }));
        }
      });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">
          Complaint Document & Log Intake
        </h2>

        {/* Demo Preset Buttons */}
        {presets.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Sample Presets:</span>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition shrink-0 ${
                  activePresetId === p.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Text Area */}
      <div>
        <textarea
          rows={4}
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            dispatch(setRawLogText(e.target.value));
          }}
          placeholder="Paste raw customer email, lab certificate of analysis, OOS report, or select a sample preset above..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
        />

        {/* Buttons */}
        <div className="mt-3 flex items-center justify-between">
          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition">
            Upload PDF / Document
            <input
              type="file"
              accept=".pdf,.txt,.log,.email"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExtractText}
            disabled={isExtracting || !textInput.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Fields...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Extract Complaint Fields</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
