import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useAuth();

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: 'coordinator' | 'volunteer' | 'admin' | null,
  ) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

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
        <ToggleButtonGroup
          color="primary"
          value={role}
          exclusive
          onChange={handleRoleChange}
          aria-label="role switcher"
          size="small"
        >
          <ToggleButton value="volunteer">Volunteer</ToggleButton>
          <ToggleButton value="coordinator">Coordinator</ToggleButton>
          <ToggleButton value="admin">Admin</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
};

export default RoleSwitcher; 