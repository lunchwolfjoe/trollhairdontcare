import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Tabs, 
  Tab, 
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
  };
}

export const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signin, signup, authenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signin(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      } else {
        // Let the useEffect handle redirect
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!fullName) {
      setError('Please enter your full name');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signup(email, password, fullName);
      
      if (!result.success) {
        setError(result.error || 'Signup failed');
      } else {
        if (result.error) {
          // This is a success message for email confirmation
          setSuccess(result.error);
        } else {
          setSuccess('Account created successfully! You can now log in.');
          // Switch to login tab
          setTabValue(0);
        }
        
        // Clear signup form
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 8,
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          TrollHair Don't Care
        </Typography>
        <Typography 
          variant="h6" 
          gutterBottom 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          Festival Volunteer Management
        </Typography>

        <Paper elevation={3} sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="auth tabs"
              variant="fullWidth"
            >
              <Tab label="Login" {...a11yProps(0)} />
              <Tab label="Sign Up" {...a11yProps(1)} />
            </Tabs>
          </Box>

          {error && (
            <Box sx={{ px: 3, pt: 3 }}>
              <Alert severity="error">{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</Alert>
            </Box>
          )}

          {success && (
            <Box sx={{ px: 3, pt: 3 }}>
              <Alert severity="success">{success}</Alert>
            </Box>
          )}

          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleLogin} sx={{ px: 3 }}>
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
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleSignup} sx={{ px: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email-signup"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password-signup"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
          </TabPanel>

          {/* Development Tools Link */}
          {isDevelopment && (
            <Box sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Development Mode: 
                <Link component={RouterLink} to="/dev-tools" sx={{ ml: 1 }}>
                  Create Test Users
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Having trouble signing in? 
            <RouterLink to="/test-connection" style={{ marginLeft: '8px' }}>
              Test Connection
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 
