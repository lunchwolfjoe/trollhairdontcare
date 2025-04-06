import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const SystemSettings: React.FC = () => {
  // State for general settings
  const [siteName, setSiteName] = useState('Kerrville Folk Festival');
  const [siteUrl, setSiteUrl] = useState('https://volunteer.kerrvillefolkfestival.org');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultTimeZone, setDefaultTimeZone] = useState('America/Chicago');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  
  // State for email settings
  const [smtpServer, setSmtpServer] = useState('smtp.example.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('notifications@kerrvillefolkfestival.org');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [senderEmail, setSenderEmail] = useState('noreply@kerrvillefolkfestival.org');
  const [senderName, setSenderName] = useState('Kerrville Folk Festival');
  
  // State for notification settings
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableInAppNotifications, setEnableInAppNotifications] = useState(true);
  const [notifyOnNewUser, setNotifyOnNewUser] = useState(true);
  const [notifyOnShiftSwap, setNotifyOnShiftSwap] = useState(true);
  
  // State for backup settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetentionDays, setBackupRetentionDays] = useState('30');
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle settings save
  const handleSaveSettings = () => {
    // In a real app, this would save to Supabase or another backend
    console.log('Saving settings...');
    
    // Simulate success
    setTimeout(() => {
      setSaveSuccess(true);
      // Hide the success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };
  
  // Handle test email
  const handleTestEmail = () => {
    // In a real app, this would send a test email via the backend
    console.log('Sending test email...');
    
    // Simulate error for demonstration
    setTimeout(() => {
      setSaveError(true);
      setErrorMessage('Failed to send test email. Check SMTP settings and try again.');
      // Hide the error message after 5 seconds
      setTimeout(() => setSaveError(false), 5000);
    }, 500);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure global settings for the volunteer management system.
        </Typography>
      </Box>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SettingsIcon sx={{ mr: 1 }} />} label="General" iconPosition="start" />
          <Tab icon={<EmailIcon sx={{ mr: 1 }} />} label="Email" iconPosition="start" />
          <Tab icon={<NotificationsIcon sx={{ mr: 1 }} />} label="Notifications" iconPosition="start" />
          <Tab icon={<SecurityIcon sx={{ mr: 1 }} />} label="Backup & Security" iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* General Settings */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  General Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site URL"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Time Zone</InputLabel>
                  <Select
                    value={defaultTimeZone}
                    label="Default Time Zone"
                    onChange={(e) => setDefaultTimeZone(e.target.value)}
                  >
                    <MenuItem value="America/Chicago">America/Chicago (CST/CDT)</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST/EDT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</MenuItem>
                    <MenuItem value="America/Denver">America/Denver (MST/MDT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={dateFormat}
                    label="Date Format"
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={timeFormat}
                    label="Time Format"
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        color="warning"
                      />
                    }
                    label="Maintenance Mode"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    When enabled, the site will be unavailable to non-admin users.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {/* Email Settings */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Email Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Server"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sender Email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sender Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleTestEmail}
                    startIcon={<EmailIcon />}
                  >
                    Send Test Email
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {/* Notification Settings */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notification Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableEmailNotifications}
                      onChange={(e) => setEnableEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableInAppNotifications}
                      onChange={(e) => setEnableInAppNotifications(e.target.checked)}
                    />
                  }
                  label="Enable In-App Notifications"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Admin Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyOnNewUser}
                      onChange={(e) => setNotifyOnNewUser(e.target.checked)}
                      disabled={!enableEmailNotifications && !enableInAppNotifications}
                    />
                  }
                  label="Notify when new users register"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyOnShiftSwap}
                      onChange={(e) => setNotifyOnShiftSwap(e.target.checked)}
                      disabled={!enableEmailNotifications && !enableInAppNotifications}
                    />
                  }
                  label="Notify on shift swap requests"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Backup & Security Settings */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Backup & Security Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Database Backup" />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoBackup}
                          onChange={(e) => setAutoBackup(e.target.checked)}
                        />
                      }
                      label="Enable Automatic Backups"
                    />
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth disabled={!autoBackup}>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value={backupFrequency}
                            label="Backup Frequency"
                            onChange={(e) => setBackupFrequency(e.target.value)}
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Retention Days"
                          value={backupRetentionDays}
                          onChange={(e) => setBackupRetentionDays(e.target.value)}
                          disabled={!autoBackup}
                          type="number"
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button variant="outlined" startIcon={<RefreshIcon />}>
                        Create Manual Backup
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader title="Security Settings" />
                  <CardContent>
                    <Typography color="text.secondary">
                      Security settings are managed through Supabase Dashboard.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      sx={{ mt: 2 }}
                      href="https://app.supabase.com"
                      target="_blank"
                    >
                      Open Supabase Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Save Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* System Information */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">
              Application Version
            </Typography>
            <Typography color="text.secondary">
              1.0.0
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">
              Database Version
            </Typography>
            <Typography color="text.secondary">
              PostgreSQL 14.1
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">
              Last Backup
            </Typography>
            <Typography color="text.secondary">
              April 5, 2025 03:45 AM
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Success/Error Snackbars */}
      <Snackbar open={saveSuccess} autoHideDuration={3000} onClose={() => setSaveSuccess(false)}>
        <Alert severity="success">Settings saved successfully!</Alert>
      </Snackbar>
      
      <Snackbar open={saveError} autoHideDuration={5000} onClose={() => setSaveError(false)}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Container>
  );
};

export { SystemSettings }; 