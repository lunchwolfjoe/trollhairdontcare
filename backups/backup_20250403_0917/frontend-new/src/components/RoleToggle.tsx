import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface RoleToggleProps {
  currentRole: 'coordinator' | 'volunteer';
  onRoleChange: (role: 'coordinator' | 'volunteer') => void;
}

const RoleToggle: React.FC<RoleToggleProps> = ({ currentRole, onRoleChange }) => {
  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Button
        variant="contained"
        color={currentRole === 'coordinator' ? 'primary' : 'secondary'}
        onClick={() => onRoleChange(currentRole === 'coordinator' ? 'volunteer' : 'coordinator')}
      >
        Switch to {currentRole === 'coordinator' ? 'Volunteer' : 'Coordinator'}
      </Button>
    </Box>
  );
};

export default RoleToggle; 