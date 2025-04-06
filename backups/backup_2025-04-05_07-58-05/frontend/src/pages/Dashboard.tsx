import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { volunteerService, type DashboardStats, type Shift } from '../services/volunteerService';
import { festivalService, type Festival } from '../services/festivalService';
import { notificationService, type Notification } from '../services/notificationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [recentFestivals, setRecentFestivals] = useState<Festival[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch role-specific stats
        const userRole = user?.user_metadata?.role || 'volunteer';
        let statsData: DashboardStats;
        
        switch (userRole) {
          case 'admin':
            statsData = await volunteerService.getAdminStats();
            break;
          case 'coordinator':
            statsData = await volunteerService.getCoordinatorStats();
            break;
          default:
            statsData = await volunteerService.getVolunteerStats(user?.id || '');
        }
        setStats(statsData);

        // Fetch upcoming shifts for volunteers
        if (userRole === 'volunteer') {
          const shifts = await volunteerService.getUpcomingShifts(user?.id || '');
          setUpcomingShifts(shifts);
        }

        // Fetch recent festivals
        const festivals = await festivalService.getRecentFestivals();
        setRecentFestivals(festivals);

        // Fetch notifications
        const notifs = await notificationService.getNotifications(user?.id || '');
        setNotifications(notifs);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return <ErrorMessage message="No dashboard data available" />;

  const userRole = user?.user_metadata?.role || 'volunteer';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Shifts</h3>
          <p className="text-3xl font-bold">{stats.totalShifts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Completed Shifts</h3>
          <p className="text-3xl font-bold">{stats.completedShifts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Upcoming Shifts</h3>
          <p className="text-3xl font-bold">{stats.upcomingShifts}</p>
        </div>
        
        {/* Role-specific stats */}
        {userRole === 'volunteer' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Hours</h3>
            <p className="text-3xl font-bold">{stats.totalHours}</p>
          </div>
        )}
        {userRole === 'coordinator' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
          </div>
        )}
        {userRole === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Volunteers</h3>
            <p className="text-3xl font-bold">{stats.totalVolunteers}</p>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Shifts (Volunteers only) */}
        {userRole === 'volunteer' && upcomingShifts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Shifts</h2>
            <div className="space-y-4">
              {upcomingShifts.map(shift => (
                <div key={shift.id} className="border-b pb-4">
                  <h3 className="font-medium">{shift.location}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(shift.start_time).toLocaleDateString()} - 
                    {new Date(shift.start_time).toLocaleTimeString()} to 
                    {new Date(shift.end_time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm mt-2">{shift.task_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Festivals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Festivals</h2>
          <div className="space-y-4">
            {recentFestivals.map(festival => (
              <div key={festival.id} className="border-b pb-4">
                <h3 className="font-medium">{festival.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(festival.start_date).toLocaleDateString()} - 
                  {new Date(festival.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm mt-2">{festival.description}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  festival.status === 'active' ? 'bg-green-100 text-green-800' :
                  festival.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {festival.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.map(notification => (
              <div key={notification.id} className={`border-b pb-4 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}>
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 