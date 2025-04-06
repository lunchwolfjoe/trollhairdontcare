import { useState, useEffect } from 'react';
import { Festival, FestivalCreate, FestivalUpdate } from '../../services/festivalService';
import ErrorMessage from '../common/ErrorMessage';

interface FestivalFormProps {
  festival?: Festival;
  onSubmit: (data: FestivalCreate | FestivalUpdate) => Promise<void>;
  onCancel: () => void;
}

const FestivalForm = ({ festival, onSubmit, onCancel }: FestivalFormProps) => {
  const [formData, setFormData] = useState<FestivalCreate>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    location: '',
    max_volunteers: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (festival) {
      setFormData({
        name: festival.name,
        description: festival.description,
        start_date: festival.start_date.split('T')[0],
        end_date: festival.end_date.split('T')[0],
        status: festival.status,
        location: festival.location,
        max_volunteers: festival.max_volunteers,
      });
    }
  }, [festival]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (festival) {
        await onSubmit({ ...formData, id: festival.id });
      } else {
        await onSubmit(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the festival');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_volunteers' ? parseInt(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Festival Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="max_volunteers" className="block text-sm font-medium text-gray-700">
          Maximum Volunteers
        </label>
        <input
          type="number"
          id="max_volunteers"
          name="max_volunteers"
          value={formData.max_volunteers}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : festival ? 'Update Festival' : 'Create Festival'}
        </button>
      </div>
    </form>
  );
};

export default FestivalForm; 