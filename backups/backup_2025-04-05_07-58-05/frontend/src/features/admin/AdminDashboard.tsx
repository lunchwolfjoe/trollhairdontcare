import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { selectUsers, selectFestivals } from '../../store/slices/adminSlice';
import ManageUsers from './components/ManageUsers';
import ManageRoles from './components/ManageRoles';
import ManageEvents from './components/ManageEvents';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

export default function AdminDashboard() {
  const [value, setValue] = React.useState(0);
  const users = useAppSelector(selectUsers);
  const festivals = useAppSelector(selectFestivals);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            TrollHairDontCare Admin
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" component="div">
                  {users.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Active Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'published').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upcoming Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'draft').length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              mb: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AppBar position="static" color="default" elevation={0}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="admin dashboard tabs"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab label="Manage Users" {...a11yProps(0)} />
                <Tab label="Manage Roles" {...a11yProps(1)} />
                <Tab label="Manage Events" {...a11yProps(2)} />
              </Tabs>
            </AppBar>
            <Box>
              <TabPanel value={value} index={0}>
                <ManageUsers />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <ManageRoles />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <ManageEvents />
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { selectUsers, selectFestivals } from '../../store/slices/adminSlice';
import ManageUsers from './components/ManageUsers';
import ManageRoles from './components/ManageRoles';
import ManageEvents from './components/ManageEvents';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

export default function AdminDashboard() {
  const [value, setValue] = React.useState(0);
  const users = useAppSelector(selectUsers);
  const festivals = useAppSelector(selectFestivals);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            TrollHairDontCare Admin
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" component="div">
                  {users.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Active Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'published').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upcoming Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'draft').length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              mb: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AppBar position="static" color="default" elevation={0}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="admin dashboard tabs"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab label="Manage Users" {...a11yProps(0)} />
                <Tab label="Manage Roles" {...a11yProps(1)} />
                <Tab label="Manage Events" {...a11yProps(2)} />
              </Tabs>
            </AppBar>
            <Box>
              <TabPanel value={value} index={0}>
                <ManageUsers />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <ManageRoles />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <ManageEvents />
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { selectUsers, selectFestivals } from '../../store/slices/adminSlice';
import ManageUsers from './components/ManageUsers';
import ManageRoles from './components/ManageRoles';
import ManageEvents from './components/ManageEvents';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

export default function AdminDashboard() {
  const [value, setValue] = React.useState(0);
  const users = useAppSelector(selectUsers);
  const festivals = useAppSelector(selectFestivals);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            TrollHairDontCare Admin
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" component="div">
                  {users.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Active Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'published').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upcoming Festivals
                </Typography>
                <Typography variant="h3" component="div">
                  {festivals.filter((f) => f.status === 'draft').length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2, 
              mb: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AppBar position="static" color="default" elevation={0}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="admin dashboard tabs"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab label="Manage Users" {...a11yProps(0)} />
                <Tab label="Manage Roles" {...a11yProps(1)} />
                <Tab label="Manage Events" {...a11yProps(2)} />
              </Tabs>
            </AppBar>
            <Box>
              <TabPanel value={value} index={0}>
                <ManageUsers />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <ManageRoles />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <ManageEvents />
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 