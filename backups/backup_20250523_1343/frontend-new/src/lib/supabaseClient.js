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
  
  // Alert developers in development mode
  if (import.meta.env.DEV) {
    console.warn('Running in development mode with missing Supabase credentials!');
    // Don't show alert immediately to avoid blocking UI
    setTimeout(() => {
      alert('Supabase credentials missing. Check console for details.');
    }, 1000);
  }
}

// Enhanced logging of configuration
console.log('Supabase Config (initialized):', {
  url: supabaseUrl,
  keyPrefix: correctKey ? correctKey.substring(0, 5) + '...' : 'Missing key',
  mode: import.meta.env.DEV ? 'development' : 'production'
});

// Make fetch function globally available before overriding
// This ensures it exists even if window.fetch is undefined somehow
const originalFetch = (...args) => {
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch(...args);
  }
  
  console.error('window.fetch is not available, using fallback');
  // Return a mock response if fetch isn't available
  return Promise.resolve({
    ok: false,
    status: 500,
    statusText: 'Fetch not available',
    json: () => Promise.resolve({ error: 'Fetch API not available' })
  });
};

// Safely override fetch to ensure correct headers
if (typeof window !== 'undefined') {
  window.fetch = async function(url, options = {}) {
    let finalOptions = { ...options };
    
    try {
      // Check if this is a Supabase request based on the URL
      const isSupabaseRequest = url.toString().includes(supabaseUrl);
      
      if (isSupabaseRequest) {
        // Get the current auth token from localStorage safely
        let authToken;
        try {
          authToken = localStorage.getItem('supabase_auth_token') || correctKey;
        } catch (e) {
          console.warn('Could not access localStorage for auth token, using API key');
          authToken = correctKey;
        }
        
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
    } catch (headerError) {
      console.error('Error preparing request headers:', headerError);
      // Continue with original options if header preparation fails
    }
    
    try {
      const response = await originalFetch(url, finalOptions);
      
      // Check if this is a Supabase request based on the URL (inside try/catch for safety)
      try {
        const isSupabaseRequest = url.toString().includes(supabaseUrl);
        
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
      } catch (logError) {
        console.error('Error in response logging:', logError);
      }
      
      return response;
    } catch (error) {
      console.error('Network error in fetch:', error.message);
      throw error;
    }
  };
}

// Store client options for better error reporting
const clientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          console.log(`Auth storage: GET ${key}`, value ? value.substring(0, 15) + '...' : 'null');
          return value;
        } catch (e) {
          console.error('Error reading from localStorage:', e);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
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
        } catch (e) {
          console.error('Error writing to localStorage:', e);
        }
      },
      removeItem: (key) => {
        try {
          console.log(`Auth storage: REMOVE ${key}`);
          localStorage.removeItem(key);
          
          // Also remove our custom token if auth token is removed
          if (key === 'supabase.auth.token') {
            localStorage.removeItem('supabase_auth_token');
          }
        } catch (e) {
          console.error('Error removing from localStorage:', e);
        }
      }
    }
  },
  global: {
    headers: { 
      'X-Client-Info': 'trollhairdontcare' 
    }
  }
};

// Create the Supabase client with persistent sessions
let supabaseInstance;

try {
  supabaseInstance = createClient(supabaseUrl, correctKey, clientOptions);
  
  // Add URL and key as properties for easy access
  supabaseInstance.supabaseUrl = supabaseUrl;
  supabaseInstance.supabaseKey = correctKey;
  
  // Mark client as initialized
  supabaseInstance.initialized = true;
  console.log('Supabase client initialized successfully');
} catch (initError) {
  console.error('Failed to initialize Supabase client:', initError);
  
  // Create fallback client that won't throw errors
  supabaseInstance = {
    supabaseUrl,
    supabaseKey: correctKey,
    initialized: false,
    _initError: initError,
    
    // Add fallback auth methods
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Client initialization failed' } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Client initialization failed' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }),
      signOut: () => Promise.resolve({ error: null }),
      refreshSession: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }),
    },
    
    // Add basic method to check health
    from: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } })
    }),
    
    // Diagnostic method to report error
    getInitError: () => initError
  };
}

// Override auth methods to ensure token consistency
if (supabaseInstance.initialized) {
  const originalGetSession = supabaseInstance.auth.getSession.bind(supabaseInstance.auth);
  const originalGetUser = supabaseInstance.auth.getUser.bind(supabaseInstance.auth);
  const originalSignIn = supabaseInstance.auth.signInWithPassword.bind(supabaseInstance.auth);
  const originalSignOut = supabaseInstance.auth.signOut.bind(supabaseInstance.auth);

  // Override getSession to check localStorage first
  supabaseInstance.auth.getSession = async function() {
    try {
      console.log('Enhanced getSession called');
      const result = await originalGetSession();
      
      // If session found, sync with our custom storage
      if (result.data?.session?.access_token) {
        try {
          localStorage.setItem('supabase_auth_token', result.data.session.access_token);
        } catch (e) {
          console.error('Error syncing token to localStorage:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in getSession:', error);
      return { data: { session: null }, error };
    }
  };

  // Override getUser to use token from localStorage if available
  supabaseInstance.auth.getUser = async function(jwt = null) {
    try {
      console.log('Enhanced getUser called', jwt ? 'with token' : 'without token');
      
      // If no token provided but we have one in localStorage, use it
      let finalJwt = jwt;
      if (!finalJwt) {
        try {
          finalJwt = localStorage.getItem('supabase_auth_token');
          if (finalJwt) {
            console.log('Using token from localStorage');
          }
        } catch (e) {
          console.error('Error reading token from localStorage:', e);
        }
      }
      
      return await originalGetUser(finalJwt);
    } catch (error) {
      console.error('Error in getUser:', error);
      return { data: { user: null }, error };
    }
  };

  // Override signIn to sync token with localStorage
  supabaseInstance.auth.signInWithPassword = async function(credentials) {
    try {
      console.log('Enhanced signInWithPassword called');
      const result = await originalSignIn(credentials);
      
      if (result.data?.session?.access_token) {
        try {
          localStorage.setItem('supabase_auth_token', result.data.session.access_token);
          console.log('Stored auth token in localStorage');
        } catch (e) {
          console.error('Error storing token in localStorage:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in signInWithPassword:', error);
      return { data: null, error };
    }
  };

  // Override signOut to clear localStorage
  supabaseInstance.auth.signOut = async function(options) {
    try {
      console.log('Enhanced signOut called');
      try {
        localStorage.removeItem('supabase_auth_token');
      } catch (e) {
        console.error('Error removing token from localStorage:', e);
      }
      return await originalSignOut(options);
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    }
  };
}

// Add helper method for direct fetch
supabaseInstance.directFetch = async (endpoint, options = {}) => {
  try {
    if (!supabaseInstance.initialized) {
      return { data: [], error: new Error('Supabase client not initialized') };
    }
    
    // Ensure endpoint is formatted correctly
    const cleanEndpoint = endpoint.replace(/^\/?rest\/v1\//i, '');
    const url = `${supabaseUrl}/rest/v1/${cleanEndpoint}`;
    
    // Use the current auth token from localStorage if available
    let authToken;
    try {
      authToken = localStorage.getItem('supabase_auth_token') || correctKey;
    } catch (e) {
      console.warn('Could not access localStorage for auth token, using API key');
      authToken = correctKey;
    }
    
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

// Test function that can be called directly from the console
export const testApi = async () => {
  try {
    console.log('Testing API connection with these settings:', {
      url: supabaseUrl,
      keyAvailable: !!correctKey,
      clientInitialized: !!supabaseInstance.initialized,
      endpoint: 'festivals?select=*&limit=5'
    });

    // First check if the client is properly initialized
    if (!supabaseInstance.initialized) {
      console.error('API test failed: Supabase client not initialized');
      return { 
        success: false, 
        error: new Error('Supabase client not initialized'),
        details: {
          url: supabaseUrl,
          keyAvailable: !!correctKey,
          message: 'The Supabase client was not properly initialized'
        }
      };
    }

    // Try a fetch that deliberately avoids localStorage to test the connection
    console.log('Testing direct API connection...');
    
    const testUrl = `${supabaseUrl}/rest/v1/festivals?select=*&limit=5`;
    console.log(`Sending request to: ${testUrl}`);
    
    const testHeaders = {
      'apikey': correctKey,
      'Authorization': `Bearer ${correctKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const testResponse = await originalFetch(testUrl, {
      method: 'GET',
      headers: testHeaders
    });
    
    console.log('Direct API test response:', {
      ok: testResponse.ok,
      status: testResponse.status,
      statusText: testResponse.statusText
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('API test failed with status:', testResponse.status, errorText);
      return { 
        success: false, 
        error: new Error(`API Error: ${testResponse.status} ${testResponse.statusText}`),
        details: {
          statusCode: testResponse.status,
          response: errorText,
          url: testUrl
        }
      };
    }
    
    const testData = await testResponse.json();
    console.log('API test succeeded:', testData);
    
    return { 
      success: true, 
      data: testData,
      details: {
        method: 'Direct fetch',
        url: testUrl,
        recordCount: Array.isArray(testData) ? testData.length : 'Not an array'
      }
    };
  } catch (err) {
    console.error('API test failed with exception:', err);
    return { 
      success: false, 
      error: err,
      details: {
        message: err.message,
        stack: err.stack,
        name: err.name
      }
    };
  }
};

// Session refresh function
export const forceRefreshSession = async () => {
  try {
    if (!supabaseInstance.initialized) {
      return { success: false, error: new Error('Supabase client not initialized') };
    }
    
    console.log('Forcing session refresh...');
    const { data, error } = await supabaseInstance.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh failed:', error);
      return { success: false, error };
    }
    
    if (data?.session?.access_token) {
      try {
        localStorage.setItem('supabase_auth_token', data.session.access_token);
        console.log('Session refreshed successfully, token updated');
      } catch (e) {
        console.error('Error storing refreshed token:', e);
      }
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
if (typeof window !== 'undefined') {
  window.testSupabaseApi = testApi;
  window.refreshSupabaseSession = forceRefreshSession;
  window.supabaseClient = supabaseInstance;
}

// Export as a named export
export const supabase = supabaseInstance;

// Direct data access - guaranteed to use the correct key
export const directFetch = async (endpoint, options = {}) => {
  return supabaseInstance.directFetch(endpoint, options);
};

// Also export as default
export default supabaseInstance; 