import { NotificationBell } from './NotificationBell';

<AppBar position="static">
  <Toolbar>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      Coordinator Dashboard
    </Typography>
    <NotificationBell />
    <IconButton color="inherit" onClick={handleLogout}>
      <LogoutIcon />
    </IconButton>
  </Toolbar>
</AppBar> 