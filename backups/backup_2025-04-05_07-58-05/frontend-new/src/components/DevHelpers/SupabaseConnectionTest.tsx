import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, Alert, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const SupabaseConnectionTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [healthCheck, setHealthCheck] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Supabase client:', supabase);
      
      // Log query builder to help with debugging
      console.log('Query builder:', supabase.from('users'));
      
      // Test connection with a simple health check query
      try {
        const { data, error } = await supabase
          .from('health_check')
          .select('*')
          .limit(1);
        
        if (error) {
          // If health_check doesn't exist, try a different table
          console.warn('Health check table not found, trying users table');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          if (userError) {
            // If we still get an error with users, try profiles
            console.warn('Users table check failed, trying profiles table');
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
              
            if (profileError) {
              throw new Error(`Failed to connect to any table: ${profileError.message}`);
            } else {
              setQueryResult(profileData || []);
              setIsConnected(true);
              console.log('Query result:', profileData);
            }
          } else {
            setQueryResult(userData || []);
            setIsConnected(true);
            console.log('Query result:', userData);
          }
        } else {
          setQueryResult(data || []);
          setIsConnected(true);
          console.log('Query result:', data);
        }
      } catch (err) {
        console.error('Error testing connection:', err);
        setIsConnected(false);
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
      
      // Get health check info
      try {
        const response = await fetch(`${supabase.supabaseUrl}/health`, {
          headers: {
            'apikey': supabase.supabaseKey
          }
        });
        
        if (response.ok) {
          const healthData = await response.json();
          setHealthCheck(healthData);
        }
      } catch (healthErr) {
        console.warn('Could not fetch health check data:', healthErr);
      }
      
      console.log('Supabase connection successful');
    } catch (err) {
      console.error('Error initializing test:', err);
      setIsConnected(false);
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Supabase Connection Test
      </Typography>
      
      {isConnected === null ? (
        <Typography>Testing connection...</Typography>
      ) : isConnected ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Connected to Supabase successfully!
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Connection Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="URL" 
                secondary={supabase.supabaseUrl} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Key (first 12 chars)" 
                secondary={supabase.supabaseKey.substring(0, 12) + '...'} 
              />
            </ListItem>
            {healthCheck && (
              <ListItem>
                <ListItemText 
                  primary="Database Status" 
                  secondary={healthCheck.db_status === 'alive' ? 'Online' : 'Unknown'} 
                />
              </ListItem>
            )}
          </List>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Query Result
          </Typography>
          {queryResult.length > 0 ? (
            <Box 
              component="pre" 
              sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1, 
                overflow: 'auto',
                maxHeight: '150px'
              }}
            >
              {JSON.stringify(queryResult, null, 2)}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No data returned, but connection was successful.
            </Typography>
          )}
          
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={testConnection}
          >
            Test Again
          </Button>
        </Box>
      ) : (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to connect to Supabase
          </Alert>
          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error: {errorMessage}
            </Typography>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testConnection}
          >
            Retry Connection
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SupabaseConnectionTest; 