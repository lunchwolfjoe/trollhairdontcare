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
  People as PeopleIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { AppLogo } from './common/AppLogo';

const drawerWidth = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setActiveRole } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleChange = (newRole: 'coordinator' | 'volunteer') => {
    try {
      setActiveRole(newRole);
      if (newRole === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Error switching roles:', error);
      // If role switching fails, redirect to dev tools
      navigate('/dev-tools');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Festival Management', icon: <EventIcon />, path: '/admin/festivals' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    { text: 'Coordinator Features', icon: <AdminIcon />, path: '/coordinator/dashboard' },
    // Add more admin menu items as needed
  ];

  const drawer = (
    <div>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        py: 4,
        px: 2,
        background: 'linear-gradient(180deg, rgba(139,195,181,0.2) 0%, rgba(255,255,255,0) 100%)',
        mb: 2
      }}>
        <AppLogo size="medium" showText={true} portalType="admin" />
      </Box>
      <Toolbar sx={{ display: { xs: 'none', sm: 'block' } }} />
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
          onClick={() => handleRoleChange('coordinator')}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Switch to Coordinator View" />
        </ListItem>
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleRoleChange('volunteer')}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Switch to Volunteer View" />
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
          bgcolor: 'primary.dark', // Darker color for admin
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1.5 }}>
              <img 
                src="https://www.kerrvillefolkfestival.org/wp-content/uploads/2025/01/Kerrville-Music-Festivals-Logos.svg"
                alt="Kerrville Folk Festival" 
                style={{ 
                  width: 48,
                  height: 'auto'
                }}
              />
            </Box>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
          </Box>
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
