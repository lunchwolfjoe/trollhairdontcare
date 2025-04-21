import { useEffect, useState } from 'react';

function DebugEnv() {
  const [envVars, setEnvVars] = useState({});
  const [localStorageKeys, setLocalStorageKeys] = useState({});

  useEffect(() => {
    // Get all env variables starting with VITE_
    const viteVars = {};
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        viteVars[key] = import.meta.env[key];
      }
    });
    setEnvVars(viteVars);

    // Get localStorage keys
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        storage[key] = localStorage.getItem(key);
      } catch (e) {
        storage[key] = 'Error reading value';
      }
    }
    setLocalStorageKeys(storage);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px', maxWidth: '800px' }}>
      <h2>Environment Debug</h2>
      
      <h3>Environment Variables</h3>
      <div style={{ marginBottom: '20px' }}>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Not defined'}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined (hidden for security)' : 'Not defined'}</p>
        <p>VITE_ENV: {import.meta.env.VITE_ENV || 'Not defined'}</p>
      </div>

      <h3>All VITE_ Environment Variables</h3>
      <pre style={{ background: '#eee', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>

      <h3>LocalStorage Keys</h3>
      <pre style={{ background: '#eee', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(localStorageKeys, null, 2)}
      </pre>
    </div>
  );
}

export default DebugEnv; 