import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { festivalService } from '../../services/festivalService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface Festival {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  location: string;
  max_volunteers: number;
  current_volunteers: number;
  created_at: string;
  updated_at: string;
}

export default function AdminFestivalManagement() {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const data = await festivalService.getFestivals();
        setFestivals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch festivals');
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [user]);

  const handleStatusChange = async (festivalId: string, newStatus: Festival['status']) => {
    try {
      await festivalService.updateFestival({
        id: festivalId,
        status: newStatus,
      });
      setFestivals(festivals.map(festival =>
        festival.id === festivalId ? { ...festival, status: newStatus } : festival
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update festival status');
    }
  };

  const handleDeleteFestival = async (festivalId: string) => {
    if (!window.confirm('Are you sure you want to delete this festival?')) return;

    try {
      await festivalService.deleteFestival(festivalId);
      setFestivals(festivals.filter(festival => festival.id !== festivalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete festival');
    }
  };

  const filteredFestivals = festivals.filter(festival => {
    const matchesSearch = festival.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || festival.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Festival Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Festival
          </button>
          <input
            type="text"
            placeholder="Search festivals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Festival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volunteers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFestivals.map((festival) => (
              <tr key={festival.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{festival.name}</div>
                  <div className="text-sm text-gray-500">{festival.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(festival.start_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(festival.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {festival.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {festival.current_volunteers}/{festival.max_volunteers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={festival.status}
                    onChange={(e) => handleStatusChange(festival.id, e.target.value as Festival['status'])}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteFestival(festival.id)}
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

      {filteredFestivals.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No festivals found matching your criteria.
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Festival</h3>
            {/* Add festival creation form here */}
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