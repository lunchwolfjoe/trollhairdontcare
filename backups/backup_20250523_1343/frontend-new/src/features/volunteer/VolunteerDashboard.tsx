import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Alert,
} from '@mui/material';
import {
  AssignmentTurnedIn as CompletedIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Announcement as AnnouncementIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { festivalService } from '../../lib/services';

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

// Add this interface for announcements
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  important: boolean;
}

export const VolunteerDashboard: React.FC = () => {
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnnouncements = async () => {
      try {
        setLoading(true);
        
        // Fetch active festivals first
        const { data: festivalData } = await festivalService.getActiveFestivals();
        
        if (festivalData && festivalData.length > 0) {
          // Get recent announcements for the first active festival
          const festivalId = festivalData[0].id;
          
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('festival_id', festivalId)
            .eq('message_type', 'announcement')
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (error) {
            console.error('Error fetching announcements:', error);
            return;
          }
          
          if (data && data.length > 0) {
            const formattedAnnouncements: Announcement[] = data.map(msg => ({
              id: msg.id,
              title: msg.title || 'Announcement',
              content: msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : ''),
              createdAt: msg.created_at,
              important: msg.important || false
            }));
            
            setRecentAnnouncements(formattedAnnouncements);
          }
        }
      } catch (err) {
        console.error('Error in fetchRecentAnnouncements:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentAnnouncements();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        
        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Announcements" 
              action={
                <Button 
                  variant="text" 
                  color="primary"
                  component={Link}
                  to="/volunteer/communications"
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {recentAnnouncements.length > 0 ? (
                <List>
                  {recentAnnouncements.map((announcement, index) => (
                    <React.Fragment key={announcement.id}>
                      <ListItem>
                        <ListItemIcon>
                          <AnnouncementIcon color={announcement.important ? "error" : "primary"} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={announcement.title}
                          secondary={
                            <>
                              {announcement.content}
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {formatDate(announcement.createdAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < recentAnnouncements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No recent announcements</Alert>
              )}
            </CardContent>
          </Card>
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
