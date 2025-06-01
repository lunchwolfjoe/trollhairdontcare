import { useEffect, useMemo } from 'react';
import { festivalService } from '../lib/services/festivalService';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

/**
 * Hook to use the festival service with authentication
 */
export const useFestivalService = () => {
  const auth = useSimpleAuth();
  
  // Set auth context immediately and whenever it changes
  useEffect(() => {
    console.log('Setting auth context on festival service', {
      hasAuth: !!auth,
      isAuthenticated: !!auth?.user && !!auth?.sessionToken,
      hasUser: !!auth?.user,
      hasToken: !!auth?.sessionToken
    });
    
    festivalService.setAuthContext(auth);
  }, [auth, auth?.user, auth?.sessionToken]);
  
  // Also set it immediately for the current render
  festivalService.setAuthContext(auth);
  
  return festivalService;
}; 