import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

// Mock data
const mockStats = {
  totalVolunteers: 42,
  activeVolunteers: 36,
  totalCoordinators: 8,
  totalTasks: 156,
  completedTasks: 103,
  upcomingEvents: 5,
};

const mockRecentActivity = [
  { id: 1, type: 'user', action: 'New volunteer registered', timestamp: '1 hour ago', user: 'Sarah Johnson' },
  { id: 2, type: 'task', action: 'Task completed', timestamp: '3 hours ago', task: 'Event Setup', user: 'Mike Peterson' },
  { id: 3, type: 'shift', action: 'Shift swap approved', timestamp: '5 hours ago', users: 'Alex Smith and Jamie Lee' },
  { id: 4, type: 'task', action: 'New task assigned', timestamp: '1 day ago', task: 'Check-in Desk', coordinator: 'Rachel Green' },
  { id: 5, type: 'user', action: 'Volunteer role updated', timestamp: '2 days ago', user: 'Chris Evans' },
];

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Card>
                <CardHeader title="Active Users" />
                <CardContent>
                  <Typography variant="h4">24</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Festival Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Card>
                <CardHeader title="Upcoming Festivals" />
                <CardContent>
                  <Typography variant="h4">3</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 