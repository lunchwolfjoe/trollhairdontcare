import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SwapHoriz as SwapHorizIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  AutoAwesome as AutoAwesomeIcon,
  WbSunny as WeatherIcon,
  Group as GroupIcon,
  Map as MapIcon,
  Inventory as InventoryIcon,
  PeopleAlt as VolunteerManagementIcon,
  Message as CommunicationsIcon,
  Assessment as ReportingIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const drawerWidth = 240;

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

export default function CoordinatorLayout({ children }: CoordinatorLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleChange = (newRole: 'volunteer' | 'admin') => {
    setRole(newRole);
    if (newRole === 'volunteer') {
      navigate('/volunteer/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/coordinator/dashboard' },
    { text: 'Volunteer Management', icon: <VolunteerManagementIcon />, path: '/coordinator/volunteers' },
    { text: 'Crew Management', icon: <GroupIcon />, path: '/coordinator/crews' },
    { text: 'Auto Scheduler', icon: <AutoAwesomeIcon />, path: '/coordinator/scheduler' },
    { text: 'Shift Swaps', icon: <SwapHorizIcon />, path: '/coordinator/shift-swaps' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/coordinator/tasks' },
    { text: 'Communications', icon: <CommunicationsIcon />, path: '/coordinator/communications' },
    { text: 'Reporting & Analytics', icon: <ReportingIcon />, path: '/coordinator/reporting' },
    { text: 'Weather Monitoring', icon: <WeatherIcon />, path: '/coordinator/weather' },
    { text: 'Festival Map', icon: <MapIcon />, path: '/coordinator/map' },
    { text: 'Asset Management', icon: <InventoryIcon />, path: '/coordinator/assets' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            component="div"
            sx={{ cursor: 'pointer' }}
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List>
        <ListItem 
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleRoleChange('volunteer')}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Switch to Volunteer View" />
        </ListItem>
        <ListItem 
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleRoleChange('admin')}
        >
          <ListItemIcon>
            <AdminIcon />
          </ListItemIcon>
          <ListItemText primary="Switch to Admin View" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Coordinator Dashboard
          </Typography>
          <NotificationBell />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 