import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../services/notificationService';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    notificationService.getNotifications().then(setNotifications);
    notificationService.getUnreadCount().then(setUnreadCount);

    // Subscribe to new notifications
    const subscription = notificationService.subscribeToNotifications((payload) => {
      const newNotification = payload.new as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  if (!user) return null;

  const userRole = user.user_metadata?.role || 'volunteer';

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            to="/dashboard" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/dashboard' ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/festivals" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/festivals' ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`}
          >
            Festivals
          </Link>
          <Link 
            to="/profile" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/profile' ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`}
          >
            Profile
          </Link>

          {/* Role-specific navigation items */}
          {userRole === 'admin' && (
            <>
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/admin') ? 'bg-gray-900' : 'hover:bg-gray-700'
                }`}
              >
                Admin
              </Link>
            </>
          )}

          {(userRole === 'coordinator' || userRole === 'admin') && (
            <>
              <Link 
                to="/coordinator" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/coordinator') ? 'bg-gray-900' : 'hover:bg-gray-700'
                }`}
              >
                Coordinator
              </Link>
            </>
          )}

          {(userRole === 'volunteer' || userRole === 'coordinator' || userRole === 'admin') && (
            <>
              <Link 
                to="/volunteer" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/volunteer') ? 'bg-gray-900' : 'hover:bg-gray-700'
                }`}
              >
                Volunteer
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
            >
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white focus:outline-none">
              <span className="text-sm font-medium">{user.email}</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 