import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AuthDebugger from '../components/debug/AuthDebugger';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear any previous errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const toggleDebugger = () => {
    setShowDebugger(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(credentials.email, credentials.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Enhanced error logging
      if (err.error && err.error.message) {
        console.error('Supabase error details:', err.error);
      }
      if (err.status) {
        console.error('HTTP status:', err.status);
      }
      if (err.code) {
        console.error('Error code:', err.code);
      }
      if (err.details) {
        console.error('Error details:', err.details);
      }
      
      // Display more user-friendly error messages
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before logging in.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            TrollHair Festival Management
          </Typography>
          
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
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
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Button
              type="button"
              fullWidth
              variant="text"
              onClick={toggleDebugger}
              sx={{ mt: 1 }}
            >
              {showDebugger ? 'Hide Debug Tools' : 'Show Debug Tools'}
            </Button>
          </Box>
        </Paper>
        
        {showDebugger && <AuthDebugger />}
      </Box>
    </Container>
  );
};

export default Login; 