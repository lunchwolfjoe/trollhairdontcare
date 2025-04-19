import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Alert } from '@mui/material';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

const SUPABASE_URL = "https://ysljpqtpbpugekhrdocq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c";

const SupabaseDebugger: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [userRolesResult, setUserRolesResult] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [directTestResult, setDirectTestResult] = useState<any>(null);
  
  const { authenticated, user, signOut } = useSimpleAuth();

  useEffect(() => {
    // Log environment variables
    const envData = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 15) + '...' : null,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      MODE: import.meta.env.MODE
    };
    
    console.log('Environment Variables:', envData);
    setEnvInfo(envData);

    // Run basic test query
    const testQuery = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/festivals?select=*&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        setTestResult({ 
          ok: response.ok,
          status: response.status,
          data: data
        });
      } catch (err) {
        console.error('Test query error:', err);
        setTestResult({ error: err });
      }
    };

    testQuery();
  }, []);

  const toggleVisibility = () => setVisible(!visible);
  
  // Direct test of API connection
  const runDirectTest = async () => {
    try {
      setDirectTestResult({ loading: true });
      
      // Test direct API access
      const response = await fetch(`${SUPABASE_URL}/rest/v1/festivals?select=*&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        setDirectTestResult({
          ok: false,
          status: response.status,
          statusText: response.statusText
        });
        alert(`API test failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      setDirectTestResult({
        ok: true,
        status: response.status,
        dataCount: Array.isArray(data) ? data.length : 'not array',
        data: data
      });
      
      alert(`API test successful! Retrieved ${Array.isArray(data) ? data.length : 0} records.`);
    } catch (err) {
      console.error('Direct API test error:', err);
      setDirectTestResult({ error: err.message });
      alert(`API test failed with error: ${err.message}`);
    }
  };
  
  // Check auth token
  const checkAuthToken = async () => {
    try {
      setIsRefreshing(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        alert('No auth token found in localStorage');
        return;
      }
      
      // Test token with API
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        alert(`Auth token test failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      const userData = await response.json();
      alert(`Auth token is valid! User ID: ${userData.id}`);
    } catch (err) {
      console.error('Token test error:', err);
      alert(`Token test failed with error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const forceCleanLogout = async () => {
    try {
      // First sign out from auth context
      await signOut();
      
      // Then clear any tokens that might be in localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('supabase_auth_token');
      
      // Also try to clear any other auth-related keys
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      alert("All auth data cleared. Reloading page...");
      window.location.href = '/login';
    } catch (err) {
      console.error('Force logout error:', err);
      alert(`Error during force logout: ${err.message}`);
    }
  };

  if (!visible) {
    // Just show a small button in the corner when collapsed
    return (
      <Button 
        variant="contained" 
        color="secondary" 
        size="small"
        onClick={toggleVisibility}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 9999,
          opacity: 0.8
        }}
      >
        Show Supabase Debug
      </Button>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        p: 2,
        opacity: 0.9
      }}
    >
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Supabase Debug Info</Typography>
          <Button variant="outlined" size="small" onClick={toggleVisibility}>
            Hide
          </Button>
        </Box>

        <Alert severity={authenticated ? "success" : "error"} sx={{ mb: 2 }}>
          Auth Status: {authenticated ? "Authenticated ✓" : "Not Authenticated ✗"}
        </Alert>

        <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={runDirectTest}
            sx={{ flexGrow: 1 }}
          >
            Test API
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={checkAuthToken}
            disabled={isRefreshing}
            sx={{ flexGrow: 1 }}
          >
            Check Token
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3, gap: 1 }}>
          <Button 
            variant="contained" 
            color="error"
            onClick={forceCleanLogout}
            sx={{ flexGrow: 1 }}
          >
            Force Logout
          </Button>
        </Box>
        
        {directTestResult && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              API Test Result:
            </Typography>
            <Box sx={{ 
              p: 1, 
              backgroundColor: directTestResult.ok ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
              borderRadius: 1,
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              maxHeight: '80px',
              overflow: 'auto'
            }}>
              {JSON.stringify(directTestResult, null, 2)}
            </Box>
          </Box>
        )}

        <Typography variant="subtitle1">Current User</Typography>
        <List dense>
          {user ? (
            <>
              <ListItem>
                <ListItemText primary="ID" secondary={user.id} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Name" secondary={user.full_name || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Roles" 
                  secondary={user.roles?.join(', ') || 'None'} 
                />
              </ListItem>
            </>
          ) : (
            <ListItem>
              <ListItemText secondary="No user authenticated" />
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 1 }} />
        
        <Typography variant="subtitle1">Environment</Typography>
        <List dense>
          {Object.entries(envInfo).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText 
                primary={key} 
                secondary={value !== null ? value : '(not set)'} 
                secondaryTypographyProps={{ 
                  color: value ? 'text.primary' : 'error'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />
        
        <Typography variant="subtitle1">Test Query</Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Status" 
              secondary={
                testResult?.data ? "Success ✓" : "Failed ✗"
              }
              secondaryTypographyProps={{ 
                color: testResult?.data ? 'success.main' : 'error'
              }}
            />
          </ListItem>
          {testResult?.error && (
            <ListItem>
              <ListItemText 
                primary="Error" 
                secondary={testResult.error.message || JSON.stringify(testResult.error)}
                secondaryTypographyProps={{ color: 'error' }}
              />
            </ListItem>
          )}
          {testResult?.data && (
            <ListItem>
              <ListItemText 
                primary="Data Preview" 
                secondary={`${Array.isArray(testResult.data) ? testResult.data.length : 0} records`}
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default SupabaseDebugger; 