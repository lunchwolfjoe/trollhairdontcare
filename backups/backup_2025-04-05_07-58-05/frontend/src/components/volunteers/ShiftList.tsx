import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { volunteerService, Shift } from '../../services/volunteerService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface ShiftListProps {
  festivalId: string;
  onShiftSelect: (shift: Shift) => void;
}

const ShiftList = ({ festivalId, onShiftSelect }: ShiftListProps) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all');

  useEffect(() => {
    fetchShifts();
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

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getFestivalShifts(festivalId);
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (shiftId: string) => {
    if (!user) return;

    try {
      await volunteerService.assignToShift(shiftId, user.id);
      await fetchShifts(); // Refresh shifts to update current_volunteers count
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up for shift');
    }
  };

  const filteredShifts = shifts.filter(shift => {
    if (filter === 'available') {
      return shift.status === 'open' && shift.current_volunteers < shift.max_volunteers;
    }
    if (filter === 'assigned') {
      return shift.status === 'filled' || shift.status === 'completed';
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Shifts
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-md ${
            filter === 'available'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available Shifts
        </button>
        <button
          onClick={() => setFilter('assigned')}
          className={`px-4 py-2 rounded-md ${
            filter === 'assigned'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Assigned Shifts
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredShifts.map((shift) => (
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Required Skills: {shift.required_skills.join(', ')}
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
                    {shift.status === 'open' && shift.current_volunteers < shift.max_volunteers && (
                      <button
                        onClick={() => handleSignUp(shift.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sign Up
                      </button>
                    )}
                    {shift.status === 'filled' && (
                      <button
                        onClick={() => onShiftSelect(shift)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
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

export default ShiftList; 