import { supabase } from '../supabaseClient';
import { ApiResponse, handleError } from './api';

// Weather service constants
// Update the API key with the new one provided
const API_KEY = 'ec84afbd4bf13bc1ea6f79e8bea8ba01';

// Define a type for the location structure
interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
}

// Define the weather settings interface
export interface WeatherSettings {
  location_name: string;
  location_lat: number;
  location_lon: number;
  units: string;
  update_interval: number;
}

// Updated WeatherSettings DB Row structure based on supabase.ts
interface WeatherSettingsDBRow {
  id?: number;
  user_id: string; // Assuming user_id is the PK/FK
  location: string; // Likely storing name or identifier
  api_key: string; // Store API key here? Be cautious with security.
  units: string;
  update_interval?: number; // Make optional if not always present
  location_lat?: number; // Add if in DB
  location_lon?: number; // Add if in DB
  created_at?: string;
}

export class WeatherService {
  // Define the default location object with necessary properties
  static readonly DEFAULT_LOCATION: WeatherLocation = {
    name: 'Kerrville, TX',
    lat: 30.0469,
    lon: -99.1403
  };

  /**
   * Gets the current weather for a location
   */
  getCurrentWeather = async (lat = WeatherService.DEFAULT_LOCATION.lat, lon = WeatherService.DEFAULT_LOCATION.lon): Promise<ApiResponse<any>> => {
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
      return { data: null, error: handleError(error) };
    }
  };

  /**
   * Gets the weather forecast for a location
   */
  getWeatherForecast = async (lat = WeatherService.DEFAULT_LOCATION.lat, lon = WeatherService.DEFAULT_LOCATION.lon): Promise<ApiResponse<any>> => {
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
      return { data: null, error: handleError(error) };
    }
  };

  async getSettings(userId: string): Promise<ApiResponse<WeatherSettings | null>> {
    try {
      // Fetch using DB Row type
      const { data, error } = await supabase
        .from('weather_forecast_settings')
        .select('*') 
        .eq('user_id', userId)
        .maybeSingle<WeatherSettingsDBRow>(); // Specify DB row type here
      
      if (error) {
        if (error.code === 'PGRST116') { return { data: null, error: null }; }
        return { data: null, error: handleError(error) };
      }
      // Map DB Row to App settings type
      const appSettings: WeatherSettings | null = data ? {
          location_name: data.location || WeatherService.DEFAULT_LOCATION.name, // Map location to name
          location_lat: data.location_lat || WeatherService.DEFAULT_LOCATION.lat,
          location_lon: data.location_lon || WeatherService.DEFAULT_LOCATION.lon,
          units: data.units || 'imperial',
          update_interval: data.update_interval || 3600,
      } : null;
      return { data: appSettings, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async saveSettings(userId: string, settings: WeatherSettings): Promise<ApiResponse<WeatherSettings>> {
     try {
        // Map App settings to correct DB Row structure for upsert
        const dataToUpsert: Partial<WeatherSettingsDBRow> = {
          user_id: userId,
          location: settings.location_name,
          units: settings.units,
          update_interval: settings.update_interval,
          // Only include lat/lon if they actually exist in the DB schema
          // location_lat: settings.location_lat,
          // location_lon: settings.location_lon,
          // api_key needs separate handling
        };
        
        const { data, error } = await supabase
           .from('weather_forecast_settings')
           // Ensure dataToUpsert matches the actual DB table insert/update type
           .upsert(dataToUpsert as any, { onConflict: 'user_id' }) // Cast to any if strict type match fails
           .select() 
           .single<WeatherSettingsDBRow>(); 
           
        if (error) {
           return { data: null, error: handleError(error) };
        }
        // Map returned DB row back to App settings type
        const savedAppSettings: WeatherSettings | null = data ? {
            location_name: data.location || WeatherService.DEFAULT_LOCATION.name,
            location_lat: data.location_lat || WeatherService.DEFAULT_LOCATION.lat,
            location_lon: data.location_lon || WeatherService.DEFAULT_LOCATION.lon,
            units: data.units || 'imperial',
            update_interval: data.update_interval || 3600,
        } : null;
        
        return { data: savedAppSettings as WeatherSettings | null, error: null };
     } catch(error) {
        return { data: null, error: handleError(error) };
     }
  }
}

export const weatherService = new WeatherService(); 