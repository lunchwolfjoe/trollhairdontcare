import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../hooks/useAuth';

export const AccessDenied: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="md">
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
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            borderRadius: 2, 
            padding: 4,
            textAlign: 'center'
          }}
        >
          <LockIcon 
            color="error" 
            sx={{ 
              fontSize: 80, 
              mb: 2 
            }} 
          />
          
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom 
            sx={{ fontWeight: 'bold', color: 'error.main' }}
          >
            Access Denied
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph 
            color="text.secondary"
          >
            You don't have permission to access this page.
          </Typography>
          
          {user && (
            <Typography 
              variant="body2" 
              paragraph 
              color="text.secondary"
            >
              Your current roles don't grant you access to this resource. If you believe this is an error, please contact your administrator.
            </Typography>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              color="primary"
            >
              Go to Home
            </Button>
            
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="outlined"
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 
