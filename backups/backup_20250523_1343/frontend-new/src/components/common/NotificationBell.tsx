import React from 'react';
import {
  Badge,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

/**
 * A simple notification bell icon
 */
export const NotificationBell: React.FC = () => {
  return (
    <IconButton color="inherit" size="large">
      <Badge badgeContent={0} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}; 