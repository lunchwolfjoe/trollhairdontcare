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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapIcon,
  Assignment as TaskIcon,
  NotificationImportant as IncidentIcon,
  Chat as ChatIcon,
  BarChart as ChartIcon,
  WbSunny as WeatherIcon,
  Map as MapIcon,
  Inventory as AssetIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { AppLogo } from './common/AppLogo';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({ children }) => {
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
        <AppLogo size="medium" showText={true} portalType="coordinator" />
      </Box>
      
      <List sx={{ px: 1 }}>
        <ListItem component={Link} to="/coordinator/dashboard" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/dashboard'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <DashboardIcon color={location.pathname === '/coordinator/dashboard' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/volunteers" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/volunteers'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <PeopleIcon color={location.pathname === '/coordinator/volunteers' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Volunteer Management" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/welcome-home" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/welcome-home' || location.pathname.includes('/coordinator/festivals') && location.pathname.includes('/checkin')}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <HomeIcon color={location.pathname === '/coordinator/welcome-home' || location.pathname.includes('/coordinator/festivals') && location.pathname.includes('/checkin') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Welcome Home Portal" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        <ListItem component={Link} to="/coordinator/crews" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/crews'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <GroupIcon color={location.pathname === '/coordinator/crews' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Crew Management" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/scheduler" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/scheduler'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <ScheduleIcon color={location.pathname === '/coordinator/scheduler' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Auto Scheduler" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/shift-swaps" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/shift-swaps'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <SwapIcon color={location.pathname === '/coordinator/shift-swaps' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Shift Swaps" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/tasks" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/tasks'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <TaskIcon color={location.pathname === '/coordinator/tasks' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Tasks" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        <ListItem component={Link} to="/coordinator/communications" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/communications'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <ChatIcon color={location.pathname === '/coordinator/communications' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Communications" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/incidents" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/incidents'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <IncidentIcon color={location.pathname === '/coordinator/incidents' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Incident Logging" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/weather" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/weather'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <WeatherIcon color={location.pathname === '/coordinator/weather' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Weather Monitoring" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/reporting" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/reporting'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <ChartIcon color={location.pathname === '/coordinator/reporting' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Reporting & Analytics" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        <ListItem component={Link} to="/coordinator/map" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/map'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <MapIcon color={location.pathname === '/coordinator/map' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Festival Map" />
          </ListItemButton>
        </ListItem>

        <ListItem component={Link} to="/coordinator/assets" disablePadding>
          <ListItemButton 
            selected={location.pathname === '/coordinator/assets'}
            sx={{ 
              borderRadius: '12px',
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(245, 75, 100, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <AssetIcon color={location.pathname === '/coordinator/assets' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Asset Management" />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ 
        p: 2, 
        mt: 'auto', 
        textAlign: 'center',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}>
        <AppLogo size="small" showText={false} />
        <Typography variant="caption" color="text.secondary">
          Since 1972
        </Typography>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
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
          width: { md: `calc(100% - 240px)` },
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
            <img 
              src="https://www.kerrvillefolkfestival.org/wp-content/uploads/2025/01/Kerrville-Music-Festivals-Logos.svg"
              alt="Kerrville Folk Festival" 
              style={{ 
                width: 48,
                height: 'auto',
                marginRight: '8px'
              }}
            />
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
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export { CoordinatorLayout }; 
