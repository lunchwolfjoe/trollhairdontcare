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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SwapHoriz as SwapHorizIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AdminPanelSettings as AdminIcon,
  EventAvailable as EventAvailableIcon,
  Gavel as WaiverIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const drawerWidth = 240;

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

export default function VolunteerLayout({ children }: VolunteerLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleChange = (newRole: 'coordinator' | 'admin') => {
    setRole(newRole);
    if (newRole === 'coordinator') {
      navigate('/coordinator/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/volunteer/dashboard' },
    { text: 'My Tasks', icon: <AssignmentIcon />, path: '/volunteer/tasks' },
    { text: 'Shift Swap', icon: <SwapHorizIcon />, path: '/volunteer/shift-swap' },
    { text: 'Availability', icon: <EventAvailableIcon />, path: '/volunteer/availability' },
    { text: 'Waivers & Forms', icon: <WaiverIcon />, path: '/volunteer/waivers' },
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
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleRoleChange('coordinator')}
        >
          <ListItemIcon>
            <SupervisorAccountIcon />
          </ListItemIcon>
          <ListItemText primary="Switch to Coordinator View" />
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
            Volunteer Dashboard
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