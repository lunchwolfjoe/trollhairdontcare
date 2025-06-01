import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export const BypassAuth: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Temporary Auth Bypass
      </Typography>
      <Typography variant="body1" paragraph>
        Use these links to bypass authentication (temporary testing only)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Volunteer View</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Access volunteer-specific pages and functionality
              </Typography>
              <Button 
                component={Link} 
                to="/bypass/volunteer/dashboard" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                Enter as Volunteer
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Coordinator View</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Access coordinator management tools and features
              </Typography>
              <Button 
                component={Link} 
                to="/bypass/coordinator/dashboard" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                Enter as Coordinator
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Admin View</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Access administrative functions and system settings
              </Typography>
              <Button 
                component={Link} 
                to="/bypass/admin/dashboard" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                Enter as Admin
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
        Note: This bypass is for testing purposes only. No data will be saved to your account.
      </Typography>
    </Box>
  );
}; 