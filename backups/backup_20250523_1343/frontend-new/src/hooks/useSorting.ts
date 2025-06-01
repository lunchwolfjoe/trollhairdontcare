import { useState, useCallback } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SortingHookResult<T> {
  sortConfig: SortConfig | null;
  requestSort: (key: string) => void;
  getSortedData: (data: T[]) => T[];
}

export function useSorting<T>(defaultKey?: string, defaultDirection: 'asc' | 'desc' = 'asc'): SortingHookResult<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultKey ? { key: defaultKey, direction: defaultDirection } : null
  );

  const requestSort = useCallback((key: string) => {
    setSortConfig((currentSort) => {
      if (!currentSort || currentSort.key !== key) {
        return { key, direction: 'asc' };
      }

      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
  }, []);

  const getSortedData = useCallback((data: T[]) => {
    if (!sortConfig) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === bValue) {
        return 0;
      }

      if (aValue === null || aValue === undefined) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }

      if (bValue === null || bValue === undefined) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }

      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string' && 
          (sortConfig.key.includes('date') || sortConfig.key.includes('created_at') || sortConfig.key.includes('updated_at'))) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        const result = dateA < dateB ? -1 : 1;
        return sortConfig.direction === 'asc' ? result : -result;
      }

      // Handle arrays (like skills)
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        const result = aValue.length < bValue.length ? -1 : 1;
        return sortConfig.direction === 'asc' ? result : -result;
      }

      // Handle objects (like profiles)
      if (typeof aValue === 'object' && aValue !== null && 
          typeof bValue === 'object' && bValue !== null) {
        // Try to find a string property to compare
        const aString = Object.values(aValue).find(v => typeof v === 'string') as string | undefined;
        const bString = Object.values(bValue).find(v => typeof v === 'string') as string | undefined;
        
        if (aString && bString) {
          const result = aString < bString ? -1 : 1;
          return sortConfig.direction === 'asc' ? result : -result;
        }
        
        // Fallback to string comparison of the objects
        const aStr = JSON.stringify(aValue);
        const bStr = JSON.stringify(bValue);
        const result = aStr < bStr ? -1 : 1;
        return sortConfig.direction === 'asc' ? result : -result;
      }

      // Default comparison for strings, numbers, etc.
      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [sortConfig]);

  return { sortConfig, requestSort, getSortedData };
}

/**
 * Safely get a nested property from an object using a dot-notation path
 * @param obj The object to get the property from
 * @param path The dot-notation path to the property
 * @returns The value at the path, or null if not found
 */
function getNestedValue<T>(obj: T, path: string): any {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return null;
    
    // Handle array access with square brackets
    const match = part.match(/^([^\[]+)(\[(\d+)\])?$/);
    if (!match) return acc[part];
    
    const [, prop, , index] = match;
    if (index !== undefined) {
      return Array.isArray(acc[prop]) ? acc[prop][parseInt(index, 10)] : null;
    }
    
    return acc[prop];
  }, obj as any);
} 
