import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Initialize the Supabase client with the URL and anon key from environment variables or config fallback
const supabaseUrl = config.supabaseUrl;
// Use the correct API key from environment variables or config fallback
const correctKey = config.supabaseAnonKey;

// Log error if env variables not found - this helps debugging Vercel deployments
if (!supabaseUrl || !correctKey) {
  console.error('Supabase environment variables are missing!', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: correctKey ? 'Found' : 'Missing'
  });
}

// Enhanced logging of configuration
console.log('Supabase Config (FORCE_JSON_HEADER):', {
  url: supabaseUrl,
  keyPrefix: correctKey ? correctKey.substring(0, 10) + '...' : 'Missing key',
});

// Override fetch to ensure correct headers
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
  let finalOptions = { ...options };
  // Check if this is a Supabase request based on the URL
  const isSupabaseRequest = url.toString().includes(supabaseUrl);
  
  if (isSupabaseRequest) {
    // Get the current auth token from localStorage
    const authToken = localStorage.getItem('supabase_auth_token') || correctKey;
    
    console.log('Intercepting Supabase request:', 
      url.toString().substring(0, 60) + '...', 
      'Method:', finalOptions.method,
      'Using token:', authToken === correctKey ? 'API KEY' : 'SESSION TOKEN'
    );
    
    const headers = new Headers(finalOptions.headers || {});
    headers.set('apikey', correctKey);
    
    // Always use the most recent token from localStorage if available
    headers.set('Authorization', `Bearer ${authToken}`);
    
    // Force Content-Type to application/json for relevant methods
    if (finalOptions.method === 'POST' || finalOptions.method === 'PATCH' || finalOptions.method === 'PUT') {
        console.log('Forcing Content-Type: application/json');
        headers.set('Content-Type', 'application/json');
    }
    
    // Ensure Accept header is set if not already present
    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    finalOptions.headers = headers;
    
    // Ensure body is stringified if it's an object and method requires it
    if (finalOptions.body && typeof finalOptions.body !== 'string' && (finalOptions.method === 'POST' || finalOptions.method === 'PATCH' || finalOptions.method === 'PUT')) {
      try {
        finalOptions.body = JSON.stringify(finalOptions.body);
      } catch (e) {
        console.error('Failed to stringify request body:', e);
      }
    }

    console.log('Modified headers for Supabase request:', Object.fromEntries(headers.entries()));
  }
  
  try {
    const response = await originalFetch(url, finalOptions);
    
    // Log errors for Supabase requests
    if (isSupabaseRequest && !response.ok) {
      console.error('Supabase request failed:', {
        url: url.toString().substring(0, 60) + '...',
        status: response.status,
        statusText: response.statusText
      });
      
      // Special handling for auth-related errors
      if (response.status === 401) {
        console.warn('Auth token may be invalid, consider refreshing session');
        // Clone response before reading it
        const clonedResponse = response.clone();
        try {
          const errorData = await clonedResponse.json();
          console.error('Auth error details:', errorData);
        } catch (e) {
          console.error('Could not parse auth error response');
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('Network error in fetch:', error.message);
    throw error;
  }
};

// Create the Supabase client with persistent sessions
const supabaseInstance = createClient(supabaseUrl, correctKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        const value = localStorage.getItem(key);
        console.log(`Auth storage: GET ${key}`, value ? value.substring(0, 15) + '...' : 'null');
        return value;
      },
      setItem: (key, value) => {
        console.log(`Auth storage: SET ${key}`, value ? value.substring(0, 15) + '...' : 'null');
        localStorage.setItem(key, value);
        
        // If this is a new auth token, sync with our custom key
        if (key === 'supabase.auth.token' && value) {
          try {
            const data = JSON.parse(value);
            if (data?.access_token) {
              console.log('Syncing access_token to supabase_auth_token');
              localStorage.setItem('supabase_auth_token', data.access_token);
            }
          } catch (e) {
            console.error('Error syncing token:', e);
          }
        }
      },
      removeItem: (key) => {
        console.log(`Auth storage: REMOVE ${key}`);
        localStorage.removeItem(key);
        
        // Also remove our custom token if auth token is removed
        if (key === 'supabase.auth.token') {
          localStorage.removeItem('supabase_auth_token');
        }
      }
    }
  },
  global: {
    headers: { 
      'X-Client-Info': 'trollhairdontcare' 
    }
  }
});

// Add URL and key as properties for easy access
supabaseInstance.supabaseUrl = supabaseUrl;
supabaseInstance.supabaseKey = correctKey;

// Override auth methods to ensure token consistency
const originalGetSession = supabaseInstance.auth.getSession.bind(supabaseInstance.auth);
const originalGetUser = supabaseInstance.auth.getUser.bind(supabaseInstance.auth);
const originalSignIn = supabaseInstance.auth.signInWithPassword.bind(supabaseInstance.auth);
const originalSignOut = supabaseInstance.auth.signOut.bind(supabaseInstance.auth);

// Override getSession to check localStorage first
supabaseInstance.auth.getSession = async function() {
  console.log('Enhanced getSession called');
  const result = await originalGetSession();
  
  // If session found, sync with our custom storage
  if (result.data?.session?.access_token) {
    localStorage.setItem('supabase_auth_token', result.data.session.access_token);
  }
  
  return result;
};

// Override getUser to use token from localStorage if available
supabaseInstance.auth.getUser = async function(jwt = null) {
  console.log('Enhanced getUser called', jwt ? 'with token' : 'without token');
  
  // If no token provided but we have one in localStorage, use it
  if (!jwt && localStorage.getItem('supabase_auth_token')) {
    jwt = localStorage.getItem('supabase_auth_token');
    console.log('Using token from localStorage');
  }
  
  return await originalGetUser(jwt);
};

// Override signIn to sync token with localStorage
supabaseInstance.auth.signInWithPassword = async function(credentials) {
  console.log('Enhanced signInWithPassword called');
  const result = await originalSignIn(credentials);
  
  if (result.data?.session?.access_token) {
    localStorage.setItem('supabase_auth_token', result.data.session.access_token);
    console.log('Stored auth token in localStorage');
  }
  
  return result;
};

// Override signOut to clear localStorage
supabaseInstance.auth.signOut = async function(options) {
  console.log('Enhanced signOut called');
  localStorage.removeItem('supabase_auth_token');
  return await originalSignOut(options);
};

// Add helper method for direct fetch
supabaseInstance.directFetch = async (endpoint, options = {}) => {
  try {
    // Ensure endpoint is formatted correctly
    const cleanEndpoint = endpoint.replace(/^\/?rest\/v1\//i, '');
    const url = `${supabaseUrl}/rest/v1/${cleanEndpoint}`;
    
    // Use the current auth token from localStorage if available
    const authToken = localStorage.getItem('supabase_auth_token') || correctKey;
    
    const headers = {
      'apikey': correctKey,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Direct fetch via helper to: ${url}, using ${authToken === correctKey ? 'API KEY' : 'SESSION TOKEN'}`);
    
    const response = await originalFetch(url, {
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      ...(options.body && { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) }),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error('Direct fetch error:', err);
    return { data: [], error: err };
  }
};

// Export as a named export
export const supabase = supabaseInstance;

// Direct data access - guaranteed to use the correct key
export const directFetch = async (endpoint, options = {}) => {
  return supabaseInstance.directFetch(endpoint, options);
};

// Test function that can be called directly from the console
export const testApi = async () => {
  try {
    console.log('Testing API with correct key...');
    const result = await directFetch('festivals?select=*&limit=5');
    console.log('API test result:', result);
    return result;
  } catch (err) {
    console.error('API test failed:', err);
    return { success: false, error: err };
  }
};

// Session refresh function
export const forceRefreshSession = async () => {
  try {
    console.log('Forcing session refresh...');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh failed:', error);
      return { success: false, error };
    }
    
    if (data?.session?.access_token) {
      localStorage.setItem('supabase_auth_token', data.session.access_token);
      console.log('Session refreshed successfully, token updated');
      return { success: true, data };
    } else {
      console.warn('No session found after refresh');
      return { success: false, error: new Error('No session found') };
    }
  } catch (err) {
    console.error('Session refresh failed with exception:', err);
    return { success: false, error: err };
  }
};

// Expose for easy access in console
window.testSupabaseApi = testApi;
window.refreshSupabaseSession = forceRefreshSession;

// Also export as default
export default supabaseInstance; 