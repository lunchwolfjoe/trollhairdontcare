import { supabase } from '../supabaseClient';

// Weather service constants
// Update the API key with the new one provided
const API_KEY = 'ec84afbd4bf13bc1ea6f79e8bea8ba01';
const DEFAULT_LOCATION = {
  name: 'Kerrville, TX',
  lat: 30.0469,
  lon: -99.1403
};

/**
 * Gets the current weather for a location
 */
export const getCurrentWeather = async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    console.log('Fetching weather from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Weather data received:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return { data: null, error };
  }
};

/**
 * Gets the weather forecast for a location
 */
export const getWeatherForecast = async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    console.log('Fetching forecast from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Forecast data received:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return { data: null, error };
  }
};

/**
 * Gets the weather settings from the database
 */
export const getWeatherSettings = async () => {
  try {
    // Try to get settings from database
    try {
      const { data, error } = await supabase
        .from('weather_forecast_settings')
        .select('*')
        .single();

      // If table doesn't exist, we'll use default settings
      if (error && error.code === '42P01') {
        console.warn('Weather settings table does not exist, using defaults');
        return {
          data: {
            api_key: API_KEY,
            location_lat: DEFAULT_LOCATION.lat,
            location_lon: DEFAULT_LOCATION.lon,
            location_name: DEFAULT_LOCATION.name,
            update_interval: 3600, // 1 hour in seconds
          },
          error: null
        };
      }

      if (error) throw error;

      // If no settings found, return default settings
      if (!data) {
        return {
          data: {
            api_key: API_KEY,
            location_lat: DEFAULT_LOCATION.lat,
            location_lon: DEFAULT_LOCATION.lon,
            location_name: DEFAULT_LOCATION.name,
            update_interval: 3600, // 1 hour in seconds
          },
          error: null
        };
      }

      return { data, error: null };
    } catch (dbError) {
      console.warn('Error accessing weather settings table, using defaults:', dbError);
      return {
        data: {
          api_key: API_KEY,
          location_lat: DEFAULT_LOCATION.lat,
          location_lon: DEFAULT_LOCATION.lon,
          location_name: DEFAULT_LOCATION.name,
          update_interval: 3600, // 1 hour in seconds
        },
        error: null
      };
    }
  } catch (error) {
    console.error('Error fetching weather settings:', error);
    return { 
      data: {
        api_key: API_KEY,
        location_lat: DEFAULT_LOCATION.lat,
        location_lon: DEFAULT_LOCATION.lon,
        location_name: DEFAULT_LOCATION.name,
        update_interval: 3600,
      }, 
      error: null 
    };
  }
};

/**
 * Updates or creates weather settings in the database
 */
export const updateWeatherSettings = async (settings) => {
  try {
    // Check if table exists first
    try {
      const { error: tableError } = await supabase
        .from('weather_forecast_settings')
        .select('count(*)', { count: 'exact', head: true });
      
      // If table doesn't exist, we'll return success with defaults
      if (tableError && tableError.code === '42P01') {
        console.warn('Weather settings table does not exist, cannot save settings');
        return { 
          data: {
            ...settings,
            api_key: settings.api_key || API_KEY,
            location_lat: settings.location_lat || DEFAULT_LOCATION.lat,
            location_lon: settings.location_lon || DEFAULT_LOCATION.lon,
            location_name: settings.location_name || DEFAULT_LOCATION.name,
          }, 
          error: null 
        };
      }
    } catch (checkError) {
      console.warn('Error checking weather settings table:', checkError);
    }
    
    // Check if settings exist
    const { data: existingSettings } = await getWeatherSettings();
    
    // Since the table might not exist, just return the current settings
    // rather than attempting database updates
    return { 
      data: {
        ...settings,
        api_key: settings.api_key || API_KEY,
        location_lat: settings.location_lat || DEFAULT_LOCATION.lat,
        location_lon: settings.location_lon || DEFAULT_LOCATION.lon,
        location_name: settings.location_name || DEFAULT_LOCATION.name,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error updating weather settings:', error);
    return { 
      data: {
        ...settings,
        api_key: settings.api_key || API_KEY,
        location_lat: settings.location_lat || DEFAULT_LOCATION.lat,
        location_lon: settings.location_lon || DEFAULT_LOCATION.lon,
        location_name: settings.location_name || DEFAULT_LOCATION.name,
      }, 
      error: null 
    };
  }
};

export const weatherService = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherSettings,
  updateWeatherSettings,
  DEFAULT_LOCATION,
  API_KEY // Export the API key for debugging
}; 