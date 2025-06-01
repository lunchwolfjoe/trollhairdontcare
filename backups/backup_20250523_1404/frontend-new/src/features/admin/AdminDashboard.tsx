import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
  PeopleAlt as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
  Forum as MessageIcon,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

// Mock chart component (in a real app, you'd use a library like recharts or chart.js)
const MockBarChart = ({ data, height = 200 }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'flex-end', gap: 2, px: 1 }}>
      {data.map((item, index) => (
        <Box 
          key={index} 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              height: `${(item.value / maxValue) * 100}%`, 
              width: '80%',
              bgcolor: item.color || theme.palette.primary.main,
              minHeight: 20,
              borderRadius: 1,
              transition: 'height 0.5s',
              position: 'relative',
              '&:hover': {
                opacity: 0.9,
                cursor: 'pointer',
              },
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Mock donut chart
const MockDonutChart = ({ percentage, size = 120, color = 'primary', label }) => {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || color;
  
  return (
    <Box sx={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={5}
        sx={{ color: theme.palette.grey[200], position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={size}
        thickness={5}
        sx={{ color: colorValue, position: 'absolute' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" component="div" color="text.primary">
          {percentage}%
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Mock data
const mockStats = {
  totalUsers: 156,
  totalVolunteers: 124,
  totalCoordinators: 28,
  totalAdmins: 4,
  activeVolunteers: 98,
  pendingApproval: 12,
  totalTasks: 156,
  completedTasks: 103,
  upcomingEvents: 3,
  messagesSent: 528,
  volunteersCheckedIn: 45,
  systemHealth: 98,
};

const mockMonthlyStats = [
  { label: 'Jan', value: 42, color: '#8884d8' },
  { label: 'Feb', value: 63, color: '#8884d8' },
  { label: 'Mar', value: 28, color: '#8884d8' },
  { label: 'Apr', value: 80, color: '#8884d8' },
  { label: 'May', value: 45, color: '#8884d8' },
  { label: 'Jun', value: 90, color: '#8884d8' },
];

const mockRecentActivity = [
  { id: 1, type: 'user', action: 'New volunteer registered', timestamp: '1 hour ago', user: 'Sarah Johnson' },
  { id: 2, type: 'task', action: 'Task completed', timestamp: '3 hours ago', task: 'Event Setup', user: 'Mike Peterson' },
  { id: 3, type: 'shift', action: 'Shift swap approved', timestamp: '5 hours ago', users: 'Alex Smith and Jamie Lee' },
  { id: 4, type: 'task', action: 'New task assigned', timestamp: '1 day ago', task: 'Check-in Desk', coordinator: 'Rachel Green' },
  { id: 5, type: 'user', action: 'Volunteer role updated', timestamp: '2 days ago', user: 'Chris Evans' },
];

const mockUpcomingFestivals = [
  { id: 1, name: 'Kerrville Folk Festival 2025', dates: 'May 23 - June 12, 2025', volunteers: 87, status: 'Planning' },
  { id: 2, name: 'Summer Music Series', dates: 'July 15 - August 20, 2025', volunteers: 42, status: 'Recruiting' },
  { id: 3, name: 'Hill Country Jazz Festival', dates: 'September 5-7, 2025', volunteers: 24, status: 'Planning' },
];

const mockSystemAlerts = [
  { id: 1, type: 'warning', message: 'Database backup scheduled for tonight at 2 AM', timestamp: '3 hours ago' },
  { id: 2, type: 'info', message: 'New system update available', timestamp: '1 day ago' },
  { id: 3, type: 'error', message: 'Payment gateway connection issue resolved', timestamp: '2 days ago' },
];

const getActivityIcon = (type) => {
  switch (type) {
    case 'user': return <PersonIcon color="primary" />;
    case 'task': return <AssignmentIcon color="success" />;
    case 'shift': return <CalendarIcon color="secondary" />;
    case 'warning': return <WarningIcon color="warning" />;
    case 'info': return <NotificationsIcon color="info" />;
    case 'error': return <WarningIcon color="error" />;
    default: return <DashboardIcon />;
  }
};

const getAlertColor = (type) => {
  switch (type) {
    case 'warning': return 'warning';
    case 'info': return 'info';
    case 'error': return 'error';
    default: return 'default';
  }
};

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [error, setError] = useState<string | null>(null);
  const [festivals, setFestivals] = useState(mockUpcomingFestivals);

  // In a real app, you would fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get festivals
        const { data: festivalsData, error: festivalsError } = await supabase
          .from('festivals')
          .select('*')
          .order('start_date', { ascending: true })
          .limit(5);
        
        if (festivalsError) {
          console.error('Error fetching festivals:', festivalsError);
        } else if (festivalsData) {
          // Use real data if available
          // Otherwise we'll continue using mock data
          console.log('Festivals data:', festivalsData);
        }
        
        // For now, just simulate a loading state
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Overview Section */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3, 
                backgroundImage: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6">Total Users</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip label={`${stats.totalVolunteers} Volunteers`} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label={`${stats.totalCoordinators} Coordinators`} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label={`${stats.totalAdmins} Admins`} size="small" sx={{ mb: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3, 
                backgroundImage: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Typography variant="h6">Festival Status</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                    {stats.upcomingEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Festivals
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="caption">
                      Next festival in 24 days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3, 
                backgroundImage: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="h6">Tasks</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                    {stats.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {stats.totalTasks} tasks completed
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.completedTasks / stats.totalTasks) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3, 
                backgroundImage: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <SettingsIcon />
                    </Avatar>
                    <Typography variant="h6">System Status</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                    <MockDonutChart 
                      percentage={stats.systemHealth} 
                      color="secondary"
                      label="Health"
                      size={80}
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Chip label="Database: OK" size="small" color="success" />
                    <Chip label="API: Active" size="small" color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Volunteer Growth Chart */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardHeader 
                  title="Volunteer Growth" 
                  subheader="Monthly registration statistics"
                  action={
                    <IconButton>
                      <MoreIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 250, p: 2 }}>
                    <MockBarChart data={mockMonthlyStats} height={200} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Festivals */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardHeader 
                  title="Upcoming Festivals" 
                  action={
                    <Button 
                      startIcon={<AddIcon />} 
                      variant="contained" 
                      size="small"
                      component={Link}
                      to="/admin/festivals"
                    >
                      New Festival
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {festivals.map((festival, index) => (
                      <React.Fragment key={festival.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              component={Link} 
                              to={`/admin/festivals/${festival.id}`}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <EventIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={festival.name}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {festival.dates}
                                </Typography>
                                {` — ${festival.volunteers} volunteers, ${festival.status}`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        {index < festivals.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Side Content */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* System Alerts */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardHeader 
                  title="System Alerts" 
                  action={
                    <IconButton>
                      <MoreIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {mockSystemAlerts.map((alert, index) => (
                      <React.Fragment key={alert.id}>
                        <ListItem>
                          <ListItemIcon>
                            {getActivityIcon(alert.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label={alert.type} 
                                  size="small" 
                                  color={getAlertColor(alert.type)}
                                  sx={{ mr: 1, textTransform: 'capitalize' }}
                                />
                                <Typography variant="caption">{alert.timestamp}</Typography>
                              </Box>
                            }
                            secondary={alert.message}
                          />
                        </ListItem>
                        {index < mockSystemAlerts.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Activity Feed */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardHeader 
                  title="Recent Activity" 
                  action={
                    <Button 
                      endIcon={<ArrowForwardIcon />} 
                      color="primary"
                      size="small"
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {mockRecentActivity.slice(0, 4).map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem>
                          <ListItemIcon>
                            {getActivityIcon(activity.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.action}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {activity.user || activity.users || activity.coordinator}
                                </Typography>
                                {` — ${activity.timestamp}`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        {index < 3 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardHeader title="Quick Actions" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <CardActionArea 
                        component={Link} 
                        to="/admin/festivals"
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: '0.3s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
                          <EventIcon />
                        </Avatar>
                        <Typography variant="body2" align="center">
                          Manage Festivals
                        </Typography>
                      </CardActionArea>
                    </Grid>
                    <Grid item xs={6}>
                      <CardActionArea 
                        component={Link} 
                        to="/admin/users"
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: '0.3s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'secondary.main', mb: 1 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2" align="center">
                          Manage Users
                        </Typography>
                      </CardActionArea>
                    </Grid>
                    <Grid item xs={6}>
                      <CardActionArea 
                        component={Link} 
                        to="/admin/settings"
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: '0.3s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'warning.main', mb: 1 }}>
                          <SettingsIcon />
                        </Avatar>
                        <Typography variant="body2" align="center">
                          System Settings
                        </Typography>
                      </CardActionArea>
                    </Grid>
                    <Grid item xs={6}>
                      <CardActionArea 
                        component={Link} 
                        to="/coordinator/dashboard"
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: '0.3s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'info.main', mb: 1 }}>
                          <SupervisorAccountIcon />
                        </Avatar>
                        <Typography variant="body2" align="center">
                          Coordinator View
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export { AdminDashboard }; 
