import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../components/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: credentialResponse.credential })
      });
      if (!res.ok) throw new Error('Google login failed');
      const data = await res.json();
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Sign in to XenoReach CRM</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          width="100%"
        />
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
} 