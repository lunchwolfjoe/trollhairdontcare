import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { festivalService } from '../../services/festivalService';
import { volunteerService } from '../../services/volunteerService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface Festival {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  festival_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  required_skills: string[];
  max_volunteers: number;
  current_volunteers: number;
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export default function AdminShiftManagement() {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [festivalsData, shiftsData] = await Promise.all([
          festivalService.getFestivals(),
          volunteerService.getAllShifts(),
        ]);
        setFestivals(festivalsData);
        setShifts(shiftsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStatusChange = async (shiftId: string, newStatus: Shift['status']) => {
    try {
      await volunteerService.updateShiftStatus(shiftId, newStatus);
      setShifts(shifts.map(shift =>
        shift.id === shiftId ? { ...shift, status: newStatus } : shift
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift status');
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;

    try {
      await volunteerService.deleteShift(shiftId);
      setShifts(shifts.filter(shift => shift.id !== shiftId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
    }
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesFestival = selectedFestival === 'all' || shift.festival_id === selectedFestival;
    const matchesSearch = shift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || shift.status === selectedStatus;
    return matchesFestival && matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Shift
          </button>
          <select
            value={selectedFestival}
            onChange={(e) => setSelectedFestival(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Festivals</option>
            {festivals.map(festival => (
              <option key={festival.id} value={festival.id}>
                {festival.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search shifts..."
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
            <option value="open">Open</option>
            <option value="filled">Filled</option>
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
                Shift
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Festival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
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
            {filteredShifts.map((shift) => (
              <tr key={shift.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{shift.title}</div>
                  <div className="text-sm text-gray-500">{shift.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {festivals.find(f => f.id === shift.festival_id)?.name || 'Unknown Festival'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(shift.start_time).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(shift.end_time).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shift.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shift.current_volunteers}/{shift.max_volunteers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={shift.status}
                    onChange={(e) => handleStatusChange(shift.id, e.target.value as Shift['status'])}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="filled">Filled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteShift(shift.id)}
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

      {filteredShifts.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No shifts found matching your criteria.
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Shift</h3>
            {/* Add shift creation form here */}
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