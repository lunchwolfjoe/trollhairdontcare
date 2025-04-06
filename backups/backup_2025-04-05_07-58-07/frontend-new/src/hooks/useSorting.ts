import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface SortingHookResult {
  sortConfig: SortConfig | null;
  requestSort: (key: string) => void;
  resetSort: () => void;
  getSortedData: <T>(data: T[]) => T[];
}

/**
 * Custom hook for handling table sorting
 */
const useSorting = <T>(
  initialSortKey: string = '',
  initialDirection: SortDirection = 'asc',
  sortFn?: (a: T, b: T, config: SortConfig) => number
): SortingHookResult => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSortKey ? { key: initialSortKey, direction: initialDirection } : null
  );

  // Request a sort on a specific key
  const requestSort = useCallback((key: string) => {
    setSortConfig((prevConfig) => {
      // If we're already sorting by this key, toggle direction
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      
      // Otherwise, sort by this key in ascending order
      return { key, direction: 'asc' };
    });
  }, []);

  // Reset sorting
  const resetSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  // Default sort function that works with primitive values and strings
  const defaultSortFn = useCallback((a: T, b: T, config: SortConfig) => {
    const valueA = (a as any)[config.key];
    const valueB = (b as any)[config.key];

    // Handle undefined or null values
    if (valueA == null) return config.direction === 'asc' ? -1 : 1;
    if (valueB == null) return config.direction === 'asc' ? 1 : -1;

    // Handle different value types
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return config.direction === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }

    return config.direction === 'asc' 
      ? (valueA > valueB ? 1 : -1) 
      : (valueA > valueB ? -1 : 1);
  }, []);

  // Get sorted data using the current sort configuration
  const getSortedData = useCallback((data: T[]) => {
    if (!sortConfig) return [...data];

    return [...data].sort((a, b) => {
      return sortFn 
        ? sortFn(a, b, sortConfig) 
        : defaultSortFn(a, b, sortConfig);
    });
  }, [sortConfig, defaultSortFn, sortFn]);

  return {
    sortConfig,
    requestSort,
    resetSort,
    getSortedData
  };
};

export { useSorting }; 
