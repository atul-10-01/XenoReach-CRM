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
import Navbar from './components/Navbar';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
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
