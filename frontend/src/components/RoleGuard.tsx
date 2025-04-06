import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page. This area is restricted to{' '}
            {allowedRoles.join(' or ')} roles.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ minWidth: 200 }}
          >
            Go Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
} 
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page. This area is restricted to{' '}
            {allowedRoles.join(' or ')} roles.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ minWidth: 200 }}
          >
            Go Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
} 
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page. This area is restricted to{' '}
            {allowedRoles.join(' or ')} roles.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ minWidth: 200 }}
          >
            Go Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
} 