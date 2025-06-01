import React, { useState, useEffect } from 'react';
import { supabase, auth } from '../lib/simpleAuthClient';

// Environment debug component that shows all environment variables and checks Supabase initialization
export default function DebugEnv() {
  const [clientStatus, setClientStatus] = useState('Checking...');
  const [envVars, setEnvVars] = useState({});
  const [showFull, setShowFull] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);
  const [isConnectionTesting, setIsConnectionTesting] = useState(false);
  
  useEffect(() => {
    // Collect all environment variables
    const allEnvVars = {};
    // Get all import.meta.env variables
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
          // Mask sensitive values
          allEnvVars[key] = 'Defined (hidden for security)';
        } else {
          allEnvVars[key] = import.meta.env[key];
        }
      }
    });
    
    setEnvVars(allEnvVars);
    
    // Check Supabase client
    try {
      if (!supabase) {
        setClientStatus('ERROR: Supabase client is undefined');
        return;
      }
      
      if (!supabase.auth) {
        setClientStatus('ERROR: Supabase auth module is missing');
        return;
      }
      
      // Check if critical properties exist
      if (!supabase.supabaseUrl || !supabase.supabaseKey) {
        setClientStatus('ERROR: Missing Supabase URL or key in client');
        return;
      }
      
      setClientStatus('OK: Supabase client properly initialized');
      
      // Run a connection test on mount
      testDirectConnection();
    } catch (err) {
      setClientStatus(`ERROR: ${err.message}`);
    }
  }, []);

  // Test auth methods
  const testAuth = async () => {
    try {
      const session = await auth.getSession();
      const user = await auth.getUser();
      
      alert(
        `Auth test results:\n\n` +
        `Session exists: ${session ? 'Yes' : 'No'}\n` +
        `User logged in: ${user ? 'Yes' : 'No'}\n` +
        `User email: ${user?.email || 'Not logged in'}\n` +
        `Supabase URL: ${supabase.supabaseUrl}\n` +
        `Key available: ${supabase.supabaseKey ? 'Yes' : 'No'}`
      );
    } catch (err) {
      alert(`Auth test error: ${err.message}`);
    }
  };
  
  // Test direct API connection
  const testDirectConnection = async () => {
    try {
      setIsConnectionTesting(true);
      
      // Get the URL and key from the client
      const url = supabase.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      const key = supabase.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Missing Supabase URL or key');
      }
      
      // Test the connection directly
      const testUrl = `${url}/rest/v1/roles?select=*&limit=5`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}: ${errorText}`);
      }
      
      const data = await response.json();
      
      setConnectionTestResult({
        success: true,
        data,
        details: {
          url: testUrl,
          status: response.status,
          recordCount: Array.isArray(data) ? data.length : 'Not an array',
          firstRecord: data && data[0] ? JSON.stringify(data[0]) : 'No data'
        }
      });
    } catch (err) {
      console.error('API connection test failed:', err);
      setConnectionTestResult({
        success: false,
        error: err,
        details: {
          message: err.message,
          name: err.name
        }
      });
    } finally {
      setIsConnectionTesting(false);
    }
  };
  
  // Clear all tokens and local storage data
  const clearTokens = () => {
    try {
      // Clear all Supabase tokens
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase_auth_token');
      localStorage.removeItem('sb-ysljpqtpbpugekhrdocq-auth-token');
      
      // Also try to sign out
      auth.signOut()
        .then(() => {
          alert('Auth tokens cleared');
          // Refresh the page to apply changes
          window.location.reload();
        })
        .catch(err => {
          console.error('Error signing out:', err);
          alert(`Tokens cleared, but sign out failed: ${err.message}`);
        });
    } catch (err) {
      alert(`Error clearing tokens: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Environment Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Supabase Client Status</h2>
        <div style={{ 
          padding: '10px', 
          backgroundColor: clientStatus.includes('ERROR') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px'
        }}>
          <p><strong>{clientStatus}</strong></p>
          
          <button 
            onClick={testAuth} 
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              marginRight: '10px'
            }}
          >
            Test Authentication
          </button>
          
          <button 
            onClick={testDirectConnection} 
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              marginRight: '10px'
            }}
            disabled={isConnectionTesting}
          >
            {isConnectionTesting ? 'Testing...' : 'Test API Connection'}
          </button>
          
          <button 
            onClick={clearTokens} 
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Clear All Tokens
          </button>
        </div>
        
        {connectionTestResult && (
          <div style={{ 
            marginTop: '15px',
            padding: '10px', 
            backgroundColor: connectionTestResult.success ? '#e8f5e9' : '#ffebee',
            borderRadius: '4px'
          }}>
            <h3>API Connection Test Result</h3>
            <p><strong>Status:</strong> {connectionTestResult.success ? 'Success ✓' : 'Failed ✗'}</p>
            
            {connectionTestResult.details && (
              <div>
                <p><strong>Details:</strong></p>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(connectionTestResult.details, null, 2)}
                </pre>
              </div>
            )}
            
            {connectionTestResult.error && (
              <div>
                <p><strong>Error:</strong></p>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  color: '#f44336'
                }}>
                  {connectionTestResult.error.message || JSON.stringify(connectionTestResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <h3>VITE_SUPABASE_URL:</h3>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            overflow: 'auto' 
          }}>
            {import.meta.env.VITE_SUPABASE_URL || 'Not defined'}
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <h3>VITE_SUPABASE_ANON_KEY:</h3>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontFamily: 'monospace' 
          }}>
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined (hidden for security)' : 'Not defined'}
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <h3>VITE_ENV:</h3>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontFamily: 'monospace' 
          }}>
            {import.meta.env.VITE_ENV || 'Not defined'}
          </div>
        </div>
      </div>
      
      <div>
        <h2>All VITE_ Environment Variables</h2>
        <button 
          onClick={() => setShowFull(!showFull)}
          style={{
            backgroundColor: '#e0e0e0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showFull ? 'Hide' : 'Show'} Full Details
        </button>
        
        {showFull && (
          <pre style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(envVars, null, 2)}
          </pre>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          textDecoration: 'none',
          marginRight: '10px',
          display: 'inline-block'
        }}>
          Go to Login
        </a>
        
        <a href="/" style={{
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Go to Home
        </a>
      </div>
    </div>
  );
} 