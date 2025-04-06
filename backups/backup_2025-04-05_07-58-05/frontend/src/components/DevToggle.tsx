import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function DevToggle() {
  const { role, setDevRole } = useAuth();

  const handleRoleChange = (event: any) => {
    setDevRole?.(event.target.value);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Development Controls
        </Typography>
        <FormControl fullWidth size="small" sx={{ minWidth: 120, mb: 1 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={role || ''}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="coordinator">Coordinator</MenuItem>
            <MenuItem value="volunteer">Volunteer</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
} 
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function DevToggle() {
  const { role, setDevRole } = useAuth();

  const handleRoleChange = (event: any) => {
    setDevRole?.(event.target.value);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Development Controls
        </Typography>
        <FormControl fullWidth size="small" sx={{ minWidth: 120, mb: 1 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={role || ''}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="coordinator">Coordinator</MenuItem>
            <MenuItem value="volunteer">Volunteer</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
} 
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function DevToggle() {
  const { role, setDevRole } = useAuth();

  const handleRoleChange = (event: any) => {
    setDevRole?.(event.target.value);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Development Controls
        </Typography>
        <FormControl fullWidth size="small" sx={{ minWidth: 120, mb: 1 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={role || ''}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="coordinator">Coordinator</MenuItem>
            <MenuItem value="volunteer">Volunteer</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
} 