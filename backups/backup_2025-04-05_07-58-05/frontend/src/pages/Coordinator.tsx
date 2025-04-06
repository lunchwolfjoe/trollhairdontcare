import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { festivalService, Festival } from '../services/festivalService';
import ShiftManagement from '../components/coordinators/ShiftManagement';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Coordinator = () => {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedFestival, setSelectedFestival] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const data = await festivalService.getActiveFestivals();
      setFestivals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch festivals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Coordinator Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage shifts and volunteers for your festivals
        </p>
      </div>

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
        <ShiftManagement festivalId={selectedFestival} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">
            Please select a festival to manage its shifts
          </p>
        </div>
      )}
    </div>
  );
};

export default Coordinator; 