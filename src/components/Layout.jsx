import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>  
      <nav className="main-nav">
        <div className="nav-content">
          <Link to="/" className="logo">PKM<span>Hub</span></Link>
          
          {/* Hamburger menu button for mobile */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          
          <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            {isAuthenticated ? (
              <>
                <Link to="/" className={isActive('/')} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/knowledge-base" className={isActive('/knowledge-base')} onClick={() => setMobileMenuOpen(false)}>Knowledge Base</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className='btn'>Logout</button>
              </>
            ): (
              <>
                <Link to="/" className={isActive('/')} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/login" className="btn" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="gradient-bg" />
        <Outlet/>
      </main>
    </>
  );
};

export default Layout;
