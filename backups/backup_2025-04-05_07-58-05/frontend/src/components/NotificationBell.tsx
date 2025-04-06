import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: string;
  user_id: string;
  template_id: string;
  type: string;
  subject: string;
  body: string;
  read: boolean;
  sent_at: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = notificationService.subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <WarningIcon color="warning" />;
      case 'task':
        return <CheckCircleIcon color="primary" />;
      case 'shift':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {error ? (
          <MenuItem disabled>
            <Typography color="error">{error}</Typography>
          </MenuItem>
        ) : loading ? (
          <MenuItem disabled>
            <Typography>Loading notifications...</Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.subject}
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {notification.body}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}; 