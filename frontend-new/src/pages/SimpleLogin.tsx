import React, { useState } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { Box, Button, Container, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { forceRefreshSession, testApi, supabase } from '../lib/supabaseClient';

export const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signIn, loading, error: authError } = useSimpleAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!email) {
      setLocalError('Email is required');
      return;
    }
    
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    
    try {
      console.log('Attempting login with:', email);
      const success = await signIn(email, password);
      
      if (success) {
        console.log('Login successful, redirecting...');
        navigate('/');
      } else {
        console.log('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An unexpected error occurred');
    }
  };

  const handleDebugFunctions = async () => {
    try {
      // Reset localstorage auth data
      localStorage.removeItem('supabase_auth_token');
      localStorage.removeItem('supabase.auth.token');
      
      // Force clear session using the imported client
      await supabase.auth.signOut();
      
      // Attempt to test API connection
      const result = await testApi();
      
      // Show results
      alert(
        `Debug functions executed:\n\n` +
        `Auth tokens cleared.\n` +
        `API test result: ${result.error ? 'Failed' : 'Success'}\n` +
        `Please try logging in again.`
      );
    } catch (err) {
      console.error('Debug function error:', err);
      alert(`Error during debug: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {(localError || authError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || authError}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleDebugFunctions}
            fullWidth
            sx={{ mt: 2 }}
          >
            Fix API Connection
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 