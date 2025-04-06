import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { volunteerService, Shift } from '../../services/volunteerService';
import { festivalService, Festival } from '../../services/festivalService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface ShiftManagementProps {
  festivalId: string;
}

const ShiftManagement = ({ festivalId }: ShiftManagementProps) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    required_skills: '',
    max_volunteers: 1,
  });

  useEffect(() => {
    fetchData();
    const subscription = volunteerService.subscribeToShifts(festivalId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setShifts(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setShifts(prev => prev.map(shift => 
          shift.id === payload.new.id ? payload.new : shift
        ));
      } else if (payload.eventType === 'DELETE') {
        setShifts(prev => prev.filter(shift => shift.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [festivalId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftsData, festivalData] = await Promise.all([
        volunteerService.getFestivalShifts(festivalId),
        festivalService.getFestivalById(festivalId),
      ]);
      setShifts(shiftsData);
      setFestival(festivalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newShift = {
        ...formData,
        festival_id: festivalId,
        required_skills: formData.required_skills.split(',').map(skill => skill.trim()),
        current_volunteers: 0,
        status: 'open' as const,
      };

      await volunteerService.createShift(newShift);
      setIsCreatingShift(false);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        required_skills: '',
        max_volunteers: 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shift');
    }
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    try {
      await volunteerService.updateShift({
        ...editingShift,
        ...formData,
        required_skills: formData.required_skills.split(',').map(skill => skill.trim()),
      });
      setEditingShift(null);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        required_skills: '',
        max_volunteers: 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift');
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;

    try {
      await volunteerService.deleteShift(shiftId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shift Management</h2>
        <button
          onClick={() => setIsCreatingShift(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Shift
        </button>
      </div>

      {(isCreatingShift || editingShift) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isCreatingShift ? 'Create New Shift' : 'Edit Shift'}
          </h3>
          <form onSubmit={isCreatingShift ? handleCreateShift : handleUpdateShift} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="start_time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="end_time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="required_skills" className="block text-sm font-medium text-gray-700">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                id="required_skills"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="max_volunteers" className="block text-sm font-medium text-gray-700">
                Maximum Volunteers
              </label>
              <input
                type="number"
                id="max_volunteers"
                value={formData.max_volunteers}
                onChange={(e) => setFormData({ ...formData, max_volunteers: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingShift(false);
                  setEditingShift(null);
                  setFormData({
                    title: '',
                    description: '',
                    start_time: '',
                    end_time: '',
                    location: '',
                    required_skills: '',
                    max_volunteers: 1,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isCreatingShift ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {shifts.map((shift) => (
            <li key={shift.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">{shift.title}</p>
                    <p className="text-sm text-gray-500">{shift.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {new Date(shift.start_time).toLocaleString()} -{' '}
                      {new Date(shift.end_time).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {shift.location}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        shift.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : shift.status === 'filled'
                          ? 'bg-blue-100 text-blue-800'
                          : shift.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {shift.current_volunteers}/{shift.max_volunteers} volunteers
                    </span>
                    <button
                      onClick={() => {
                        setEditingShift(shift);
                        setFormData({
                          title: shift.title,
                          description: shift.description,
                          start_time: shift.start_time,
                          end_time: shift.end_time,
                          location: shift.location,
                          required_skills: shift.required_skills.join(', '),
                          max_volunteers: shift.max_volunteers,
                        });
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShiftManagement; 