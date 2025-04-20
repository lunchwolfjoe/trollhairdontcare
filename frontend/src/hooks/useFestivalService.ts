import { useEffect, useMemo } from 'react';
import { festivalService } from '../services/festivalService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to use the festival service with authentication
 */
export const useFestivalService = () => {
  const auth = useAuth();
  
  // Set auth context immediately and whenever it changes
  useEffect(() => {
    console.log('Setting auth context on festival service', {
      hasAuth: !!auth,
      isAuthenticated: !!auth?.user,
      hasUser: !!auth?.user,
    });
    
    // Adapt to the format expected by festival service
    const authAdapted = {
      user: auth.user,
      authenticated: !!auth.user,
      sessionToken: auth.user ? 'session-token-available' : null,
      getAuthHeaders: () => ({
        'apikey': 'ANON_KEY', // Replace with actual key from env if needed
        'Authorization': `Bearer ${auth.user ? 'session-token-available' : 'no-token'}`,
        'Content-Type': 'application/json'
      })
    };
    
    // @ts-ignore - Service might have different expectations
    festivalService.setAuthContext(authAdapted);
  }, [auth, auth?.user]);
  
  // Also set it immediately for immediate use
  const authAdapted = {
    user: auth.user,
    authenticated: !!auth.user,
    sessionToken: auth.user ? 'session-token-available' : null,
    getAuthHeaders: () => ({
      'apikey': 'ANON_KEY', // Replace with actual key from env if needed
      'Authorization': `Bearer ${auth.user ? 'session-token-available' : 'no-token'}`,
      'Content-Type': 'application/json'
    })
  };
  
  // @ts-ignore - Service might have different expectations
  festivalService.setAuthContext(authAdapted);
  
  return festivalService;
}; 