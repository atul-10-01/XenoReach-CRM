// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SegmentBuilder from './components/SegmentBuilder';
import CampaignCreator from './components/CampaignCreator';
import CampaignHistory from './pages/CampaignHistory';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './components/Landing';
import Register from './pages/Register';

function DashboardNav() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">XenoReach CRM</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/segments" className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">Segment Builder</Link>
              <Link to="/campaigns" className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">Campaign Creator</Link>
              <Link to="/history" className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">Campaign History</Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="text-gray-700 mr-4">{user.name}</span>
                <button onClick={logout} className="text-blue-600 hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-600 hover:underline mr-2">Login</Link>
                <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/segments" element={<ProtectedRoute><SegmentBuilder /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><CampaignCreator /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><CampaignHistory /></ProtectedRoute>} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}
