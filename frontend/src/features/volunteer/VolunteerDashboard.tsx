import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  Button,
  Link,
} from '@mui/material';
import { NotificationBell } from '../../components/NotificationBell';
import { NotificationSettings } from '../../components/NotificationSettings';

const VolunteerDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Volunteer Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationBell />
          <Button
            component={Link}
            href="/settings/notifications"
            variant="outlined"
            color="primary"
          >
            Notification Settings
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Coming Soon: Enhanced Notification Features
        </Typography>
        <Typography variant="body2">
          We're working on implementing email and SMS notifications. These features will be available soon to help you stay connected with your team and receive important updates in real-time.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Existing dashboard content */}
        // ... existing code ...
      </Grid>
    </Box>
  );
};

export default VolunteerDashboard; 