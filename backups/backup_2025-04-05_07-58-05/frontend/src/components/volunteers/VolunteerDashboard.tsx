import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { volunteerService } from '../../services/volunteerService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface DashboardStats {
  totalShifts: number;
  completedShifts: number;
  upcomingShifts: number;
  totalHours: number;
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getVolunteerStats(user.id);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch volunteer stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Shifts</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.totalShifts}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Completed Shifts</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats.completedShifts}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Upcoming Shifts</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.upcomingShifts}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Total Hours</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600">{stats.totalHours}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/* Add recent activity items here */}
          <p className="text-gray-500">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
} 