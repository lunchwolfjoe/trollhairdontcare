import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../contexts/AuthContext';

const RoleSwitcher: React.FC = () => {
  const { activeRole, setActiveRole, roles, hasRole, isDevelopment } = useAuth();
  const theme = useTheme();

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: Role | null,
  ) => {
    if (newRole !== null) {
      setActiveRole(newRole);
    }
  };

  // Don't render if user has no roles or only one role
  if (!roles.length || roles.length === 1) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <Paper elevation={3} sx={{ p: 1 }}>
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Active Role
          </Typography>
        </Box>
        <ToggleButtonGroup
          color="primary"
          value={activeRole}
          exclusive
          onChange={handleRoleChange}
          aria-label="role switcher"
          size="small"
        >
          {hasRole('volunteer') && (
            <ToggleButton 
              value="volunteer"
              sx={{ 
                backgroundColor: activeRole === 'volunteer' ? theme.palette.primary.main : 'inherit',
                color: activeRole === 'volunteer' ? 'white' : 'inherit',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white',
                }
              }}
            >
              Volunteer
            </ToggleButton>
          )}
          {hasRole('coordinator') && (
            <ToggleButton 
              value="coordinator"
              sx={{ 
                backgroundColor: activeRole === 'coordinator' ? theme.palette.primary.main : 'inherit',
                color: activeRole === 'coordinator' ? 'white' : 'inherit',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white',
                }
              }}
            >
              Coordinator
            </ToggleButton>
          )}
          {hasRole('admin') && (
            <ToggleButton 
              value="admin"
              sx={{ 
                backgroundColor: activeRole === 'admin' ? theme.palette.primary.main : 'inherit',
                color: activeRole === 'admin' ? 'white' : 'inherit',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white',
                }
              }}
            >
              Admin
            </ToggleButton>
          )}
        </ToggleButtonGroup>
        
        {/* Dev Tools Link */}
        {isDevelopment && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <RouterLink 
              to="/dev-tools"
              style={{ 
                fontSize: '0.7rem', 
                color: theme.palette.text.secondary,
                textDecoration: 'none',
              }}
            >
              Dev Tools
            </RouterLink>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export { RoleSwitcher }; 
