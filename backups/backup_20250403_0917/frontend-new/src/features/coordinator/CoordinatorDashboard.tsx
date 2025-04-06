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
  ListItemIcon,
  Divider,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  SwapHoriz as SwapIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

// Mock data
const mockStatistics = {
  totalVolunteers: 24,
  activeVolunteers: 20,
  totalTasks: 45,
  completedTasks: 32,
  pendingSwapRequests: 5,
  upcomingEvents: 3,
};

const mockTaskProgress = {
  setup: 75,
  registration: 50,
  cleanup: 20,
  information: 90,
};

const mockRecentActivities = [
  { id: 1, type: 'task', action: 'New task assigned to Mike Peterson', timestamp: '1 hour ago' },
  { id: 2, type: 'swap', action: 'Shift swap request approved', timestamp: '3 hours ago', users: 'Jamie Lee and Alex Smith' },
  { id: 3, type: 'volunteer', action: 'New volunteer joined: Sarah Johnson', timestamp: '1 day ago' },
  { id: 4, type: 'event', action: 'New event created: Summer Festival', timestamp: '2 days ago' },
  { id: 5, type: 'task', action: 'Task marked as completed', timestamp: '2 days ago', task: 'Registration Setup' },
];

const CoordinatorDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Coordinator Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <PeopleIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockStatistics.totalVolunteers}</Typography>
            <Typography variant="body2">Total Volunteers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <TaskIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockStatistics.completedTasks}/{mockStatistics.totalTasks}</Typography>
            <Typography variant="body2">Tasks Completed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <SwapIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockStatistics.pendingSwapRequests}</Typography>
            <Typography variant="body2">Pending Swap Requests</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Task Progress" />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Setup</Typography>
                  <Typography variant="body2">{mockTaskProgress.setup}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockTaskProgress.setup} 
                  color="primary"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Registration</Typography>
                  <Typography variant="body2">{mockTaskProgress.registration}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockTaskProgress.registration} 
                  color="secondary"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Cleanup</Typography>
                  <Typography variant="body2">{mockTaskProgress.cleanup}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockTaskProgress.cleanup} 
                  color="warning"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Information</Typography>
                  <Typography variant="body2">{mockTaskProgress.information}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={mockTaskProgress.information} 
                  color="success"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Activities" 
              action={
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => {}}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              <List>
                {mockRecentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'task' ? (
                          <TaskIcon color="primary" />
                        ) : activity.type === 'swap' ? (
                          <SwapIcon color="warning" />
                        ) : activity.type === 'volunteer' ? (
                          <PeopleIcon color="secondary" />
                        ) : activity.type === 'event' ? (
                          <EventIcon color="info" />
                        ) : (
                          <WarningIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.action}
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                    {index < mockRecentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CoordinatorDashboard; 