import { supabase } from '../lib/supabase';

interface WeatherForecast {
  id: string;
  timestamp: string;
  forecast_time: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  precipitation: number;
  conditions: string;
  alert_level: 'normal' | 'caution' | 'warning' | 'critical';
}

interface WeatherForecastSettings {
  id: string;
  api_key: string;
  location_lat: number;
  location_lon: number;
  update_interval: number;
  last_updated: string;
}

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
  async fetchForecastSettings(): Promise<WeatherForecastSettings | null> {
    const { data, error } = await supabase
      .from('weather_forecast_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateForecastSettings(settings: Partial<WeatherForecastSettings>): Promise<void> {
    const { error } = await supabase
      .from('weather_forecast_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) throw error;
  },

  async fetchWeatherForecast(): Promise<WeatherForecast[]> {
    const { data, error } = await supabase
      .from('weather_forecasts')
      .select('*')
      .gte('forecast_time', new Date().toISOString())
      .order('forecast_time', { ascending: true })
      .limit(24);

    if (error) throw error;
    return data;
  },

  async fetchOpenWeatherForecast(lat: number, lon: number, apiKey: string): Promise<any> {
    const response = await fetch(
      `${OPENWEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather forecast');
    }

    return response.json();
  },

  async updateForecastFromAPI(): Promise<void> {
    const settings = await this.fetchForecastSettings();
    if (!settings) {
      throw new Error('Weather forecast settings not found');
    }

    const forecastData = await this.fetchOpenWeatherForecast(
      settings.location_lat,
      settings.location_lon,
      settings.api_key
    );

    const forecasts = forecastData.list.map((item: any) => ({
      timestamp: new Date().toISOString(),
      forecast_time: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
      wind_direction: this.getWindDirection(item.wind.deg),
      precipitation: item.rain?.['3h'] || 0,
      conditions: item.weather[0].description,
      alert_level: this.calculateAlertLevel(item),
    }));

    const { error } = await supabase
      .from('weather_forecasts')
      .insert(forecasts);

    if (error) throw error;
  },

  getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  },

  calculateAlertLevel(weatherData: any): 'normal' | 'caution' | 'warning' | 'critical' {
    const settings = this.fetchForecastSettings();
    if (!settings) return 'normal';

    const { temperature, wind_speed, precipitation, humidity } = weatherData.main;
    let alertLevel: 'normal' | 'caution' | 'warning' | 'critical' = 'normal';

    // Temperature checks
    if (temperature < settings.temperature_threshold_min - 10 || 
        temperature > settings.temperature_threshold_max + 10) {
      alertLevel = 'critical';
    } else if (temperature < settings.temperature_threshold_min - 5 || 
               temperature > settings.temperature_threshold_max + 5) {
      alertLevel = 'warning';
    } else if (temperature < settings.temperature_threshold_min || 
               temperature > settings.temperature_threshold_max) {
      alertLevel = 'caution';
    }

    // Wind speed checks
    if (wind_speed > settings.wind_speed_threshold * 1.5) {
      alertLevel = 'critical';
    } else if (wind_speed > settings.wind_speed_threshold) {
      alertLevel = Math.max(alertLevel, 'warning');
    }

    // Precipitation checks
    if (precipitation > settings.precipitation_threshold * 2) {
      alertLevel = 'critical';
    } else if (precipitation > settings.precipitation_threshold) {
      alertLevel = Math.max(alertLevel, 'warning');
    }

    // Humidity checks
    if (humidity > settings.humidity_threshold_max) {
      alertLevel = Math.max(alertLevel, 'caution');
    }

    return alertLevel;
  },
}; 