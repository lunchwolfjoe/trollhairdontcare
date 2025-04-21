import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Environment debug component that shows all environment variables and checks Supabase initialization
export default function DebugEnv() {
  const [clientStatus, setClientStatus] = useState('Checking...');
  const [envVars, setEnvVars] = useState({});
  const [showFull, setShowFull] = useState(false);
  
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
    } catch (err) {
      setClientStatus(`ERROR: ${err.message}`);
    }
  }, []);

  // Test auth methods
  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      alert(
        `Auth test results:\n\n` +
        `Session exists: ${data && data.session ? 'Yes' : 'No'}\n` +
        `Error: ${error ? error.message : 'None'}\n` +
        `Supabase URL: ${supabase.supabaseUrl}\n` +
        `Key available: ${supabase.supabaseKey ? 'Yes' : 'No'}`
      );
    } catch (err) {
      alert(`Auth test error: ${err.message}`);
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
              marginTop: '10px'
            }}
          >
            Test Authentication
          </button>
        </div>
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
    </div>
  );
} 