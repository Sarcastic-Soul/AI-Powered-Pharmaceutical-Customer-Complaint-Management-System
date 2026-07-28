import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChatDrawer, fetchComplaints } from './store/complaintSlice';
import Navbar from './components/Navbar';
import DocumentUploader from './components/DocumentUploader';
import ComplaintForm from './components/ComplaintForm';
import AIIntelligencePanel from './components/AIIntelligencePanel';
import AIChatDrawer from './components/AIChatDrawer';
import DatabaseView from './components/DatabaseView';
import AuditTrailView from './components/AuditTrailView';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function App() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.complaint);

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar Header */}
      <Navbar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
        {activeTab === 'logger' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Intake & Form */}
            <div className="lg:col-span-2 space-y-6">
              <DocumentUploader />
              <ComplaintForm />
            </div>

            {/* Right Column: AI Intelligence Panel */}
            <div className="lg:col-span-1">
              <AIIntelligencePanel />
            </div>
          </div>
        )}

        {activeTab === 'database' && <DatabaseView />}
        {activeTab === 'audit' && <AuditTrailView />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>

      {/* Overlay AI Assistant Drawer */}
      <AIChatDrawer />
    </div>
  );
}
