import React, { useState, useEffect } from 'react';
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
  Link,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

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

export const SimpleLogin: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, authenticated, loading, error, mockSignIn } = useSimpleAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  // Show auth context errors
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setLocalError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await signIn(email, password);
    } catch (err: any) {
      // Error is handled in the context and shown via the error effect
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(null);

    if (!fullName) {
      setLocalError('Please enter your full name');
      return;
    }

    try {
      await signUp(email, password, { full_name: fullName });
      
      setSuccess('Account created successfully! Check your email for confirmation (if applicable) and log in.');
      setTabValue(0);
      
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err: any) {
      // Error is handled in the context and shown via the error effect
    }
  };

  // Bypass login with mock roles
  const handleBypass = (role: string) => {
    mockSignIn(role);
    navigate('/');
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

          {localError && (
            <Box sx={{ px: 3, pt: 3 }}>
              <Alert severity="error">{localError}</Alert>
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
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
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
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
          </TabPanel>
        </Paper>

        {/* Quick access options for testing */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Quick Access for Testing
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Volunteer
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => handleBypass('volunteer')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Coordinator
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => handleBypass('coordinator')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => handleBypass('admin')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 