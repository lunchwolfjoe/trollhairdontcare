import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_audience: 'all' | 'volunteers' | 'coordinators' | 'admins';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_for: string | null;
  created_at: string;
  sent_at: string | null;
}

export default function AdminNotificationManagement() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getAllNotifications();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleStatusChange = async (notificationId: string, newStatus: Notification['status']) => {
    try {
      await notificationService.updateNotificationStatus(notificationId, newStatus);
      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: newStatus } : notification
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification status');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
    const matchesAudience = selectedAudience === 'all' || notification.target_audience === selectedAudience;
    return matchesSearch && matchesType && matchesStatus && matchesAudience;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Notification
          </button>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Audiences</option>
            <option value="all">Everyone</option>
            <option value="volunteers">Volunteers</option>
            <option value="coordinators">Coordinators</option>
            <option value="admins">Admins</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Audience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled For
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <tr key={notification.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{notification.message}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'success' ? 'bg-green-100 text-green-800' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {notification.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {notification.target_audience}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={notification.status}
                    onChange={(e) => handleStatusChange(notification.id, e.target.value as Notification['status'])}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {notification.scheduled_for ? new Date(notification.scheduled_for).toLocaleString() : 'Not scheduled'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No notifications found matching your criteria.
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
            {/* Add notification creation form here */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 