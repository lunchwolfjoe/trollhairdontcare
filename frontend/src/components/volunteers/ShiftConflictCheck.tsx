import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { volunteerService, Shift } from '../../services/volunteerService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface ShiftConflictCheckProps {
  shift: Shift;
  onConflictFound: (conflicts: Shift[]) => void;
}

const ShiftConflictCheck = ({ shift, onConflictFound }: ShiftConflictCheckProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Shift[]>([]);

  useEffect(() => {
    checkConflicts();
  }, [shift]);

  const checkConflicts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userShifts = await volunteerService.getVolunteerShifts(user.id);
      const conflictingShifts = userShifts.filter((userShift) => {
        const shiftStart = new Date(shift.start_time);
        const shiftEnd = new Date(shift.end_time);
        const userShiftStart = new Date(userShift.start_time);
        const userShiftEnd = new Date(userShift.end_time);

        return (
          (shiftStart >= userShiftStart && shiftStart < userShiftEnd) ||
          (shiftEnd > userShiftStart && shiftEnd <= userShiftEnd) ||
          (shiftStart <= userShiftStart && shiftEnd >= userShiftEnd)
        );
      });

      setConflicts(conflictingShifts);
      if (conflictingShifts.length > 0) {
        onConflictFound(conflictingShifts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check conflicts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Shift Conflict Detected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              This shift conflicts with the following shifts you are already assigned to:
            </p>
            <ul className="mt-2 list-disc list-inside">
              {conflicts.map((conflict) => (
                <li key={conflict.id}>
                  {conflict.title} -{' '}
                  {new Date(conflict.start_time).toLocaleString()} to{' '}
                  {new Date(conflict.end_time).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftConflictCheck; 