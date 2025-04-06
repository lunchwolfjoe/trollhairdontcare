import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const roleCards = {
    admin: [
      {
        title: 'User Management',
        description: 'Manage user accounts, roles, and permissions',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/admin/users',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Festival Management',
        description: 'Create and manage festival events and schedules',
        icon: <EventIcon sx={{ fontSize: 40 }} />,
        path: '/admin/festivals',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Location Management',
        description: 'Manage festival locations and mapping',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/admin/locations',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
    ],
    coordinator: [
      {
        title: 'Volunteer Management',
        description: 'Manage volunteer assignments and schedules',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/volunteers',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Task Management',
        description: 'Create and assign tasks to volunteers',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Schedule Overview',
        description: 'View and manage event schedules',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/schedule',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'Crew Management',
        description: 'Create and manage crews, set requirements and skills',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/crews',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
      {
        title: 'Auto Scheduler',
        description: 'Automatically assign volunteers to crews based on skills and availability',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/scheduler',
        color: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)',
      },
    ],
    volunteer: [
      {
        title: 'My Profile',
        description: 'View and edit your profile information',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/profile',
        color: 'linear-gradient(45deg, #E91E63 30%, #F48FB1 90%)',
      },
      {
        title: 'My Schedule',
        description: 'View your assigned shifts and tasks',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/schedule',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'My Tasks',
        description: 'View and manage your assigned tasks',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Festival Map',
        description: 'View festival locations and navigation',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/map',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'My Availability',
        description: 'Set your availability and preferences',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/availability',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
    ],
  };

  const getAvailableCards = () => {
    if (role === 'admin') return [...roleCards.admin, ...roleCards.coordinator, ...roleCards.volunteer];
    if (role === 'coordinator') return [...roleCards.coordinator, ...roleCards.volunteer];
    return roleCards.volunteer;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            TrollHairDontCare Festival
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.email}
            </Typography>
            <Chip
              label={role?.toUpperCase()}
              color={role === 'admin' ? 'error' : role === 'coordinator' ? 'warning' : 'info'}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: '64px',
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {getAvailableCards().map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: card.color,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {card.icon}
                      <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{card.description}</Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleNavigate(card.path)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {role === 'coordinator' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Auto Scheduler
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically match volunteers to crews based on skills and availability.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/scheduler">
                        Open Scheduler
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Crew Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create and manage crews, assign volunteers, and set requirements.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/crews">
                        Manage Crews
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const roleCards = {
    admin: [
      {
        title: 'User Management',
        description: 'Manage user accounts, roles, and permissions',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/admin/users',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Festival Management',
        description: 'Create and manage festival events and schedules',
        icon: <EventIcon sx={{ fontSize: 40 }} />,
        path: '/admin/festivals',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Location Management',
        description: 'Manage festival locations and mapping',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/admin/locations',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
    ],
    coordinator: [
      {
        title: 'Volunteer Management',
        description: 'Manage volunteer assignments and schedules',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/volunteers',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Task Management',
        description: 'Create and assign tasks to volunteers',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Schedule Overview',
        description: 'View and manage event schedules',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/schedule',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'Crew Management',
        description: 'Create and manage crews, set requirements and skills',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/crews',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
      {
        title: 'Auto Scheduler',
        description: 'Automatically assign volunteers to crews based on skills and availability',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/scheduler',
        color: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)',
      },
    ],
    volunteer: [
      {
        title: 'My Profile',
        description: 'View and edit your profile information',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/profile',
        color: 'linear-gradient(45deg, #E91E63 30%, #F48FB1 90%)',
      },
      {
        title: 'My Schedule',
        description: 'View your assigned shifts and tasks',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/schedule',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'My Tasks',
        description: 'View and manage your assigned tasks',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Festival Map',
        description: 'View festival locations and navigation',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/map',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'My Availability',
        description: 'Set your availability and preferences',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/availability',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
    ],
  };

  const getAvailableCards = () => {
    if (role === 'admin') return [...roleCards.admin, ...roleCards.coordinator, ...roleCards.volunteer];
    if (role === 'coordinator') return [...roleCards.coordinator, ...roleCards.volunteer];
    return roleCards.volunteer;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            TrollHairDontCare Festival
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.email}
            </Typography>
            <Chip
              label={role?.toUpperCase()}
              color={role === 'admin' ? 'error' : role === 'coordinator' ? 'warning' : 'info'}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: '64px',
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {getAvailableCards().map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: card.color,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {card.icon}
                      <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{card.description}</Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleNavigate(card.path)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {role === 'coordinator' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Auto Scheduler
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically match volunteers to crews based on skills and availability.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/scheduler">
                        Open Scheduler
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Crew Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create and manage crews, assign volunteers, and set requirements.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/crews">
                        Manage Crews
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const roleCards = {
    admin: [
      {
        title: 'User Management',
        description: 'Manage user accounts, roles, and permissions',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/admin/users',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Festival Management',
        description: 'Create and manage festival events and schedules',
        icon: <EventIcon sx={{ fontSize: 40 }} />,
        path: '/admin/festivals',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Location Management',
        description: 'Manage festival locations and mapping',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/admin/locations',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
    ],
    coordinator: [
      {
        title: 'Volunteer Management',
        description: 'Manage volunteer assignments and schedules',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/volunteers',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'Task Management',
        description: 'Create and assign tasks to volunteers',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Schedule Overview',
        description: 'View and manage event schedules',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/schedule',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'Crew Management',
        description: 'Create and manage crews, set requirements and skills',
        icon: <GroupsIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/crews',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
      {
        title: 'Auto Scheduler',
        description: 'Automatically assign volunteers to crews based on skills and availability',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/coordinator/scheduler',
        color: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)',
      },
    ],
    volunteer: [
      {
        title: 'My Profile',
        description: 'View and edit your profile information',
        icon: <PersonIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/profile',
        color: 'linear-gradient(45deg, #E91E63 30%, #F48FB1 90%)',
      },
      {
        title: 'My Schedule',
        description: 'View your assigned shifts and tasks',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/schedule',
        color: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      },
      {
        title: 'My Tasks',
        description: 'View and manage your assigned tasks',
        icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/tasks',
        color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      },
      {
        title: 'Festival Map',
        description: 'View festival locations and navigation',
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/map',
        color: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
      },
      {
        title: 'My Availability',
        description: 'Set your availability and preferences',
        icon: <CalendarIcon sx={{ fontSize: 40 }} />,
        path: '/volunteer/availability',
        color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      },
    ],
  };

  const getAvailableCards = () => {
    if (role === 'admin') return [...roleCards.admin, ...roleCards.coordinator, ...roleCards.volunteer];
    if (role === 'coordinator') return [...roleCards.coordinator, ...roleCards.volunteer];
    return roleCards.volunteer;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            TrollHairDontCare Festival
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.email}
            </Typography>
            <Chip
              label={role?.toUpperCase()}
              color={role === 'admin' ? 'error' : role === 'coordinator' ? 'warning' : 'info'}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: '64px',
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {getAvailableCards().map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: card.color,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {card.icon}
                      <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{card.description}</Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleNavigate(card.path)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {role === 'coordinator' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Auto Scheduler
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically match volunteers to crews based on skills and availability.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/scheduler">
                        Open Scheduler
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Crew Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create and manage crews, assign volunteers, and set requirements.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} to="/coordinator/crews">
                        Manage Crews
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 