import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  Group as CrewIcon,
  Inventory as AssetIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, icon, color = 'primary.main' }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();

  // TODO: Replace with actual data from API
  const stats = {
    totalUsers: 150,
    activeVolunteers: 120,
    totalTasks: 45,
    totalCrews: 8,
  };

  const recentActivity = [
    { id: 1, text: 'New volunteer registration: John Doe', time: '2 hours ago' },
    { id: 2, text: 'Task completed: Stage Setup', time: '3 hours ago' },
    { id: 3, text: 'New crew created: Sound Team', time: '5 hours ago' },
    { id: 4, text: 'Asset checked out: PA System', time: '1 day ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.email}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's what's happening in your festival management system
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Volunteers"
            value={stats.activeVolunteers}
            icon={<PeopleIcon fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<TaskIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Crews"
            value={stats.totalCrews}
            icon={<CrewIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Typography variant="body1" paragraph>
              The festival management system is running smoothly. All core services are operational,
              and the database is performing within expected parameters.
            </Typography>
            <Typography variant="body1" paragraph>
              Recent system updates include:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Enhanced volunteer management features"
                  secondary="Added new capabilities for tracking volunteer hours and skills"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Improved task assignment system"
                  secondary="New algorithm for matching volunteers with appropriate tasks"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Asset tracking improvements"
                  secondary="Added QR code support for equipment check-in/out"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 