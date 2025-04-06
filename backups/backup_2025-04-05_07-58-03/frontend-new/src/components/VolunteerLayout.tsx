import { useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
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
  Container,
  Avatar,
  useTheme,
  useMediaQuery,
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
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const drawerWidth = 240;

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

export function VolunteerLayout({ children }: VolunteerLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setActiveRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleChange = (newRole: 'coordinator' | 'admin') => {
    setActiveRole(newRole);
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
      <Box sx={{ 
        py: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5'
      }}>
        <Avatar 
          src="/kerrville_logo.png" 
          alt="Festival Logo" 
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.primary.main, 
            textTransform: 'uppercase',
            fontFamily: 'Oswald, Arial, sans-serif',
            fontWeight: 700,
            letterSpacing: 1
          }}
        >
          Folk Festival
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontStyle: 'italic'
          }}
        >
          Volunteer Portal
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{ 
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(230, 97, 103, 0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(230, 97, 103, 0.05)',
                }
              }}
              selected={window.location.pathname === item.path}
            >
              <ListItemIcon sx={{ 
                color: window.location.pathname === item.path 
                  ? theme.palette.primary.main 
                  : theme.palette.text.secondary,
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontFamily: 'Sofia Sans, Arial, sans-serif' 
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            display: 'block', 
            color: theme.palette.text.secondary,
            mb: 1,
            px: 1
          }}
        >
          Switch Role
        </Typography>
        <List>
          <ListItem
            button
            sx={{ 
              borderRadius: 1,
              mb: 0.5,
              backgroundColor: 'rgba(93, 122, 99, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(93, 122, 99, 0.2)',
              }
            }}
            onClick={() => handleRoleChange('coordinator')}
          >
            <ListItemIcon sx={{ color: '#5D7A63', minWidth: 40 }}>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Coordinator View" 
              primaryTypographyProps={{ 
                fontSize: '0.95rem',
                fontFamily: 'Sofia Sans, Arial, sans-serif' 
              }}
            />
          </ListItem>
          <ListItem
            button
            sx={{ 
              borderRadius: 1,
              backgroundColor: 'rgba(77, 77, 77, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(77, 77, 77, 0.2)',
              }
            }}
            onClick={() => handleRoleChange('admin')}
          >
            <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: 40 }}>
              <AdminIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Admin View" 
              primaryTypographyProps={{ 
                fontSize: '0.95rem',
                fontFamily: 'Sofia Sans, Arial, sans-serif' 
              }}
            />
          </ListItem>
        </List>
      </Box>
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(0,0,0,0.08)'
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
            <MusicNoteIcon sx={{ 
              color: theme.palette.primary.main, 
              mr: 1,
              display: { xs: 'none', sm: 'block' }
            }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontFamily: 'Oswald, Arial, sans-serif',
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Volunteer Dashboard
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 
