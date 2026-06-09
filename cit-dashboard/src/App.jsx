import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Jobmanagement from './pages/Jobmanagement';
import Candidates from './pages/Candidates';
import Interview from './pages/Interview';
import Evaluation from './pages/Evaluation';
import Selection from './pages/Selection';
import Offer from './pages/Offer';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="bg-slate-50 text-gray-900 font-sans antialiased h-screen w-full flex flex-col relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <div 
          className={`flex flex-col flex-1 h-full min-w-0 transition-all duration-300 ${
            isSidebarOpen ? 'lg:pl-[240px]' : 'lg:pl-0'
          }`}
        >
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 w-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* HR-only routes */}
              <Route path="/dashboard" element={
                <PrivateRoute allowedRole="HR">
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/jobs" element={
                <PrivateRoute allowedRole="HR">
                  <Jobmanagement />
                </PrivateRoute>
              } />
              <Route path="/candidates" element={
                <PrivateRoute allowedRole="HR">
                  <Candidates />
                </PrivateRoute>
              } />

              {/* Interview Panelist-only routes */}
              <Route path="/interviews" element={
                <PrivateRoute allowedRole="InterviewPanelist">
                  <Interview />
                </PrivateRoute>
              } />
              <Route path="/evaluation" element={
                <PrivateRoute allowedRole="InterviewPanelist">
                  <Evaluation />
                </PrivateRoute>
              } />

              {/* Shared routes */}
              <Route path="/selection" element={<Selection />} />
              <Route path="/offers" element={<Offer />} />

              {/* Unauthorized fallback */}
              <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
