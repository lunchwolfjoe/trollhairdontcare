import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Alert } from '@mui/material';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

const SupabaseDebugger: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [userRolesResult, setUserRolesResult] = useState<any>(null);
  const [troubleshootResults, setTroubleshootResults] = useState<any>(null);
  const [troubleshootLoading, setTroubleshootLoading] = useState(false);
  
  const { troubleshootAuth } = useSimpleAuth();

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

    // Check Supabase session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase Session Check:', { data, error });
        setSessionInfo({ data, error });
        
        // If we have a user, test user_roles query
        if (data?.session?.user?.id) {
          const userId = data.session.user.id;
          try {
            const { data: rolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('role_id, roles(name)')
              .eq('user_id', userId);
            
            console.log('User roles query:', { rolesData, rolesError });
            setUserRolesResult({ data: rolesData, error: rolesError });
          } catch (rolesErr) {
            console.error('Error querying user roles:', rolesErr);
            setUserRolesResult({ error: rolesErr });
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setSessionInfo({ error: err });
      }
    };

    // Run basic test query
    const testQuery = async () => {
      try {
        const { data, error, status } = await supabase
          .from('festivals')
          .select('*')
          .limit(1);
          
        console.log('Test query result:', { data, error, status });
        setTestResult({ data, error, status });
      } catch (err) {
        console.error('Test query error:', err);
        setTestResult({ error: err });
      }
    };

    checkSession();
    testQuery();
  }, []);

  const toggleVisibility = () => setVisible(!visible);
  
  const runForcedTests = async () => {
    try {
      // Direct test using hardcoded API key
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || supabase.supabaseUrl}/rest/v1/festivals?select=*&limit=1`,
        {
          method: 'GET',
          headers: {
            'apikey': supabase.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${supabase.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      alert(`Direct API test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nStatus: ${response.status}\nData: ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (err) {
      alert(`Direct API test FAILED with exception: ${err.message}`);
    }
  };
  
  const runTroubleshoot = async () => {
    setTroubleshootLoading(true);
    try {
      const results = await troubleshootAuth();
      setTroubleshootResults(results);
    } catch (err) {
      console.error("Error running troubleshoot:", err);
      alert(`Troubleshooting failed: ${err.message}`);
    } finally {
      setTroubleshootLoading(false);
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

        <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={runForcedTests}
            sx={{ flexGrow: 1 }}
          >
            Run API Test
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={runTroubleshoot}
            disabled={troubleshootLoading}
            sx={{ flexGrow: 1 }}
          >
            Troubleshoot Auth
          </Button>
        </Box>
        
        {troubleshootResults && (
          <>
            <Alert severity={
              troubleshootResults.tokenTest?.apiKey?.ok ? "success" : "error"
            } sx={{ mb: 2 }}>
              API access: {troubleshootResults.tokenTest?.apiKey?.ok ? "OK" : "FAILED"} - 
              Session: {troubleshootResults.sessionCheck?.hasSession ? "ACTIVE" : "NONE"} - 
              User: {troubleshootResults.userQuery?.hasUser ? "FOUND" : "NONE"}
            </Alert>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Troubleshooting Results:
            </Typography>
            
            <Box sx={{ 
              maxHeight: '100px', 
              overflow: 'auto',
              mb: 2,
              p: 1,
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 1
            }}>
              {JSON.stringify(troubleshootResults, null, 2)}
            </Box>
            
            <Typography variant="caption">
              Full results in console
            </Typography>
            
            <Divider sx={{ my: 1 }} />
          </>
        )}

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
        
        <Typography variant="subtitle1">Session</Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Status" 
              secondary={
                sessionInfo?.data?.session 
                  ? "Active ✓" 
                  : sessionInfo?.error 
                    ? "Error ✗" 
                    : "Not authenticated ✗"
              }
              secondaryTypographyProps={{ 
                color: sessionInfo?.data?.session ? 'success.main' : 'error'
              }}
            />
          </ListItem>
          {sessionInfo?.data?.session?.user && (
            <ListItem>
              <ListItemText 
                primary="User ID" 
                secondary={sessionInfo.data.session.user.id}
              />
            </ListItem>
          )}
          {sessionInfo?.data?.session?.access_token && (
            <ListItem>
              <ListItemText 
                primary="Token (preview)" 
                secondary={`${sessionInfo.data.session.access_token.substring(0, 15)}...`}
              />
            </ListItem>
          )}
          {sessionInfo?.error && (
            <ListItem>
              <ListItemText 
                primary="Error" 
                secondary={sessionInfo.error.message || JSON.stringify(sessionInfo.error)}
                secondaryTypographyProps={{ color: 'error' }}
              />
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 1 }} />
        
        <Typography variant="subtitle1">User Roles</Typography>
        <List dense>
          {userRolesResult?.data && userRolesResult.data.length > 0 ? (
            userRolesResult.data.map((role: any, index: number) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`Role ${index + 1}`} 
                  secondary={role.roles?.name || role.role_id || 'Unknown role'}
                />
              </ListItem>
            ))
          ) : userRolesResult?.error ? (
            <ListItem>
              <ListItemText 
                primary="Error fetching roles" 
                secondary={userRolesResult.error.message || JSON.stringify(userRolesResult.error)}
                secondaryTypographyProps={{ color: 'error' }}
              />
            </ListItem>
          ) : (
            <ListItem>
              <ListItemText secondary="No roles found or not authenticated" />
            </ListItem>
          )}
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
                secondary={`${testResult.data.length} records`}
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default SupabaseDebugger; 