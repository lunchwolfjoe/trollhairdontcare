import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Paper, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { authService } from '../../lib/services';

const DEFAULT_EMAILS = [
  'volunteer@test.com',
  'coordinator@test.com',
  'admin@test.com'
];

const DEFAULT_PASSWORD = 'Password123!';

export const CreateTestUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [fullName, setFullName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    userId?: string;
  } | null>(null);

  const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

  if (!isDevelopment) {
    return null; // Don't render in production
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await authService.createTestUser(email, password, fullName);
      
      if (error) {
        setResult({
          success: false,
          message: error.message
        });
      } else if (data) {
        setResult({
          success: true,
          message: `Test user created successfully! User ID: ${data.user.id}`,
          userId: data.user.id
        });
      } else {
        setResult({
          success: false,
          message: 'Unknown error occurred'
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultUser = async (defaultEmail: string) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const role = defaultEmail.split('@')[0];
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
      
      const { data, error } = await authService.createTestUser(
        defaultEmail, 
        DEFAULT_PASSWORD, 
        `Test ${formattedRole}`
      );
      
      if (error) {
        setResult({
          success: false,
          message: error.message
        });
      } else if (data) {
        setResult({
          success: true,
          message: `${formattedRole} test user created successfully! User ID: ${data.user.id}`,
          userId: data.user.id
        });
      } else {
        setResult({
          success: false,
          message: 'Unknown error occurred'
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2, maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Dev Helper: Create Test User
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This tool will create a test user with automatic email confirmation.
        Only available in development mode.
      </Typography>
      
      <Divider sx={{ my: 2 }}>
        <Chip label="Quick Create" />
      </Divider>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {DEFAULT_EMAILS.map(defaultEmail => (
          <Button 
            key={defaultEmail}
            variant="outlined"
            onClick={() => createDefaultUser(defaultEmail)}
            disabled={isLoading}
            size="small"
          >
            Create {defaultEmail.split('@')[0]}
          </Button>
        ))}
      </Box>
      
      <Divider sx={{ my: 2 }}>
        <Chip label="Custom User" />
      </Divider>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="fullName"
          label="Full Name"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Test User'}
        </Button>
      </Box>
      
      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Default password: {DEFAULT_PASSWORD}
        </Typography>
      </Box>
    </Paper>
  );
}; 
