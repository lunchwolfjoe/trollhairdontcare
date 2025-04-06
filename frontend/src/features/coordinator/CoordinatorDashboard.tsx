import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Link,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { NotificationBell } from '../../components/NotificationBell';
import { NotificationSettings } from '../../components/NotificationSettings';

const CoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Volunteer Management',
      description: 'View and manage volunteers, their profiles, and availability',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/coordinator/volunteers',
      color: '#1976d2',
    },
    {
      title: 'Task Management',
      description: 'Create, assign, and track tasks for volunteers',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/coordinator/tasks',
      color: '#2e7d32',
    },
    {
      title: 'Task Statistics',
      description: 'View task completion rates and performance metrics',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      path: '/coordinator/task-stats',
      color: '#ed6c02',
    },
    {
      title: 'Schedule Management',
      description: 'Create and manage volunteer schedules and shifts',
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      path: '/coordinator/schedule',
      color: '#9c27b0',
    },
    {
      title: 'Reports',
      description: 'Generate and view reports on volunteer activities',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/coordinator/reports',
      color: '#d32f2f',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Coordinator Dashboard
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
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: `${item.color}15`,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { color: item.color } })}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {item.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(item.path)}
                  sx={{ ml: 1, mb: 1 }}
                >
                  Go to {item.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CoordinatorDashboard; 