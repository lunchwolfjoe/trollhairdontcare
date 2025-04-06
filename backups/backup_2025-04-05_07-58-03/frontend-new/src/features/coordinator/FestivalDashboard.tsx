import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { festivalService, volunteerService } from '../../lib/services';
import { Festival } from '../../lib/types/models';

interface FestivalStats {
  totalVolunteers: number;
  pendingVolunteers: number;
  approvedVolunteers: number;
  totalCrews: number;
  assignedVolunteers: number;
  totalShifts: number;
  assignedShifts: number;
  upcomingShifts: number;
}

const FestivalDashboard: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [stats, setStats] = useState<FestivalStats>({
    totalVolunteers: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
    totalCrews: 0,
    assignedVolunteers: 0,
    totalShifts: 0,
    assignedShifts: 0,
    upcomingShifts: 0,
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (festivalId) {
      // Validate UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(festivalId)) {
        console.log('Valid festival ID from params:', festivalId);
        
        // Store the current festival ID in localStorage
        localStorage.setItem('currentFestivalId', festivalId);
      } else {
        console.warn('Invalid festival ID format:', festivalId);
      }
    } else {
      console.warn('No festival ID provided in URL params');
    }
  }, [festivalId]);

  useEffect(() => {
    const fetchFestival = async () => {
      if (!festivalId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch festival details
        const { data: festivalData, error: festivalError } = await festivalService.getFestivalById(festivalId);
        
        if (festivalError) {
          throw new Error(`Failed to fetch festival: ${festivalError.message}`);
        }
        
        if (!festivalData) {
          throw new Error('Festival not found');
        }
        
        setFestival(festivalData);
        
        // Fetch festival stats
        const [
          { data: volunteerStats },
          { data: crewStats },
          { data: shiftStats },
        ] = await Promise.all([
          volunteerService.countByStatus(festivalId),
          festivalService.getCrewStats(festivalId),
          festivalService.getShiftStats(festivalId),
        ]);
        
        setStats({
          totalVolunteers: volunteerStats?.reduce((sum, stat) => sum + stat.count, 0) || 0,
          pendingVolunteers: volunteerStats?.find(s => s.status === 'pending')?.count || 0,
          approvedVolunteers: volunteerStats?.find(s => s.status === 'approved')?.count || 0,
          totalCrews: crewStats?.totalCrews || 0,
          assignedVolunteers: crewStats?.assignedVolunteers || 0,
          totalShifts: shiftStats?.totalShifts || 0,
          assignedShifts: shiftStats?.assignedShifts || 0,
          upcomingShifts: shiftStats?.upcomingShifts || 0,
        });
      } catch (err: any) {
        console.error('Error fetching festival details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestival();
  }, [festivalId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days left for the festival
  const calculateDaysLeft = (endDate: string) => {
    try {
      const end = new Date(endDate);
      const today = new Date();
      
      // Check if date is valid
      if (isNaN(end.getTime())) {
        return 0;
      }
      
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (err) {
      console.error('Error calculating days left:', err);
      return 0;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/coordinator/festivals"
            startIcon={<ArrowBackIcon />}
          >
            Back to Festivals
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!festival) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Alert severity="warning">
            Festival not found
          </Alert>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/coordinator/festivals"
            sx={{ mt: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Back to Festivals
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/coordinator/festivals"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Festivals
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {festival.name}
                <Chip 
                  label={festival.status.charAt(0).toUpperCase() + festival.status.slice(1)}
                  color={
                    festival.status === 'active' ? 'success' :
                    festival.status === 'planning' ? 'warning' :
                    festival.status === 'completed' ? 'default' :
                    'error'
                  }
                  size="small"
                  sx={{ ml: 2, verticalAlign: 'middle' }}
                />
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
                  {' '}
                  ({calculateDaysLeft(festival.end_date)} days left)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  {festival.location || 'Location not specified'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Button
                variant="contained"
                component={RouterLink}
                to={`/coordinator/festivals/${festival.id}/settings`}
                sx={{ ml: 1 }}
              >
                Edit Festival
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Volunteers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h4">
                      {stats.totalVolunteers}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stats.approvedVolunteers} approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Pending Applications
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h4">
                      {stats.pendingVolunteers}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Crews
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h4">
                      {stats.totalCrews}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stats.assignedVolunteers} volunteers assigned
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Shifts
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h4">
                      {stats.assignedShifts}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{stats.totalShifts}
                      </Typography>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stats.upcomingShifts} upcoming shifts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Volunteers" />
              <Tab label="Schedule" />
              <Tab label="Tasks" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Festival Description</Typography>
                <Typography paragraph>
                  {festival.description || 'No description available for this festival.'}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`/coordinator/festivals/${festival.id}/volunteers`}
                      startIcon={<GroupIcon />}
                      sx={{ mb: 2 }}
                    >
                      Manage Volunteers
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`/coordinator/festivals/${festival.id}/schedule`}
                      startIcon={<ScheduleIcon />}
                      sx={{ mb: 2 }}
                    >
                      View Schedule
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`/coordinator/festivals/${festival.id}/assets`}
                      startIcon={<InventoryIcon />}
                      sx={{ mb: 2 }}
                    >
                      Manage Assets
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`/coordinator/festivals/${festival.id}/asset-map`}
                      startIcon={<MapIcon />}
                      sx={{ mb: 2 }}
                    >
                      Asset Map
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/coordinator/festivals/${festival.id}/volunteers`}
                  startIcon={<GroupIcon />}
                >
                  Go to Volunteer Management
                </Button>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/coordinator/festivals/${festival.id}/schedule`}
                  startIcon={<ScheduleIcon />}
                >
                  Go to Schedule
                </Button>
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/coordinator/tasks`}
                  startIcon={<AssignmentIcon />}
                >
                  Go to Task Management
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export { FestivalDashboard }; 
