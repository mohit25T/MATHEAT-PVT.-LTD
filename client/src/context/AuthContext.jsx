import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: '1', username: 'admin', firstName: 'Mohit', lastName: 'Admin', role: 'SUPER_ADMIN', department: 'Management' },
  { id: '2', username: 'prodmgr', firstName: 'Suresh', lastName: 'Patil', role: 'PRODUCTION_MANAGER', department: 'Production' },
  { id: '3', username: 'operator', firstName: 'Ramesh', lastName: 'Kumar', role: 'FURNACE_OPERATOR', department: 'Furnace Shop Floor', badgeNumber: 'OP-104' },
  { id: '4', username: 'qcmgr', firstName: 'Er. Rajesh', lastName: 'Sharma', role: 'QC_MANAGER', department: 'Metallurgical QA Lab' },
  { id: '5', username: 'storemgr', firstName: 'Anil', lastName: 'Deshmukh', role: 'STORE_MANAGER', department: 'Stores & Dispatch' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('matheat_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0];
  });

  const [token, setToken] = useState(() => localStorage.getItem('matheat_token') || 'demo-jwt-token');

  const login = async (username, password) => {
    try {
      const data = await api.auth.login({ username, password });
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('matheat_user', JSON.stringify(data.user));
        localStorage.setItem('matheat_token', data.token);
        return { success: true };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      // Fallback to matching demo user
      const found = DEMO_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (found) {
        setUser(found);
        setToken(`mock-token-${found.username}`);
        localStorage.setItem('matheat_user', JSON.stringify(found));
        localStorage.setItem('matheat_token', `mock-token-${found.username}`);
        return { success: true };
      }
      throw err;
    }
  };

  const switchDemoRole = (roleKey) => {
    const found = DEMO_USERS.find(u => u.role === roleKey) || DEMO_USERS[0];
    setUser(found);
    localStorage.setItem('matheat_user', JSON.stringify(found));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('matheat_user');
    localStorage.removeItem('matheat_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchDemoRole, demoUsers: DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
