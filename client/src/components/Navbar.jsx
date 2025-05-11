import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import logo from '../assets/react.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on login/register pages
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  // Logo click handler
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  if (hideNav) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button onClick={handleLogoClick} className="flex items-center gap-2 focus:outline-none group">
            <img src={logo} alt="XenoReach Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition">XenoReach CRM</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button onClick={handleLogoClick} className="flex items-center gap-2 focus:outline-none group">
            <img src={logo} alt="XenoReach Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition">XenoReach CRM</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link to="/segments" className="text-gray-700 hover:text-blue-600 font-medium">Segment Builder</Link>
                <Link to="/campaigns" className="text-gray-700 hover:text-blue-600 font-medium">Campaign Creator</Link>
                <Link to="/history" className="text-gray-700 hover:text-blue-600 font-medium">Campaign History</Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-blue-600 font-semibold hover:underline mr-2">Sign In</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
              </>
            )}
            {user && (
              <>
                <span className="text-gray-700 font-semibold mr-2">{user.name}</span>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">Logout</button>
              </>
            )}
          </div>
          {/* Hamburger for mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow rounded-lg mt-2 p-4 flex flex-col gap-4">
            {user && (
              <>
                <Link to="/segments" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Segment Builder</Link>
                <Link to="/campaigns" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Campaign Creator</Link>
                <Link to="/history" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Campaign History</Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-blue-600 font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
            {user && (
              <>
                <span className="text-gray-700 font-semibold">{user.name}</span>
                <button onClick={() => { setMenuOpen(false); logout(); }} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition mt-2">Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 