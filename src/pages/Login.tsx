import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { login, register, clearError } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { status, error, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(register({ email, password }));
    } else {
      dispatch(login({ email, password }));
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    if (error) dispatch(clearError());
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            TrollHairDontCare
          </Typography>
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Festival Management
          </Typography>
          <Typography variant="h6" align="center" sx={{ mt: 2, mb: 3 }}>
            {isRegister ? 'Create an account' : 'Sign in to your account'}
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
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <CircularProgress size={24} />
              ) : isRegister ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component="button" variant="body2" onClick={toggleMode}>
                  {isRegister
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 