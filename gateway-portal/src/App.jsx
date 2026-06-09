import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth} from './components/contexts/AuthContext';
import Login from './components/auth/Login.jsx'; // Adjust path to your Login.jsx
import HRDashboard from '../../cit-dashboard/src/pages/Dashboard.jsx';
import InterviewerDashboard from '../../interviewer-recruit/src/components/Dashboard.jsx';

import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useAuth();

  // if (!role) {
  //   console.log("ProtectedRoute: No role found, redirecting to /login");
  //   return <Navigate to="/login" replace />;
  // }

  if (!role){
  return <h1>Redirecting...</h1>; // If you see this, the logic is working
  }
  
  // If the roles don't match, redirect to login (or unauthorized)
  if (role !== allowedRole) {
    console.log("ProtectedRoute: Role mismatch, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Only if role exists AND matches, show the page
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="HR"> <HRDashboard /> </ProtectedRoute>
          } />
          
          <Route path="/interviewdashboard" element={
            <ProtectedRoute allowedRole="INTERVIEWER"> <InterviewerDashboard /> </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;