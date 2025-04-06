import { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'dev-user',
    subject: 'Welcome to the platform',
    body: 'Thank you for joining our volunteer platform!',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'dev-user',
    subject: 'New task assigned',
    body: 'You have been assigned a new task: Clean up area B',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(mockNotifications.filter(n => !n.read).length);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Skip actual database calls for now since the table doesn't exist yet
    // In the future, uncomment this code when the notifications table is created
    /*
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    */
  }, [user]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      // In real implementation, update the database
      // For now, just update the local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    }
  };

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
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                display: 'block',
                whiteSpace: 'normal',
              }}
            >
              <Typography variant="subtitle2" component="div">
                {notification.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.body}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.created_at).toLocaleString()}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
} 