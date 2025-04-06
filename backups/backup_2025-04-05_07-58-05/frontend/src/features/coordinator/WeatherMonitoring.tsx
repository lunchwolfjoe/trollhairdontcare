import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  CardActions,
} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  Cloud as CloudIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { weatherService } from '../../services/weatherService';
import { notificationService } from '../../services/notificationService';

interface WeatherCondition {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  precipitation: number;
  conditions: string;
  alert_level: 'normal' | 'caution' | 'warning' | 'critical';
}

interface WeatherAlert {
  id: string;
  condition_id: string;
  alert_type: 'rain' | 'wind' | 'heat' | 'cold' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action_required: string;
  affected_areas: string[];
  created_at: string;
  resolved_at: string | null;
  status: 'pending' | 'sent' | 'resolved';
  user_id: string;
  template_id: string;
}

interface WeatherSettings {
  id: string;
  temperature_threshold_min: number;
  temperature_threshold_max: number;
  wind_speed_threshold: number;
  precipitation_threshold: number;
  humidity_threshold_max: number;
  alert_notification_enabled: boolean;
}

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

const WeatherMonitoring: React.FC = () => {
  const [conditions, setConditions] = useState<WeatherCondition[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [settings, setSettings] = useState<WeatherSettings | null>(null);
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [forecastSettings, setForecastSettings] = useState<WeatherForecastSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openForecastSettings, setOpenForecastSettings] = useState(false);
  const [formData, setFormData] = useState({
    temperature_threshold_min: 10,
    temperature_threshold_max: 35,
    wind_speed_threshold: 30,
    precipitation_threshold: 5,
    humidity_threshold_max: 85,
  });
  const [forecastFormData, setForecastFormData] = useState({
    api_key: '',
    location_lat: 0,
    location_lon: 0,
    update_interval: 3600,
  });

  useEffect(() => {
    fetchWeatherData();
    fetchForecastData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      // Fetch weather conditions
      const { data: conditionsData, error: conditionsError } = await supabase
        .from('weather_conditions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24);

      if (conditionsError) throw conditionsError;

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('weather_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('weather_monitoring_settings')
        .select('*')
        .single();

      if (settingsError) throw settingsError;

      setConditions(conditionsData || []);
      setAlerts(alertsData || []);
      setSettings(settingsData);
      if (settingsData) {
        setFormData({
          temperature_threshold_min: settingsData.temperature_threshold_min,
          temperature_threshold_max: settingsData.temperature_threshold_max,
          wind_speed_threshold: settingsData.wind_speed_threshold,
          precipitation_threshold: settingsData.precipitation_threshold,
          humidity_threshold_max: settingsData.humidity_threshold_max,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async () => {
    try {
      const [forecastData, settingsData] = await Promise.all([
        weatherService.fetchWeatherForecast(),
        weatherService.fetchForecastSettings(),
      ]);

      setForecasts(forecastData);
      setForecastSettings(settingsData);
      if (settingsData) {
        setForecastFormData({
          api_key: settingsData.api_key,
          location_lat: settingsData.location_lat,
          location_lon: settingsData.location_lon,
          update_interval: settingsData.update_interval,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
    }
  };

  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  const handleUpdateSettings = async () => {
    try {
      if (!settings) return;

      const { error } = await supabase
        .from('weather_monitoring_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      fetchWeatherData();
      handleCloseSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const handleWeatherAlert = async (alert: WeatherAlert) => {
    try {
      // Create notification for the alert
      await notificationService.handleNotification({
        id: alert.id,
        user_id: alert.user_id,
        template_id: alert.template_id,
        type: 'weather',
        subject: `Weather Alert: ${alert.severity.toUpperCase()}`,
        body: alert.message,
        read: false,
        sent_at: new Date().toISOString(),
      });

      // Update alert status
      const { error } = await supabase
        .from('weather_alerts')
        .update({ status: 'sent' })
        .eq('id', alert.id);

      if (error) throw error;

      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      console.error('Error handling weather alert:', err);
      setError('Failed to send weather alert notification');
    }
  };

  const handleAlertResolution = async (alert: WeatherAlert) => {
    try {
      // Create resolution notification
      await notificationService.handleNotification({
        id: alert.id,
        user_id: alert.user_id,
        template_id: alert.template_id,
        type: 'weather',
        subject: `Weather Alert Resolved: ${alert.severity.toUpperCase()}`,
        body: `The weather alert "${alert.message}" has been resolved.`,
        read: false,
        sent_at: new Date().toISOString(),
      });

      // Update alert status
      const { error } = await supabase
        .from('weather_alerts')
        .update({ status: 'resolved' })
        .eq('id', alert.id);

      if (error) throw error;

      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving weather alert:', err);
      setError('Failed to resolve weather alert');
    }
  };

  const getAlertColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleOpenForecastSettings = () => {
    setOpenForecastSettings(true);
  };

  const handleCloseForecastSettings = () => {
    setOpenForecastSettings(false);
  };

  const handleUpdateForecastSettings = async () => {
    try {
      if (!forecastSettings) return;

      await weatherService.updateForecastSettings({
        id: forecastSettings.id,
        ...forecastFormData,
      });

      await weatherService.updateForecastFromAPI();
      fetchForecastData();
      handleCloseForecastSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update forecast settings');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Weather Monitoring
        </Typography>
        <Box>
          <Button
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
            sx={{ mr: 2 }}
          >
            Alert Settings
          </Button>
          <Button
            startIcon={<SettingsIcon />}
            onClick={handleOpenForecastSettings}
          >
            Forecast Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Conditions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Conditions
            </Typography>
            {conditions.length > 0 && (
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ThermostatIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {conditions[0].temperature}°C
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Temperature
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {conditions[0].humidity}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Humidity
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AirIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {conditions[0].wind_speed} km/h
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Wind Speed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CloudIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {conditions[0].precipitation} mm
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Precipitation
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Weather Forecast */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weather Forecast
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <LineChart
                  data={forecasts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="forecast_time"
                    tickFormatter={(value) => format(parseISO(value), 'HH:mm')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(parseISO(value), 'PPp')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    name="Temperature (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#82ca9d"
                    name="Humidity (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="wind_speed"
                    stroke="#ffc658"
                    name="Wind Speed (km/h)"
                  />
                </LineChart>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <Stack spacing={2}>
              {alerts.map((alert) => (
                <Grid item xs={12} md={6} key={alert.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {alert.severity.toUpperCase()} Alert
                        </Typography>
                        <Chip
                          label={alert.status}
                          color={getAlertColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {alert.message}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(alert.created_at).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {alert.status === 'pending' && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleWeatherAlert(alert)}
                        >
                          Send Notification
                        </Button>
                      )}
                      {alert.status === 'sent' && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleAlertResolution(alert)}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={handleCloseSettings} maxWidth="sm" fullWidth>
        <DialogTitle>Weather Monitoring Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Temperature (°C)"
                type="number"
                value={formData.temperature_threshold_min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature_threshold_min: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Temperature (°C)"
                type="number"
                value={formData.temperature_threshold_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature_threshold_max: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wind Speed Threshold (km/h)"
                type="number"
                value={formData.wind_speed_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wind_speed_threshold: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Precipitation Threshold (mm)"
                type="number"
                value={formData.precipitation_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precipitation_threshold: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Max Humidity (%)"
                type="number"
                value={formData.humidity_threshold_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    humidity_threshold_max: Number(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forecast Settings Dialog */}
      <Dialog open={openForecastSettings} onClose={handleCloseForecastSettings} maxWidth="sm" fullWidth>
        <DialogTitle>Weather Forecast Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="OpenWeatherMap API Key"
                type="password"
                value={forecastFormData.api_key}
                onChange={(e) =>
                  setForecastFormData({
                    ...forecastFormData,
                    api_key: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={forecastFormData.location_lat}
                onChange={(e) =>
                  setForecastFormData({
                    ...forecastFormData,
                    location_lat: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={forecastFormData.location_lon}
                onChange={(e) =>
                  setForecastFormData({
                    ...forecastFormData,
                    location_lon: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Update Interval (seconds)"
                type="number"
                value={forecastFormData.update_interval}
                onChange={(e) =>
                  setForecastFormData({
                    ...forecastFormData,
                    update_interval: Number(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForecastSettings}>Cancel</Button>
          <Button onClick={handleUpdateForecastSettings} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeatherMonitoring; 