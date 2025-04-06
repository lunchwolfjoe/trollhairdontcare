import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Avatar,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Group as GroupIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  WbSunny as WbSunnyIcon,
  MusicNote as MusicNoteIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { volunteerService, festivalService } from '../../lib/services';
import { Festival, Volunteer } from '../../lib/types/models';

// Dashboard loading state interface
interface DashboardState {
  loading: boolean;
  error: string | null;
  festivals: Festival[];
  activeFestival: Festival | null;
  volunteerStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentVolunteers: Volunteer[];
}

const CoordinatorDashboard: React.FC = () => {
  const theme = useTheme();
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    festivals: [],
    activeFestival: null,
    volunteerStats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    recentVolunteers: []
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Get active festivals
        const { data: festivalsData, error: festivalsError } = await festivalService.getActiveFestivals();
        
        if (festivalsError) {
          throw new Error(`Failed to fetch festivals: ${festivalsError.message}`);
        }

        const festivals = festivalsData || [];
        const activeFestival = festivals.length > 0 ? festivals[0] : null;

        // If we have an active festival, fetch volunteer data
        let volunteerStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
        let recentVolunteers: Volunteer[] = [];

        if (activeFestival) {
          // Get volunteer statistics
          const { data: statsData, error: statsError } = await volunteerService.countByStatus(activeFestival.id);
          
          if (statsError) {
            console.error('Failed to fetch volunteer stats:', statsError);
          } else if (statsData) {
            // Process the stats data
            let total = 0;
            statsData.forEach(stat => {
              total += stat.count;
              if (stat.status === 'pending') volunteerStats.pending = stat.count;
              if (stat.status === 'approved') volunteerStats.approved = stat.count;
              if (stat.status === 'rejected') volunteerStats.rejected = stat.count;
            });
            volunteerStats.total = total;
          }

          // Get recent volunteers
          const { data: volunteersData, error: volunteersError } = await volunteerService.getVolunteers(
            { festival_id: activeFestival.id },
            { page: 1, pageSize: 5 }
          );
          
          if (volunteersError) {
            console.error('Failed to fetch volunteers:', volunteersError);
          } else {
            recentVolunteers = volunteersData || [];
          }
        }

        setState({
          loading: false,
          error: null,
          festivals,
          activeFestival,
          volunteerStats,
          recentVolunteers
        });
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate days left for the festival
  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get dashboard stats based on current state
  const getStats = () => {
    const daysLeft = state.activeFestival 
      ? calculateDaysLeft(state.activeFestival.end_date)
      : 0;

    return [
      { 
        label: 'Volunteers', 
        value: state.volunteerStats.total, 
        icon: <GroupIcon sx={{ color: theme.palette.primary.main }} /> 
      },
      { 
        label: 'Pending', 
        value: state.volunteerStats.pending, 
        icon: <AssignmentIcon sx={{ color: theme.palette.warning.main }} /> 
      },
      { 
        label: 'Approved', 
        value: state.volunteerStats.approved, 
        icon: <AssignmentIcon sx={{ color: theme.palette.success.main }} /> 
      },
      { 
        label: 'Days Left', 
        value: daysLeft, 
        icon: <EventIcon sx={{ color: theme.palette.primary.main }} /> 
      },
    ];
  };

  // Handle loading state
  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle error state
  if (state.error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {state.error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Handle no active festivals
  if (!state.activeFestival) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          There are no active festivals at the moment.
        </Alert>
        <Button 
          variant="contained" 
          component={RouterLink}
          to="/admin/festivals"
        >
          Manage Festivals
        </Button>
      </Box>
    );
  }

  const stats = getStats();
  const festival = state.activeFestival;

  return (
    <Box>
      {/* Hero banner with festival styling */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          backgroundImage: 'linear-gradient(45deg, rgba(230, 97, 103, 0.05) 25%, transparent 25%, transparent 50%, rgba(230, 97, 103, 0.05) 50%, rgba(230, 97, 103, 0.05) 75%, transparent 75%, transparent)',
          backgroundSize: '20px 20px',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                color: theme.palette.primary.main,
                fontFamily: 'Oswald, Arial, sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {festival.name}
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2, fontFamily: 'Sofia Sans, Arial, sans-serif' }}>
              {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
            </Typography>
            <Typography variant="body1" paragraph>
              {festival.description || 'This coordinator portal gives you all the tools you need to manage volunteers, schedule shifts, and ensure the festival runs smoothly.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                component={RouterLink}
                to="/coordinator/volunteers"
                className="folk-button"
                startIcon={<GroupIcon />}
              >
                Manage Volunteers
              </Button>
              <Button 
                variant="outlined"
                component={RouterLink}
                to="/coordinator/scheduler"
                startIcon={<ScheduleIcon />}
                sx={{ 
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: 'rgba(230, 97, 103, 0.05)',
                  }
                }}
              >
                View Schedule
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img"
              src="/kerrville_logo.png"
              alt="Folk Festival Logo"
              sx={{ 
                maxWidth: '100%',
                maxHeight: 200,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' },
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stats overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card 
              className="folk-card"
              sx={{ 
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography 
                  variant="h3" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main content */}
      <Grid container spacing={4}>
        {/* Quick actions */}
        <Grid item xs={12} md={4}>
          <Paper 
            className="accent-border" 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontFamily: 'Oswald, Arial, sans-serif',
                fontWeight: 600,
              }}
            >
              <MusicNoteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ '& > button': { mb: 2, width: '100%', justifyContent: 'flex-start', py: 1.5 } }}>
              <Button 
                startIcon={<EventIcon />}
                variant="outlined"
                component={RouterLink}
                to="/coordinator/festivals"
                sx={{ borderRadius: 2 }}
              >
                Manage Festivals
              </Button>
              <Button 
                startIcon={<GroupIcon />}
                variant="outlined"
                component={RouterLink}
                to="/coordinator/volunteers"
                sx={{ borderRadius: 2 }}
              >
                Manage Volunteers
              </Button>
              <Button 
                startIcon={<AssignmentIcon />}
                variant="outlined"
                component={RouterLink}
                to="/coordinator/tasks"
                sx={{ borderRadius: 2 }}
              >
                Manage Tasks
              </Button>
              <Button 
                startIcon={<ScheduleIcon />}
                variant="outlined"
                component={RouterLink}
                to="/coordinator/scheduler"
                sx={{ borderRadius: 2 }}
              >
                Generate Schedule
              </Button>
              <Button 
                startIcon={<WbSunnyIcon />}
                variant="outlined"
                component={RouterLink}
                to="/coordinator/weather"
                sx={{ borderRadius: 2 }}
              >
                Check Weather
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent volunteers */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontFamily: 'Oswald, Arial, sans-serif',
                fontWeight: 600,
              }}
            >
              <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Recent Volunteer Applications
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {state.recentVolunteers.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                No volunteer applications yet.
              </Typography>
            ) : (
              <Box sx={{ '& > div': { mb: 2 } }}>
                {state.recentVolunteers.map((volunteer) => {
                  // Extract profile data safely
                  const profile = volunteer.profiles || {};
                  const fullName = profile.full_name || 'Unknown Volunteer';
                  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
                  
                  // Determine the chip color based on application status
                  const statusColors: Record<string, any> = {
                    'pending': { color: 'warning', label: 'Pending Review' },
                    'approved': { color: 'success', label: 'Approved' },
                    'rejected': { color: 'error', label: 'Rejected' }
                  };
                  const statusInfo = statusColors[volunteer.application_status] || statusColors.pending;
                  
                  return (
                    <Box 
                      key={volunteer.id} 
                      sx={{ 
                        mb: 2, 
                        pb: 2, 
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{fullName}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Applied on {formatDate(volunteer.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={statusInfo.label} 
                        color={statusInfo.color} 
                        size="small"
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            <Button 
              endIcon={<ArrowForwardIcon />} 
              component={RouterLink}
              to="/coordinator/volunteers"
              sx={{ 
                mt: 1,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(230, 97, 103, 0.05)',
                }
              }}
            >
              View All Volunteers
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export { CoordinatorDashboard }; 
