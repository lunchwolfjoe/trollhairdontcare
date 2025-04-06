import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { notificationService } from '../services/notificationService';

interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string;
  alert_levels: string[];
  notification_types: string[];
}

const ALERT_LEVELS = ['critical', 'warning', 'info'];
const NOTIFICATION_TYPES = ['weather', 'task', 'shift', 'general'];

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await notificationService.fetchNotificationSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load notification settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: !settings[field],
    });
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      phone_number: event.target.value,
    });
  };

  const handleAlertLevelToggle = (level: string) => {
    if (!settings) return;
    const newLevels = settings.alert_levels.includes(level)
      ? settings.alert_levels.filter((l) => l !== level)
      : [...settings.alert_levels, level];
    setSettings({
      ...settings,
      alert_levels: newLevels,
    });
  };

  const handleNotificationTypeToggle = (type: string) => {
    if (!settings) return;
    const newTypes = settings.notification_types.includes(type)
      ? settings.notification_types.filter((t) => t !== type)
      : [...settings.notification_types, type];
    setSettings({
      ...settings,
      notification_types: newTypes,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await notificationService.updateNotificationSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save notification settings');
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Loading settings...</Typography>;
  }

  if (!settings) {
    return <Typography>No settings found</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Notification Settings
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Coming Soon: Email and SMS Notifications
          </Typography>
          <Typography variant="body2">
            We're working on implementing email and SMS notification services. These features will be available soon to help you receive important updates through your preferred communication channels.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully
          </Alert>
        )}

        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.email_enabled}
                onChange={() => handleToggle('email_enabled')}
                disabled
              />
            }
            label="Enable Email Notifications (Coming Soon)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.sms_enabled}
                onChange={() => handleToggle('sms_enabled')}
                disabled
              />
            }
            label="Enable SMS Notifications (Coming Soon)"
          />
        </FormGroup>

        {settings.sms_enabled && (
          <TextField
            fullWidth
            label="Phone Number"
            value={settings.phone_number}
            onChange={handlePhoneNumberChange}
            disabled
            sx={{ mb: 3 }}
          />
        )}

        <Typography variant="subtitle1" gutterBottom>
          Alert Levels
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {ALERT_LEVELS.map((level) => (
            <Chip
              key={level}
              label={level.charAt(0).toUpperCase() + level.slice(1)}
              color={settings.alert_levels.includes(level) ? 'primary' : 'default'}
              onClick={() => handleAlertLevelToggle(level)}
            />
          ))}
        </Stack>

        <Typography variant="subtitle1" gutterBottom>
          Notification Types
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {NOTIFICATION_TYPES.map((type) => (
            <Chip
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              color={settings.notification_types.includes(type) ? 'primary' : 'default'}
              onClick={() => handleNotificationTypeToggle(type)}
            />
          ))}
        </Stack>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          fullWidth
        >
          Save Settings
        </Button>
      </Paper>
    </Box>
  );
}; 