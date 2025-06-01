import { useState, useEffect } from 'react';
import supabase, { testConnection } from '../lib/supabaseClient';

function SupabaseTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const runTest = async () => {
      setLoading(true);
      try {
        const result = await testConnection();
        setTestResult(result);
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error testing connection:', error);
        setTestResult({ success: false, error });
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  const runManualTest = async () => {
    setLoading(true);
    try {
      // Test with explicit API key in headers
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/festivals?select=*&limit=1`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      console.log('Manual fetch response:', data);
      setTestResult({ success: response.ok, data, statusCode: response.status });
      if (response.ok) {
        setData(data);
      }
    } catch (error) {
      console.error('Error with manual test:', error);
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Supabase Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables</h3>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p>VITE_USE_MOCK_DATA: {import.meta.env.VITE_USE_MOCK_DATA}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={runManualTest}
          style={{ padding: '8px 16px', backgroundColor: '#3ecf8e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Run Manual Test
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h3>Test Result</h3>
          <p>Status: {testResult?.success ? '✅ Success' : '❌ Failed'}</p>
          {testResult?.statusCode && <p>Status Code: {testResult.statusCode}</p>}
          
          {testResult?.error && (
            <div style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
              <h4>Error:</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            </div>
          )}

          {data && (
            <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
              <h4>Data:</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SupabaseTest; 