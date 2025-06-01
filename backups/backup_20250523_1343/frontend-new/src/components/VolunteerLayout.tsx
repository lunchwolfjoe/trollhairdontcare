import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Divider,
  ListItemButton,
  Paper,
  Container,
  IconButton,
  useMediaQuery,
  CssBaseline,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapIcon,
  Assignment as TaskIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  MusicNote as MusicNoteIcon,
  Home as HomeIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { AppLogo } from './common/AppLogo';
import { NotificationBell } from './common/NotificationBell';

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

export function VolunteerLayout({ children }: VolunteerLayoutProps) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
        <AppLogo size="medium" showText={true} portalType="volunteer" />
      </Box>

      <List sx={{ px: 1 }}>
        <ListItem component={Link} to="/volunteer/dashboard" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/dashboard'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <DashboardIcon color={location.pathname === '/volunteer/dashboard' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/volunteer/welcome-home" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/welcome-home'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <HomeIcon color={location.pathname === '/volunteer/welcome-home' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Welcome Home" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/volunteer/schedule" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/schedule'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <ScheduleIcon color={location.pathname === '/volunteer/schedule' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="My Schedule" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/volunteer/shift-swaps" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/shift-swaps'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <SwapIcon color={location.pathname === '/volunteer/shift-swaps' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Shift Swaps" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/volunteer/tasks" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/tasks'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <TaskIcon color={location.pathname === '/volunteer/tasks' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="My Tasks" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        <ListItem component={Link} to="/volunteer/communications" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/communications'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <ChatIcon color={location.pathname === '/volunteer/communications' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Communications" />
          </ListItemButton>
        </ListItem>
        
        <ListItem component={Link} to="/volunteer/map" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/volunteer/map'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <MapIcon color={location.pathname === '/volunteer/map' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Festival Map" />
          </ListItemButton>
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
            <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 1.5 }}>
              <img 
                src="https://www.kerrvillefolkfestival.org/wp-content/uploads/2025/01/Kerrville-Music-Festivals-Logos.svg"
                alt="Kerrville Folk Festival" 
                style={{ 
                  width: 48,
                  height: 'auto'
                }}
              />
            </Box>
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
        {/* Mobile drawer */}
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
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              borderRight: '1px solid rgba(0,0,0,0.08)',
            },
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
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {/* Mobile app bar */}
        {isMobile && (
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              mb: 2,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <AppLogo size="small" />
          </Paper>
        )}

        <Container
          maxWidth={false}
          sx={{
            py: 2,
            height: isMobile ? 'calc(100vh - 56px)' : '100vh',
            overflow: 'auto',
          }}
        >
          <div>{children}</div>
        </Container>
      </Box>
    </Box>
  );
} 
