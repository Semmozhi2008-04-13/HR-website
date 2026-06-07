import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Page Components
import Dashboard from './components/Dashboard';
import AssignedInterviews from './components/AssignedInterviews';
import InterviewSchedule from './components/InterviewSchedule';
import CandidateProfile from './components/CandidateProfile';
import EvaluationForms from './components/EvaluationForms';
import PanelCollaboration from './components/PanelCollaboration';
import FeedbackandDecisions from './components/Feedback&Decisions';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); // Added state

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    setShowLogoutPopup(true);
    setTimeout(() => {
      setShowLogoutPopup(false);
      // Perform your actual logout logic here
    }, 2000);
  };

  return (
    <Router>
      <div className="bg-slate-50 text-gray-900 font-sans antialiased h-screen w-full flex flex-col relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
        
        {/* Logout Popup Overlay */}
        {showLogoutPopup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>
              <h2 className="text-xl font-bold text-gray-800">Logged Out</h2>
              <p className="text-gray-500 mt-1">You have been successfully signed out.</p>
            </div>
          </div>
        )}

        {/* Left Fixed Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={closeSidebar} 
          onLogout={handleLogout} // Passed function here
        />

        {/* Workspace Wrapper */}
        <div 
          className={`flex flex-col flex-1 h-full min-w-0 transition-all duration-300 ${
            isSidebarOpen ? 'lg:pl-[240px]' : 'lg:pl-0'
          }`}
        >
          {/* Header */}
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          
          {/* Route Viewports */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assignedinterviews" element={<AssignedInterviews />} />
              <Route path="/interviewschedule" element={<InterviewSchedule />} />
              <Route path="/candidateprofile" element={<CandidateProfile />} />
              <Route path="/evaluationforms" element={<EvaluationForms />} />
              <Route path="/panelcollaboration" element={<PanelCollaboration />} />
              <Route path="/feedbackdecisions" element={<FeedbackandDecisions />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;