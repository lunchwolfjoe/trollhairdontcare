import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Alert, Chip } from '@mui/material';
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
  const [deploymentType, setDeploymentType] = useState<string>("unknown");
  
  const { authenticated, user, signOut } = useSimpleAuth();

  useEffect(() => {
    // Detect environment
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && !hostname.includes('127.0.0.1');
    const isPreviewing = hostname.includes('vercel') && hostname.includes('preview');
    
    setDeploymentType(
      isProduction 
        ? (isPreviewing ? "vercel-preview" : "production") 
        : "development"
    );
    
    // Log environment variables
    const envData = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 15) + '...' : null,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      MODE: import.meta.env.MODE,
      HOSTNAME: hostname,
      PROTOCOL: window.location.protocol,
      IS_SECURE: window.location.protocol === 'https:'
    };
    
    console.log('Environment Information:', envData);
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
    
    // Get current auth session info
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          setSessionInfo({ error: error.message });
        } else {
          setSessionInfo(data.session ? { 
            expires_at: data.session.expires_at,
            token: data.session.access_token ? data.session.access_token.substring(0, 15) + '...' : null,
            refresh_token: data.session.refresh_token ? '(present)' : '(missing)',
            user_id: data.session.user?.id
          } : { message: 'No active session' });
        }
      } catch (err) {
        console.error('Session check exception:', err);
        setSessionInfo({ error: 'Failed to check session' });
      }
    };

    checkSession();
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
      
      // Get the session directly from Supabase client
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session retrieval error:', sessionError);
        alert(`Error retrieving session: ${sessionError.message}`);
        setIsRefreshing(false);
        return;
      }
      
      if (!sessionData.session) {
        // No session found - check localStorage for any tokens
        const tokens = Object.keys(localStorage)
          .filter(key => key.includes('auth') || key.includes('supabase'))
          .map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 10) || 'null'}...`);
        
        alert(`No active Supabase session found. \n\nFound related localStorage items: ${tokens.join(', ') || 'none'}`);
        setIsRefreshing(false);
        return;
      }
      
      // We have a session
      const token = sessionData.session.access_token;
      console.log('Session found with token length:', token.length);
      console.log('Token preview:', token.substring(0, 20) + '...');
      
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
        const errorText = await response.text();
        console.error('Token validation error:', response.status, response.statusText, errorText);
        alert(`Auth token test failed: ${response.status} ${response.statusText}\n${errorText}`);
        setIsRefreshing(false);
        return;
      }
      
      const userData = await response.json();
      alert(`Auth token is valid! User ID: ${userData.id}`);
      
      // Update session info
      setSessionInfo({ 
        expires_at: sessionData.session.expires_at,
        token: token.substring(0, 15) + '...',
        refresh_token: sessionData.session.refresh_token ? '(present)' : '(missing)',
        user_id: sessionData.session.user?.id
      });
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
      localStorage.removeItem('local_auth_token');
      localStorage.removeItem('supabase.auth.token');
      
      // Also try to clear any other auth-related keys
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear cookies if possible
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      });
      
      alert("All auth data cleared. Reloading page...");
      window.location.href = '/login';
    } catch (err) {
      console.error('Force logout error:', err);
      alert(`Error during force logout: ${err.message}`);
    }
  };
  
  // Force a complete auth state refresh by clearing caches and reloading
  const forceAuthRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Check if we have a token stored
      const token = localStorage.getItem('local_auth_token');
      
      if (!token) {
        alert('No auth token found to refresh. Try logging in first.');
        setIsRefreshing(false);
        return;
      }
      
      // First try to get a fresh session from Supabase
      await supabase.auth.refreshSession();
      
      // Then reload the page to force a complete reset
      alert('Auth session refreshed. Reloading page to apply changes...');
      window.location.reload();
    } catch (err) {
      console.error('Force refresh error:', err);
      alert(`Error during force refresh: ${err.message}`);
      setIsRefreshing(false);
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
        
        <Chip 
          label={`Environment: ${deploymentType}`} 
          color={deploymentType === "production" ? "primary" : deploymentType === "vercel-preview" ? "warning" : "default"}
          sx={{ mb: 2 }}
        />

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
            color="warning"
            onClick={forceAuthRefresh}
            disabled={isRefreshing}
            sx={{ flexGrow: 1 }}
          >
            Force Refresh
          </Button>
          
          <Button 
            variant="contained" 
            color="error"
            onClick={forceCleanLogout}
            sx={{ flexGrow: 1 }}
          >
            Force Logout
          </Button>
        </Box>
        
        {sessionInfo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Session Info:
            </Typography>
            <Box sx={{ 
              p: 1, 
              backgroundColor: sessionInfo.user_id ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
              borderRadius: 1,
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              maxHeight: '80px',
              overflow: 'auto'
            }}>
              {JSON.stringify(sessionInfo, null, 2)}
            </Box>
          </Box>
        )}
        
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
                secondary={value !== null ? String(value) : '(not set)'} 
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