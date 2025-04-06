import { useState, useEffect } from 'react';
import { Festival } from '../../services/festivalService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface FestivalListProps {
  festivals: Festival[];
  onFestivalClick: (festival: Festival) => void;
  loading?: boolean;
  error?: string | null;
}

const FestivalList = ({ festivals, onFestivalClick, loading, error }: FestivalListProps) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const filteredFestivals = festivals.filter(festival => {
    if (filter === 'all') return true;
    return festival.status === filter;
  });

  const sortedFestivals = [...filteredFestivals].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Festivals</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFestivals.map((festival) => (
          <div
            key={festival.id}
            onClick={() => onFestivalClick(festival)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{festival.name}</h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  festival.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : festival.status === 'planning'
                    ? 'bg-blue-100 text-blue-800'
                    : festival.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {festival.status.charAt(0).toUpperCase() + festival.status.slice(1)}
              </span>
            </div>
            
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{festival.description}</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {festival.location}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(festival.start_date).toLocaleDateString()} - {new Date(festival.end_date).toLocaleDateString()}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Max Volunteers: {festival.max_volunteers}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedFestivals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No festivals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FestivalList; 