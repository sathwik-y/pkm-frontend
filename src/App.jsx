import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setLogoutFunction } from './services/api';
import './styles/Home.css';
import './styles/Layout.css';

function AuthConnector({ children }) {
  const { logout } = useAuth();
  
  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout]);
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthConnector>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="login" element={<Login />} />
            </Route>
          </Routes>
        </AuthConnector>
      </Router>
    </AuthProvider>
  );
}

export default App;
