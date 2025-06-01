import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper, Typography, useTheme, Menu, MenuItem, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

// Define role type for simplicity
type Role = 'admin' | 'coordinator' | 'volunteer';

const RoleSwitcher: React.FC = () => {
  const { user, activeRole, setActiveRole } = useSimpleAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Check if user has a role
  const hasRole = (role: Role): boolean => {
    return user?.roles.includes(role) || false;
  };
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleRoleSelect = (role: Role) => {
    // Set the active role
    setActiveRole(role);
    
    // Navigate to the appropriate dashboard based on selected role
    switch(role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'coordinator':
        navigate('/coordinator/dashboard');
        break;
      case 'volunteer':
        navigate('/volunteer/dashboard');
        break;
    }
    handleClose();
  };

  // Don't render if user has no roles or only one role
  if (!user?.roles.length || user.roles.length === 1) {
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
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          sx={{ 
            textTransform: 'none', 
            minWidth: '120px' 
          }}
        >
          {activeRole ? `Current: ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}` : 'Switch Role'}
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {hasRole('admin') && (
            <MenuItem 
              onClick={() => handleRoleSelect('admin')}
              selected={activeRole === 'admin'}
            >
              Admin
            </MenuItem>
          )}
          {hasRole('coordinator') && (
            <MenuItem 
              onClick={() => handleRoleSelect('coordinator')}
              selected={activeRole === 'coordinator'}
            >
              Coordinator
            </MenuItem>
          )}
          {hasRole('volunteer') && (
            <MenuItem 
              onClick={() => handleRoleSelect('volunteer')}
              selected={activeRole === 'volunteer'}
            >
              Volunteer
            </MenuItem>
          )}
        </Menu>
      </Paper>
    </Box>
  );
};

export { RoleSwitcher }; 
