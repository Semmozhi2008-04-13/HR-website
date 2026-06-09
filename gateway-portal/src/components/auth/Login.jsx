import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import styles from './Login.module.css';
import cit from '../../assets/cit.jfif';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState([]); // List of roles returned from backend
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const auth = useAuth();
  if (!auth) {
    return <div>Error: AuthProvider not found. Check your main.jsx imports!</div>;
  }
  const { setRole } = auth;
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {

        // If backend sends a list of roles
        if (data.roles && data.roles.length > 1) {
          setRoles(data.roles);
          setShowRoleSelect(true); // Switch to selection view
        } else {
          // Direct login for single role
          processRoleSelection(data.roles[0]);
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const processRoleSelection = (selectedRole) => {
    setRole(selectedRole); // Update Context
    if (selectedRole === 'HR') {
      window.location.href = 'http://localhost:5173/dashboard';
    } else {
      window.location.href = 'http://localhost:5174/interviewdashboard';
    }
  };

  if (showRoleSelect) {
    return (
      <div className={styles.logincontainer}>
        <div className={styles.loginForm}>
          <img src={cit} className={styles.loginimg} alt="Logo" />
          <h2 className={styles.loginHeading}>Select Role</h2>
          {roles.map((r) => (
            <button key={r} onClick={() => processRoleSelection(r)} className={styles.roleBtn}>
              Enter {r} Portal
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.logincontainer}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <img src={cit} className={styles.loginimg}></img>
        <h2 className={styles.loginHeading}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default Login;