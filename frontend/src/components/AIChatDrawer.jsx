import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendNLChatMessage, toggleChatDrawer, runFullQMSAnalysis } from '../store/complaintSlice';
import { Send, X, Zap } from 'lucide-react';

export default function AIChatDrawer() {
  const dispatch = useDispatch();
  const { chatHistory, activeForm, groqApiKey, isChatDrawerOpen } = useSelector((state) => state.complaint);
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatDrawerOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isChatDrawerOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const msg = inputMsg;
    setInputMsg('');
    dispatch(sendNLChatMessage({ message: msg, currentForm: activeForm, groqApiKey })).then((res) => {
      if (res.payload && res.payload.form_data) {
        dispatch(runFullQMSAnalysis({ form: res.payload.form_data, groqApiKey }));
      }
    });
  };

  const quickPrompts = [
    "Elevate severity to Critical and flag as FDA reportable",
    "Change product type to API and batch number to B-2026-9901",
    "Update customer name to Sandoz Quality Assurance",
    "Set sample status to Received in QC Lab"
  ];

  if (!isChatDrawerOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 z-50 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div>
          <h3 className="text-sm font-bold text-white">AI Form Assistant</h3>
          <p className="text-xs text-slate-400">Type natural language commands to update fields</p>
        </div>

        <button
          onClick={() => dispatch(toggleChatDrawer())}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[11px] text-slate-400 px-1 font-medium">
              {msg.sender === 'user' ? 'QA Officer' : 'AI Assistant'} • {msg.timestamp}
            </div>

            <div
              className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.changedFields && msg.changedFields.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase mr-1">Updated:</span>
                  {msg.changedFields.map((f, fIdx) => (
                    <span key={fIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1.5">
        <div className="text-xs font-semibold text-slate-400">Quick Commands:</div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, qIdx) => (
            <button
              key={qIdx}
              onClick={() => setInputMsg(qp)}
              className="text-xs text-left px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition truncate max-w-full"
            >
              "{qp}"
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Instruct AI to edit form fields..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
