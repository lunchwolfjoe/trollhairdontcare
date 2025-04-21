'use client';

import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        setAuthStatus(data);
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      
      if (response.ok) {
        // Reload the page to update auth state
        window.location.reload();
      } else {
        setError('Failed to sign out');
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Client-Side Authentication Test</h1>
      
      {loading ? (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p>Loading authentication status...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Authentication Status:</h2>
          <div className="bg-white p-3 rounded shadow-sm">
            {authStatus?.authenticated ? (
              <p className="text-green-600 font-semibold">Authenticated ✓</p>
            ) : (
              <p className="text-red-600 font-semibold">Not authenticated ✗</p>
            )}
          </div>
          
          {authStatus?.env && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Environment Variables:</h3>
              <div className="bg-white p-3 rounded shadow-sm text-sm">
                <p>Supabase URL: {authStatus.env.supabaseUrl}</p>
                <p>Anon Key: {authStatus.env.hasAnonKey ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          )}
          
          {authStatus?.error && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1 text-red-600">Error:</h3>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-red-600">{authStatus.error}</p>
              </div>
            </div>
          )}
          
          {authStatus?.session && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">User:</h3>
              <div className="bg-white p-3 rounded shadow-sm overflow-auto">
                <pre className="text-sm">{JSON.stringify(authStatus.session.user, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {authStatus?.authenticated && (
            <div className="mt-4">
              <button 
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="flex space-x-4">
        <a href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Go to Sign In
        </a>
        <a href="/debug-env" className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
          Debug Environment
        </a>
      </div>
    </div>
  );
} 