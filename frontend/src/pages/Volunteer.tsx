import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { festivalService, Festival } from '../services/festivalService';
import { volunteerService, Shift } from '../services/volunteerService';
import ShiftList from '../components/volunteers/ShiftList';
import VolunteerDashboard from '../components/volunteers/VolunteerDashboard';
import ShiftCompletion from '../components/volunteers/ShiftCompletion';
import ShiftConflictCheck from '../components/volunteers/ShiftConflictCheck';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Volunteer = () => {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedFestival, setSelectedFestival] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shifts'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchFestivals();
    const subscription = festivalService.subscribeToFestivals((payload) => {
      if (payload.eventType === 'INSERT') {
        setFestivals(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setFestivals(prev => prev.map(festival => 
          festival.id === payload.new.id ? payload.new : festival
        ));
      } else if (payload.eventType === 'DELETE') {
        setFestivals(prev => prev.filter(festival => festival.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const data = await festivalService.getUpcomingFestivals();
      setFestivals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch festivals');
    } finally {
      setLoading(false);
    }
  };

  const handleShiftSelect = (shift: Shift) => {
    setSelectedShift(shift);
    setShowCompletion(true);
  };

  const handleShiftComplete = () => {
    setShowCompletion(false);
    setSelectedShift(null);
  };

  const handleConflictFound = (conflicts: Shift[]) => {
    // You could show a modal or notification here
    console.log('Conflicts found:', conflicts);
  };

  if (!user) {
    return <ErrorMessage message="Please sign in to access the volunteer portal" />;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          View your shifts and find new opportunities
        </p>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Available Shifts
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <VolunteerDashboard />
      ) : (
        <div>
          <div className="mb-8">
            <label htmlFor="festival" className="block text-sm font-medium text-gray-700">
              Select Festival
            </label>
            <select
              id="festival"
              value={selectedFestival || ''}
              onChange={(e) => setSelectedFestival(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a festival...</option>
              {festivals.map((festival) => (
                <option key={festival.id} value={festival.id}>
                  {festival.name} - {new Date(festival.start_date).toLocaleDateString()} to{' '}
                  {new Date(festival.end_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedFestival ? (
            <>
              <ShiftList
                festivalId={selectedFestival}
                onShiftSelect={handleShiftSelect}
              />
              {selectedShift && (
                <ShiftConflictCheck
                  shift={selectedShift}
                  onConflictFound={handleConflictFound}
                />
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">
                Please select a festival to view available shifts
              </p>
            </div>
          )}
        </div>
      )}

      {showCompletion && selectedShift && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <ShiftCompletion
              shift={selectedShift}
              onComplete={handleShiftComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteer; 