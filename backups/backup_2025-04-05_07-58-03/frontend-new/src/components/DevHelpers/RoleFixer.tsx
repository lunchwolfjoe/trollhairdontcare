import React, { useState } from 'react';
import { 
  Button, 
  Paper, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider
} from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

export const RoleFixer: React.FC = () => {
  const { user, roles, activeRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({
    volunteer: roles.includes('volunteer'),
    coordinator: roles.includes('coordinator'),
    admin: roles.includes('admin')
  });

  const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

  if (!isDevelopment) {
    return null; // Don't render in production
  }

  if (!user) {
    return (
      <Paper elevation={3} sx={{ p: 3, my: 2, maxWidth: '600px', mx: 'auto' }}>
        <Typography variant="body1" color="error">
          You must be logged in to use this tool.
        </Typography>
      </Paper>
    );
  }

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRoles({
      ...selectedRoles,
      [event.target.name]: event.target.checked
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // Get role IDs for each role
      const rolePromises = Object.entries(selectedRoles)
        .filter(([_, selected]) => selected)
        .map(async ([roleName]) => {
          const { data, error } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleName)
            .single();
            
          if (error) throw new Error(`Role not found: ${roleName}`);
          return data.id;
        });
        
      const roleIds = await Promise.all(rolePromises);
      
      // Remove existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw new Error(`Failed to clear existing roles: ${deleteError.message}`);
      
      // Add new roles
      const rolesToInsert = roleIds.map(roleId => ({
        user_id: user.id,
        role_id: roleId
      }));
      
      if (rolesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);
          
        if (insertError) throw new Error(`Failed to add roles: ${insertError.message}`);
      }
      
      setResult({
        success: true,
        message: 'Roles updated successfully! Reload the page to see changes.'
      });
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
        Dev Helper: Fix User Roles
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" paragraph>
        Current User: {user.email}
      </Typography>
      
      <Typography variant="body2" paragraph>
        Current Roles: {roles.length > 0 ? roles.join(', ') : 'None'}
      </Typography>
      
      <Typography variant="body2" paragraph>
        Active Role: {activeRole || 'None'}
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select Roles:
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedRoles.volunteer} 
                onChange={handleRoleChange} 
                name="volunteer" 
              />
            }
            label="Volunteer"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedRoles.coordinator} 
                onChange={handleRoleChange} 
                name="coordinator" 
              />
            }
            label="Coordinator"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedRoles.admin} 
                onChange={handleRoleChange} 
                name="admin" 
              />
            }
            label="Admin"
          />
        </FormGroup>
      </Box>
      
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isLoading || Object.values(selectedRoles).every(v => !v)}
        fullWidth
        sx={{ mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Update Roles'}
      </Button>
      
      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
    </Paper>
  );
}; 
