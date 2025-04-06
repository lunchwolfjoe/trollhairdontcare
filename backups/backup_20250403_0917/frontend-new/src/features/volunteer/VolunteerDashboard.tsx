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
} from '@mui/material';
import {
  AssignmentTurnedIn as CompletedIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Mock data
const mockUpcomingShifts = [
  { id: 1, title: 'Registration Desk', date: '2023-07-10', time: '8:00 AM - 12:00 PM', location: 'Main Entrance' },
  { id: 2, title: 'Information Booth', date: '2023-07-12', time: '1:00 PM - 5:00 PM', location: 'Event Hall' },
  { id: 3, title: 'Setup Assistance', date: '2023-07-15', time: '7:00 AM - 11:00 AM', location: 'Outdoor Arena' },
];

const mockTaskStatistics = {
  total: 12,
  completed: 5,
  inProgress: 3,
  pending: 4,
};

const mockRecentTasks = [
  { id: 1, title: 'Distribute Flyers', status: 'completed', completedAt: '2023-07-05' },
  { id: 2, title: 'Setup Check-in Table', status: 'in-progress', startedAt: '2023-07-06' },
  { id: 3, title: 'Train New Volunteers', status: 'pending', dueDate: '2023-07-11' },
];

const VolunteerDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Volunteer Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Task Statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <TaskIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockTaskStatistics.total}</Typography>
            <Typography variant="body2">Total Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <CompletedIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockTaskStatistics.completed}</Typography>
            <Typography variant="body2">Completed Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <RefreshIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockTaskStatistics.inProgress}</Typography>
            <Typography variant="body2">In-Progress Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ScheduleIcon color="warning" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5">{mockTaskStatistics.pending}</Typography>
            <Typography variant="body2">Pending Tasks</Typography>
          </Paper>
        </Grid>
        
        {/* Upcoming Shifts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Upcoming Shifts" 
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
                {mockUpcomingShifts.map((shift, index) => (
                  <React.Fragment key={shift.id}>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={shift.title}
                        secondary={`${shift.date} | ${shift.time} | ${shift.location}`}
                      />
                    </ListItem>
                    {index < mockUpcomingShifts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Tasks" 
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
                {mockRecentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem>
                      <ListItemIcon>
                        {task.status === 'completed' ? (
                          <CheckCircleIcon color="success" />
                        ) : task.status === 'in-progress' ? (
                          <RefreshIcon color="info" />
                        ) : (
                          <ScheduleIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title}
                        secondary={
                          task.status === 'completed' 
                            ? `Completed on ${task.completedAt}` 
                            : task.status === 'in-progress'
                            ? `Started on ${task.startedAt}`
                            : `Due on ${task.dueDate}`
                        }
                      />
                    </ListItem>
                    {index < mockRecentTasks.length - 1 && <Divider />}
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

export default VolunteerDashboard; 