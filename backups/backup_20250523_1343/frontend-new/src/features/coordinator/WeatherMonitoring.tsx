import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AlertColor,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Air as WindIcon,
  WbCloudy as CloudyIcon,
  Thunderstorm as StormIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { weatherService, WeatherSettings } from '../../lib/services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { ApiResponse } from '../../lib/services/api';
import { format } from 'date-fns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

// Weather location type
interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
}

// Define interface for settings state
interface WeatherSettings {
  location_name: string;
  location_lat: number;
  location_lon: number;
  units: string;
  update_interval: number;
}

// Interfaces
interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface CurrentWeather {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  visibility: number;
  name: string;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number; // Probability of precipitation
  rain?: {
    '3h'?: number;
  };
  snow?: {
    '3h'?: number;
  };
  dt_txt: string;
}

interface Alert {
  id: string;
  type: 'temperature' | 'wind' | 'rain' | 'snow';
  description: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error';
  acknowledged: boolean;
}

interface Threshold {
  highTemp: number;
  lowTemp: number;
  highWind: number;
  rainAmount: number;
  snowAmount: number;
}

// Mock data for weather forecast
const mockForecasts = [
  {
    id: '1',
    date: '2024-06-01',
    time: '08:00',
    temperature: 72,
    conditions: 'Sunny',
    precipitation: 0,
    humidity: 45,
    windSpeed: 5,
  },
  {
    id: '2',
    date: '2024-06-01',
    time: '14:00',
    temperature: 78,
    conditions: 'Partly Cloudy',
    precipitation: 10,
    humidity: 50,
    windSpeed: 8,
  },
  {
    id: '3',
    date: '2024-06-01',
    time: '20:00',
    temperature: 65,
    conditions: 'Clear',
    precipitation: 0,
    humidity: 55,
    windSpeed: 4,
  },
  {
    id: '4',
    date: '2024-06-02',
    time: '08:00',
    temperature: 68,
    conditions: 'Cloudy',
    precipitation: 30,
    humidity: 65,
    windSpeed: 10,
  },
  {
    id: '5',
    date: '2024-06-02',
    time: '14:00',
    temperature: 75,
    conditions: 'Rain',
    precipitation: 70,
    humidity: 80,
    windSpeed: 15,
  },
  {
    id: '6',
    date: '2024-06-02',
    time: '20:00',
    temperature: 64,
    conditions: 'Rain',
    precipitation: 60,
    humidity: 75,
    windSpeed: 12,
  },
];

// Mock weather alerts
const mockAlerts = [
  {
    id: '1',
    type: 'High Wind Warning',
    severity: 'warning',
    description: 'Wind speeds may exceed 20mph between 2PM and 5PM tomorrow.',
    startTime: '2024-06-02T14:00:00',
    endTime: '2024-06-02T17:00:00',
    active: true,
    createdAt: '2024-05-31T10:00:00',
  },
  {
    id: '2',
    type: 'Heavy Rain',
    severity: 'high',
    description: 'Potential for heavy rainfall that may affect outdoor activities.',
    startTime: '2024-06-02T13:00:00',
    endTime: '2024-06-02T19:00:00',
    active: true,
    createdAt: '2024-05-31T10:05:00',
  },
  {
    id: '3',
    type: 'Heat Advisory',
    severity: 'moderate',
    description: 'High temperatures expected. Ensure proper hydration stations are available.',
    startTime: '2024-06-01T11:00:00',
    endTime: '2024-06-01T16:00:00',
    active: false,
    createdAt: '2024-05-30T09:00:00',
  },
];

// Mock threshold settings
const mockThresholds = {
  temperature: {
    high: 85,
    low: 45,
    enabled: true,
  },
  precipitation: {
    threshold: 60,
    enabled: true,
  },
  wind: {
    threshold: 15,
    enabled: true,
  },
  updateFrequency: 60, // minutes
};

// Location object structure matching what we need
interface Location {
  name: string;
  lat: number;
  lon: number;
}

// Default location if user hasn't set one
const DEFAULT_LOCATION: Location = {
  name: 'Kerrville, TX',
  lat: 30.0469,
  lon: -99.1403
};

const WeatherMonitoring: React.FC = () => {
  const { user } = useAuth();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // State for weather data
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());
  
  // State for user settings
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [updateInterval, setUpdateInterval] = useState<number>(30); // minutes
  const [units, setUnits] = useState<string>('imperial'); // imperial or metric
  const [thresholds, setThresholds] = useState<Threshold>(mockThresholds as Threshold);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  // Temporary settings for the dialog
  const [tempLocation, setTempLocation] = useState<Location>(location);
  const [tempUpdateInterval, setTempUpdateInterval] = useState<number>(updateInterval);
  const [tempUnits, setTempUnits] = useState<string>(units);
  const [tempThresholds, setTempThresholds] = useState<Threshold>(thresholds);
  
  // Create theme based on user preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [prefersDarkMode],
  );
  
  // Function to fetch weather data
  const fetchWeatherData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Always use mock data
      console.log('Using mock weather data');
      
      // Helper function to generate mock current weather
      const generateMockCurrentWeather = () => ({
        dt: Math.floor(Date.now() / 1000),
        main: {
          temp: 72 + Math.floor(Math.random() * 10),
          feels_like: 70 + Math.floor(Math.random() * 10),
          temp_min: 68,
          temp_max: 82,
          pressure: 1015,
          humidity: 45 + Math.floor(Math.random() * 20)
        },
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        wind: {
          speed: 5 + Math.floor(Math.random() * 10),
          deg: 120
        },
        clouds: {
          all: 20
        },
        visibility: 10000,
        name: location.name || 'Kerrville'
      });
      
      // Helper function to generate mock forecast data
      const generateMockForecast = () => {
        const forecastItems = [];
        const now = new Date();
        
        for (let i = 0; i < 40; i++) {
          const forecastTime = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000));
          forecastItems.push({
            dt: Math.floor(forecastTime.getTime() / 1000),
            main: {
              temp: 70 + Math.floor(Math.random() * 15),
              feels_like: 68 + Math.floor(Math.random() * 15),
              temp_min: 65,
              temp_max: 85,
              pressure: 1015,
              humidity: 45 + Math.floor(Math.random() * 20)
            },
            weather: [{
              id: i % 3 === 0 ? 800 : (i % 3 === 1 ? 801 : 500),
              main: i % 3 === 0 ? 'Clear' : (i % 3 === 1 ? 'Clouds' : 'Rain'),
              description: i % 3 === 0 ? 'clear sky' : (i % 3 === 1 ? 'few clouds' : 'light rain'),
              icon: i % 3 === 0 ? '01d' : (i % 3 === 1 ? '02d' : '10d')
            }],
            wind: {
              speed: 3 + Math.floor(Math.random() * 15),
              deg: 120
            },
            visibility: 10000,
            pop: Math.random() * 0.5,
            dt_txt: forecastTime.toISOString()
          });
        }
        
        return {
          list: forecastItems
        };
      };
      
      setTimeout(() => {
        setCurrentWeather(generateMockCurrentWeather());
        setForecast(generateMockForecast().list);
        setAlerts(mockAlerts);
        setLoading(false);
        setRefreshTime(new Date());
      }, 800);
      
      // Ensure loading state exits after a reasonable time
      setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 3000);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  }, [location, user, loading]);
  
  // Check for weather alerts based on thresholds
  const checkForAlerts = useCallback((current: CurrentWeather, forecastItems: ForecastItem[]) => {
    const newAlerts: Alert[] = [];
    
    // Check current temperature against thresholds
    if (current.main.temp > thresholds.highTemp) {
      newAlerts.push({
        id: `temp-high-${Date.now()}`,
        type: 'temperature',
        description: `High temperature alert: ${current.main.temp.toFixed(0)}°F current temperature exceeds threshold of ${thresholds.highTemp}°F`,
        timestamp: Date.now(),
        severity: 'warning',
        acknowledged: false
      });
    }
    
    if (current.main.temp < thresholds.lowTemp) {
      newAlerts.push({
        id: `temp-low-${Date.now()}`,
        type: 'temperature',
        description: `Low temperature alert: ${current.main.temp.toFixed(0)}°F current temperature below threshold of ${thresholds.lowTemp}°F`,
        timestamp: Date.now(),
        severity: 'warning',
        acknowledged: false
      });
    }
    
    // Check wind speed
    if (current.wind.speed > thresholds.highWind) {
      newAlerts.push({
        id: `wind-high-${Date.now()}`,
        type: 'wind',
        description: `High wind alert: ${current.wind.speed.toFixed(0)} mph current wind speed exceeds threshold of ${thresholds.highWind} mph`,
        timestamp: Date.now(),
        severity: 'warning',
        acknowledged: false
      });
    }
    
    // Check upcoming forecast for potential alerts
    const next24Hours = forecastItems.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      const now = new Date();
      return itemDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
    });
    
    // Check for rain
    const rainForecast = next24Hours.find(item => item.rain && item.rain['3h'] && item.rain['3h'] > thresholds.rainAmount);
    if (rainForecast) {
      newAlerts.push({
        id: `rain-${Date.now()}`,
        type: 'rain',
        description: `Rain alert: ${rainForecast.rain?.['3h']?.toFixed(1)} inches expected in the next 24 hours, exceeding threshold of ${thresholds.rainAmount} inches`,
        timestamp: Date.now(),
        severity: 'info',
        acknowledged: false
      });
    }
    
    // Check for snow
    const snowForecast = next24Hours.find(item => item.snow && item.snow['3h'] && item.snow['3h'] > thresholds.snowAmount);
    if (snowForecast) {
      newAlerts.push({
        id: `snow-${Date.now()}`,
        type: 'snow',
        description: `Snow alert: ${snowForecast.snow?.['3h']?.toFixed(1)} inches expected in the next 24 hours, exceeding threshold of ${thresholds.snowAmount} inches`,
        timestamp: Date.now(),
        severity: 'info',
        acknowledged: false
      });
    }
    
    // Add new alerts to existing unacknowledged alerts
    setAlerts(prev => {
      const unacknowledged = prev.filter(a => !a.acknowledged);
      return [...unacknowledged, ...newAlerts];
    });
  }, [thresholds]);
  
  // Handle acknowledging an alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };
  
  // Handle dismissing an alert
  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };
  
  // Load user settings
  const loadUserSettings = useCallback(async () => {
    if (!user) return;
    
    setSettingsLoading(true);
    setSettingsError(null);
    
    try {
      // Always use mock settings
      console.log('Using mock settings');
      
      // Create mock settings
      const mockSettings = {
        location_name: 'Kerrville, TX',
        location_lat: 30.0469,
        location_lon: -99.1403,
        units: 'imperial',
        update_interval: 30
      };
      
      // Set the location and other settings
      setLocation({
        name: mockSettings.location_name,
        lat: mockSettings.location_lat,
        lon: mockSettings.location_lon
      });
      setUpdateInterval(mockSettings.update_interval);
      setUnits(mockSettings.units);
      
      // Also update the temporary settings
      setTempLocation({
        name: mockSettings.location_name,
        lat: mockSettings.location_lat,
        lon: mockSettings.location_lon
      });
      setTempUpdateInterval(mockSettings.update_interval);
      setTempUnits(mockSettings.units);
      
      // Create mock thresholds
      const mockThresholds = {
        highTemp: 85,
        lowTemp: 45,
        highWind: 15,
        rainAmount: 0.5,
        snowAmount: 1.0
      };
      
      setThresholds(mockThresholds);
      setTempThresholds(mockThresholds);
      
      setTimeout(() => {
        setSettingsLoading(false);
      }, 500);
      
      // Ensure loading state exits after a reasonable time
      setTimeout(() => {
        if (settingsLoading) {
          setSettingsLoading(false);
        }
      }, 2000);
    } catch (err) {
      console.error('Error loading user settings:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
      setSettingsLoading(false);
    }
  }, [user]);
  
  // Save user settings
  const saveUserSettings = async () => {
    if (!user) return;
    
    setSettingsLoading(true);
    setSettingsError(null);
    
    try {
      // Apply the temporary settings to the actual settings
      setLocation(tempLocation);
      setUpdateInterval(tempUpdateInterval);
      setUnits(tempUnits);
      setThresholds(tempThresholds);
      
      console.log('Settings saved successfully (mock)');
      
      // Close the dialog and fetch new weather data
      setSettingsLoading(false);
      setShowSettingsDialog(false);
      
      // Fetch new weather data with updated settings
      fetchWeatherData();
    } catch (err) {
      console.error('Error saving user settings:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to save settings');
      setSettingsLoading(false);
    }
  };
  
  // Initialize component
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user, loadUserSettings]);
  
  // Fetch weather data on load and when settings change
  useEffect(() => {
    if (user) {
      fetchWeatherData();
      
      // Set up interval for refreshing data
      const interval = setInterval(() => {
        fetchWeatherData();
      }, updateInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [fetchWeatherData, updateInterval, user]);
  
  // Open settings dialog
  const handleOpenSettings = () => {
    // Initialize temporary settings with current values
    setTempLocation(location);
    setTempUpdateInterval(updateInterval);
    setTempUnits(units);
    setTempThresholds(thresholds);
    setShowSettingsDialog(true);
  };
  
  // Get weather icon URL
  const getWeatherIconUrl = (icon: string) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };
  
  // Get current weather component
  const getCurrentWeatherComponent = () => {
    if (!currentWeather) return null;
    
    return (
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h5" gutterBottom>Current Weather</Typography>
            <Box>
              <Tooltip title="Location">
                <LocationOnIcon color="primary" />
              </Tooltip>
              <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                {location.name}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <img 
              src={getWeatherIconUrl(currentWeather.weather[0].icon)} 
              alt={currentWeather.weather[0].description}
              style={{ width: 80, height: 80 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h3">{currentWeather.main.temp.toFixed(0)}°F</Typography>
              <Typography variant="body1">{currentWeather.weather[0].description}</Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThermostatIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2">Feels Like</Typography>
                  <Typography variant="body1">{currentWeather.main.feels_like.toFixed(0)}°F</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AirIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2">Wind</Typography>
                  <Typography variant="body1">{currentWeather.wind.speed.toFixed(1)} mph</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WaterIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2">Humidity</Typography>
                  <Typography variant="body1">{currentWeather.main.humidity}%</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2">Cloud Cover</Typography>
                  <Typography variant="body1">{currentWeather.clouds.all}%</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Updated: {format(refreshTime, 'MMM d, h:mm a')}
            </Typography>
            <Tooltip title="Refresh">
              {loading ? (
                <span>
                  <IconButton disabled={true} sx={{ ml: 1 }}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              ) : (
                <IconButton onClick={fetchWeatherData} sx={{ ml: 1 }}>
                  <RefreshIcon />
                </IconButton>
              )}
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Get forecast component
  const getForecastComponent = () => {
    if (forecast.length === 0) return null;
    
    // Group forecast by day
    const forecastByDay: Record<string, ForecastItem[]> = {};
    forecast.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = format(date, 'yyyy-MM-dd');
      if (!forecastByDay[day]) {
        forecastByDay[day] = [];
      }
      forecastByDay[day].push(item);
    });
    
    return (
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>5-Day Forecast</Typography>
          
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', mt: 2, pb: 1 }}>
              {Object.entries(forecastByDay).map(([day, items], index) => {
                // Get the day's high and low
                const temps = items.map(item => item.main.temp);
                const highTemp = Math.max(...temps);
                const lowTemp = Math.min(...temps);
                
                // Get the most common weather condition
                const weatherCounts: Record<string, number> = {};
                items.forEach(item => {
                  const cond = item.weather[0].main;
                  weatherCounts[cond] = (weatherCounts[cond] || 0) + 1;
                });
                const mainWeather = Object.entries(weatherCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                const iconItem = items.find(item => item.weather[0].main === mainWeather);
                const icon = iconItem ? iconItem.weather[0].icon : items[0].weather[0].icon;
                
                // Check for precipitation
                const hasPrecipitation = items.some(item => 
                  (item.rain && item.rain['3h'] && item.rain['3h'] > 0) || 
                  (item.snow && item.snow['3h'] && item.snow['3h'] > 0)
                );
                
                // Calculate total precipitation if any
                let totalPrecip = 0;
                items.forEach(item => {
                  if (item.rain && item.rain['3h']) {
                    totalPrecip += item.rain['3h'];
                  }
                  if (item.snow && item.snow['3h']) {
                    totalPrecip += item.snow['3h'];
                  }
                });
                
                return (
                  <Box key={day} sx={{ 
                    minWidth: 120, 
                    mx: 1, 
                    p: 1, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body1">
                      {format(new Date(day), 'EEE, MMM d')}
                    </Typography>
                    <img 
                      src={getWeatherIconUrl(icon)} 
                      alt={mainWeather}
                      style={{ width: 50, height: 50, margin: '0 auto' }}
                    />
                    <Typography variant="body2">{mainWeather}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                      <KeyboardArrowUpIcon fontSize="small" color="error" />
                      <Typography variant="body2" sx={{ mr: 1 }}>{highTemp.toFixed(0)}°</Typography>
                      <KeyboardArrowDownIcon fontSize="small" color="primary" />
                      <Typography variant="body2">{lowTemp.toFixed(0)}°</Typography>
                    </Box>
                    {hasPrecipitation && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Precip: {totalPrecip.toFixed(1)}"
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Get alerts component
  const getAlertsComponent = () => {
    return (
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Weather Alerts</Typography>
            <Tooltip title="Alert Settings">
              <IconButton onClick={handleOpenSettings}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {alerts.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 3 
            }}>
              <CloudOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                No active weather alerts
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {alerts.map(alert => (
                <Alert 
                  key={alert.id}
                  severity={alert.severity}
                  sx={{ mb: 2 }}
                  action={
                    <Box>
                      <Tooltip title={alert.acknowledged ? "Dismiss" : "Acknowledge"}>
                        <IconButton 
                          size="small" 
                          onClick={() => alert.acknowledged 
                            ? handleDismissAlert(alert.id) 
                            : handleAcknowledgeAlert(alert.id)
                          }
                        >
                          {alert.acknowledged ? <DeleteIcon /> : <RefreshIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <Typography variant="body2">
                    {alert.description}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Settings dialog
  const getSettingsDialog = () => {
    return (
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Weather Settings</DialogTitle>
        <DialogContent>
          {settingsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {settingsError}
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Location</Typography>
            <TextField
              label="Location Name"
              value={tempLocation.name}
              onChange={(e) => setTempLocation({ ...tempLocation, name: e.target.value })}
              fullWidth
              margin="normal"
              helperText="Enter the name of your location (e.g. Kerrville, TX)"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={tempLocation.lat}
                  onChange={(e) => setTempLocation({ ...tempLocation, lat: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Longitude"
                  type="number"
                  value={tempLocation.lon}
                  onChange={(e) => setTempLocation({ ...tempLocation, lon: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Update Settings</Typography>
            <TextField
              select
              label="Units"
              value={tempUnits}
              onChange={(e) => setTempUnits(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="imperial">Imperial (°F, mph)</MenuItem>
              <MenuItem value="metric">Metric (°C, km/h)</MenuItem>
            </TextField>
            
            <TextField
              label="Update Interval (minutes)"
              type="number"
              value={tempUpdateInterval}
              onChange={(e) => setTempUpdateInterval(parseInt(e.target.value))}
              fullWidth
              margin="normal"
              inputProps={{ min: 5, max: 120 }}
              helperText="How often to refresh weather data (5-120 minutes)"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Alert Thresholds</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="High Temp (°F)"
                  type="number"
                  value={tempThresholds.highTemp}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, highTemp: parseInt(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Low Temp (°F)"
                  type="number"
                  value={tempThresholds.lowTemp}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, lowTemp: parseInt(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="High Wind (mph)"
                  type="number"
                  value={tempThresholds.highWind}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, highWind: parseInt(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Rain Amount (inches)"
                  type="number"
                  value={tempThresholds.rainAmount}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, rainAmount: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Snow Amount (inches)"
                  type="number"
                  value={tempThresholds.snowAmount}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, snowAmount: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
          <Button 
            onClick={saveUserSettings} 
            variant="contained" 
            color="primary"
            disabled={settingsLoading}
          >
            {settingsLoading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              Weather Monitoring
            </Typography>
            <Box>
              <Tooltip title="Settings">
                <IconButton onClick={handleOpenSettings} sx={{ ml: 1 }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                {loading ? (
                  <span>
                    <IconButton disabled={true} sx={{ ml: 1 }}>
                      <RefreshIcon />
                    </IconButton>
                  </span>
                ) : (
                  <IconButton onClick={fetchWeatherData} sx={{ ml: 1 }}>
                    <RefreshIcon />
                  </IconButton>
                )}
              </Tooltip>
            </Box>
          </Box>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button 
              size="small" 
              onClick={fetchWeatherData} 
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {getCurrentWeatherComponent()}
            </Grid>
            <Grid item xs={12} md={8}>
              {getForecastComponent()}
            </Grid>
            <Grid item xs={12}>
              {getAlertsComponent()}
            </Grid>
          </Grid>
        )}
        
        {getSettingsDialog()}
      </Box>
    </ThemeProvider>
  );
};

export { WeatherMonitoring }; 
