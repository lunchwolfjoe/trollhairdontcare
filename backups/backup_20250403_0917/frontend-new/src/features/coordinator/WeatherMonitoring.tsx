import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';

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

const WeatherMonitoring: React.FC = () => {
  const [forecasts, setForecasts] = useState(mockForecasts);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [thresholds, setThresholds] = useState(mockThresholds);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: '',
    severity: 'moderate',
    description: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    // Fetch forecasts and alerts from the backend
    // Replace with actual API calls
  }, []);

  const handleRefreshForecast = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleAlertDialogOpen = () => {
    setAlertDialogOpen(true);
  };

  const handleAlertDialogClose = () => {
    setAlertDialogOpen(false);
    setNewAlert({
      type: '',
      severity: 'moderate',
      description: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleSettingsDialogOpen = () => {
    setSettingsDialogOpen(true);
  };

  const handleSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
  };

  const handleCreateAlert = () => {
    const alert = {
      id: `${Date.now()}`,
      ...newAlert,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts([alert, ...alerts]);
    handleAlertDialogClose();
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, active: false } : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    handleSettingsDialogClose();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <SunnyIcon sx={{ color: 'orange' }} />;
      case 'partly cloudy':
      case 'cloudy':
        return <CloudyIcon sx={{ color: 'grey' }} />;
      case 'rain':
        return <RainIcon sx={{ color: 'blue' }} />;
      case 'snow':
        return <SnowIcon sx={{ color: 'lightblue' }} />;
      case 'thunderstorm':
        return <StormIcon sx={{ color: 'purple' }} />;
      default:
        return <CloudyIcon sx={{ color: 'grey' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'moderate':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  // Filter forecasts by selected date
  const filteredForecasts = selectedDate === 'all'
    ? forecasts
    : forecasts.filter(forecast => forecast.date === selectedDate);

  // Get unique dates for filter
  const dates = [...new Set(forecasts.map(forecast => forecast.date))];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Weather Monitoring
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshForecast}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh Forecast'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSettingsDialogOpen}
          >
            Settings
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Current Weather Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                Current Weather
              </Typography>
              <Box sx={{ fontSize: '2.5rem' }}>
                {getWeatherIcon(forecasts[0].conditions)}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" component="div" sx={{ mr: 2 }}>
                {forecasts[0].temperature}°F
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {forecasts[0].conditions}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Precipitation
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RainIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography>{forecasts[0].precipitation}%</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RainIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography>{forecasts[0].humidity}%</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Wind
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WindIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography>{forecasts[0].windSpeed} mph</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Active Alerts Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Weather Alerts
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAlertDialogOpen}
              >
                Create Alert
              </Button>
            </Box>
            {alerts.filter(alert => alert.active).length === 0 ? (
              <Alert severity="success">
                <AlertTitle>No Active Alerts</AlertTitle>
                Weather conditions look good for planned activities.
              </Alert>
            ) : (
              <Box>
                {alerts.filter(alert => alert.active).map((alert) => (
                  <Alert 
                    key={alert.id} 
                    severity={getSeverityColor(alert.severity)}
                    sx={{ mb: 2 }}
                    action={
                      <Box>
                        <Button 
                          size="small" 
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <AlertTitle>{alert.type}</AlertTitle>
                    {alert.description}<br />
                    <Typography variant="caption">
                      {formatDateTime(alert.startTime)} - {formatDateTime(alert.endTime)}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Weather Forecast Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Weather Forecast
              </Typography>
              <Box>
                <Button
                  variant={selectedDate === 'all' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedDate('all')}
                  sx={{ mr: 1 }}
                >
                  All Days
                </Button>
                {dates.map(date => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedDate(date)}
                    sx={{ mr: 1 }}
                  >
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Button>
                ))}
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Conditions</TableCell>
                    <TableCell>Temperature</TableCell>
                    <TableCell>Precipitation</TableCell>
                    <TableCell>Wind</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredForecasts.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell>
                        {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>{forecast.time}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getWeatherIcon(forecast.conditions)}
                          <Typography sx={{ ml: 1 }}>{forecast.conditions}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{forecast.temperature}°F</TableCell>
                      <TableCell>{forecast.precipitation}%</TableCell>
                      <TableCell>{forecast.windSpeed} mph</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={handleAlertDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Weather Alert</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Alert Type"
            value={newAlert.type}
            onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Severity"
            value={newAlert.severity}
            onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </TextField>
          <TextField
            fullWidth
            label="Description"
            value={newAlert.description}
            onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={newAlert.startTime}
            onChange={(e) => setNewAlert({ ...newAlert, startTime: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="datetime-local"
            value={newAlert.endTime}
            onChange={(e) => setNewAlert({ ...newAlert, endTime: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateAlert}
            variant="contained"
            color="primary"
            disabled={
              !newAlert.type ||
              !newAlert.description ||
              !newAlert.startTime ||
              !newAlert.endTime
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Weather Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={handleSettingsDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Weather Monitoring Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Alert Thresholds
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Temperature
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={thresholds.temperature.enabled}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        temperature: {
                          ...thresholds.temperature,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Enable Temperature Alerts"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="High (°F)"
                type="number"
                value={thresholds.temperature.high}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    temperature: {
                      ...thresholds.temperature,
                      high: Number(e.target.value),
                    },
                  })
                }
                disabled={!thresholds.temperature.enabled}
                sx={{ width: '50%' }}
              />
              <TextField
                label="Low (°F)"
                type="number"
                value={thresholds.temperature.low}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    temperature: {
                      ...thresholds.temperature,
                      low: Number(e.target.value),
                    },
                  })
                }
                disabled={!thresholds.temperature.enabled}
                sx={{ width: '50%' }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Precipitation
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={thresholds.precipitation.enabled}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        precipitation: {
                          ...thresholds.precipitation,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Enable Precipitation Alerts"
              />
            </Box>
            <TextField
              label="Threshold (%)"
              type="number"
              value={thresholds.precipitation.threshold}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  precipitation: {
                    ...thresholds.precipitation,
                    threshold: Number(e.target.value),
                  },
                })
              }
              disabled={!thresholds.precipitation.enabled}
              sx={{ width: '50%' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Wind
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={thresholds.wind.enabled}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        wind: {
                          ...thresholds.wind,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Enable Wind Alerts"
              />
            </Box>
            <TextField
              label="Threshold (mph)"
              type="number"
              value={thresholds.wind.threshold}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  wind: {
                    ...thresholds.wind,
                    threshold: Number(e.target.value),
                  },
                })
              }
              disabled={!thresholds.wind.enabled}
              sx={{ width: '50%' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Update Frequency
            </Typography>
            <TextField
              label="Check Weather Every (minutes)"
              type="number"
              value={thresholds.updateFrequency}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  updateFrequency: Number(e.target.value),
                })
              }
              sx={{ width: '50%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsDialogClose}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WeatherMonitoring; 