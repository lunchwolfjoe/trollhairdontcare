import { useEffect, useState } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setConnectionStatus(`Error: ${error.message}`);
          setDetails({ error: error.message, code: error.status });
        } else {
          setConnectionStatus('✅ Connection successful!');
          setDetails({ 
            session: data.session ? 'Found' : 'No session',
            user: data.session?.user?.email || 'No user'
          });
        }
      } catch (err) {
        setConnectionStatus(`❌ Connection failed: ${err}`);
        setDetails({ error: String(err) });
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc',
      padding: '15px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h4>🔗 Supabase Connection Test</h4>
      <p><strong>Status:</strong> {connectionStatus}</p>
      <hr />
      <p><strong>URL:</strong> {supabaseUrl}</p>
      <p><strong>Key:</strong> {supabaseAnonKey.substring(0, 20)}...</p>
      {Object.keys(details).length > 0 && (
        <>
          <hr />
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px' }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
} 