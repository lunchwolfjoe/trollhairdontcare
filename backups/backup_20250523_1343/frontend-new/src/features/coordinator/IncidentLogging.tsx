import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { festivalService } from '../../lib/services';
import { Festival, Incident } from '../../lib/types/models';
import { Database } from '../../lib/types/supabase';
import { useAuth } from '../../hooks/useAuth';

// Mock data for development
const mockIncidents: Incident[] = [
  {
    id: '1',
    festival_id: '1',
    title: 'Medical emergency at main stage',
    description: 'Audience member fainted during performance, medical team responded.',
    incident_type: 'medical',
    severity: 'medium',
    status: 'resolved',
    location: 'Main Stage',
    reported_by: 'Security Team Lead',
    reported_at: new Date(Date.now() - 86400000).toISOString(),
    resolved_at: new Date(Date.now() - 84600000).toISOString(),
    resolution_notes: 'Medical team provided assistance. Person recovered and returned to festival.',
  },
  {
    id: '2',
    festival_id: '1',
    title: 'Equipment failure at sound booth',
    description: 'Mixer stopped working during soundcheck.',
    incident_type: 'technical',
    severity: 'high',
    status: 'investigating',
    location: 'Sound Booth',
    reported_by: 'Sound Engineer',
    reported_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '3',
    festival_id: '1',
    title: 'Lost child report',
    description: '8-year-old separated from parents near food court.',
    incident_type: 'security',
    severity: 'high',
    status: 'resolved',
    location: 'Food Court',
    reported_by: 'Volunteer Coordinator',
    reported_at: new Date(Date.now() - 21600000).toISOString(),
    resolved_at: new Date(Date.now() - 18000000).toISOString(),
    resolution_notes: 'Child reunited with parents after 20 minutes.',
  },
];

const incidentTypes = [
  'medical',
  'security',
  'technical',
  'weather',
  'crowd management',
  'property damage',
  'theft',
  'other',
];

const IncidentLogging: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Incident>>({
    title: '',
    description: '',
    incident_type: '',
    severity: 'medium',
    status: 'open',
    location: '',
    festival_id: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found. Please create a festival first.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // If festivalId is in URL, use that, otherwise use the first festival
        const targetFestivalId = festivalId || data[0].id;
        const festival = data.find(f => f.id === targetFestivalId);
        
        if (festival) {
          setCurrentFestival(festival);
          // Once we have the festival, fetch incidents for it
          fetchIncidentsForFestival(festival.id);
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message || 'Failed to fetch festivals');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);

  const fetchIncidentsForFestival = async (festivalId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching incidents for festival: ${festivalId}`);
      
      // Check if incidents table exists before querying
      const { error: checkError } = await supabase
        .from('incidents')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      // If incidents table doesn't exist, use mock data
      if (checkError && checkError.message && checkError.message.includes('relation "public.incidents" does not exist')) {
        console.log('Incidents table not found, using mock data');
        // Filter mock incidents by festival ID
        const filteredIncidents = mockIncidents.filter(incident => incident.festival_id === festivalId);
        setIncidents(filteredIncidents);
        setLoading(false);
        return;
      }
      
      // If we get here, the incidents table exists, so proceed with real data
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .eq('festival_id', festivalId)
        .order('reported_at', { ascending: false });
      
      if (incidentsError) {
        // Safely access error message
        const errorMessage = incidentsError.message || 'Failed to fetch incidents';
        throw new Error(errorMessage);
      }
      
      setIncidents(incidentsData || []);
    } catch (err) {
      // Safely handle error object which might not have a message property
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = String(err);
      } else {
        errorMessage = 'An unknown error occurred';
      }
      
      console.error('Error fetching incidents:', errorMessage);
      setError(errorMessage);
      setIncidents(mockIncidents);
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchIncidentsForFestival(festival.id);
    }
  };

  const handleOpenDialog = (incident?: Incident) => {
    if (incident) {
      setSelectedIncident(incident);
      setFormData({
        title: incident.title,
        description: incident.description,
        incident_type: incident.incident_type,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        resolution_notes: incident.resolution_notes,
        festival_id: incident.festival_id,
      });
    } else {
      setSelectedIncident(null);
      setFormData({
        title: '',
        description: '',
        incident_type: '',
        severity: 'medium',
        status: 'open',
        location: '',
        festival_id: currentFestival?.id || '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedIncident(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!formData.festival_id && currentFestival) {
        formData.festival_id = currentFestival.id;
      }
      
      if (!formData.festival_id) {
        throw new Error('Please select a festival');
      }
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (selectedIncident) {
        // Update existing incident
        const { error } = await supabase
          .from('incidents')
          .update({
            title: formData.title,
            description: formData.description,
            incident_type: formData.incident_type,
            severity: formData.severity,
            status: formData.status,
            location: formData.location,
            resolution_notes: formData.resolution_notes,
            // Add resolved_at timestamp if status is resolved or closed
            ...(formData.status === 'resolved' || formData.status === 'closed' 
              ? { resolved_at: new Date().toISOString() } 
              : {})
          })
          .eq('id', selectedIncident.id);
          
        if (error) {
          console.error('Error updating incident:', error);
          // Safely access error message
          const errorMessage = error.message || 'Failed to update incident';
          throw new Error(errorMessage);
        }
          
        setSnackbarMessage('Incident updated successfully');
        setSnackbarSeverity('success');
      } else {
        // Create new incident
        const newIncident = {
          ...formData,
          reported_by: user?.email || 'Unknown',
          reported_at: new Date().toISOString(),
        };
        
        console.log('Creating new incident:', newIncident);
        
        const { data, error } = await supabase
          .from('incidents')
          .insert([newIncident])
          .select();
          
        if (error) {
          console.error('Error creating incident:', error);
          // Check if the error is because the table doesn't exist
          if (error.message && error.message.includes('relation "public.incidents" does not exist')) {
            // For development, update the local state instead
            const mockIncident: Incident = {
              id: Date.now().toString(),
              ...newIncident as any,
              status: formData.status as 'open' | 'investigating' | 'resolved' | 'closed',
              severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
            };
            setIncidents(prev => [mockIncident, ...prev]);
            setSnackbarMessage('Incident created in mock data (database table not available)');
            setSnackbarSeverity('info');
          } else {
            // Safely access error message
            const errorMessage = error.message || 'Failed to create incident';
            throw new Error(errorMessage);
          }
        } else {
          console.log('Incident created successfully:', data);
          if (data && data.length > 0) {
            // Add the newly created incident to the local state
            setIncidents(prev => [data[0], ...prev]);
          }
          setSnackbarMessage('Incident created successfully');
          setSnackbarSeverity('success');
        }
      }
      
      // Close the dialog and show success message
      setSnackbarOpen(true);
      handleCloseDialog();
      
    } catch (err) {
      // Safely handle error object which might not have a message property
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = String(err);
      } else {
        errorMessage = 'An unknown error occurred';
      }
      
      console.error('Error saving incident:', errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);
        
      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.message && error.message.includes('relation "public.incidents" does not exist')) {
          // For development, update the local state instead
          setIncidents(prev => prev.filter(incident => incident.id !== id));
          setSnackbarMessage('Incident deleted from mock data (database table not available)');
          setSnackbarSeverity('info');
        } else {
          // Safely access error message
          const errorMessage = error.message || 'Failed to delete incident';
          throw new Error(errorMessage);
        }
      } else {
        setIncidents(prev => prev.filter(incident => incident.id !== id));
        setSnackbarMessage('Incident deleted successfully');
        setSnackbarSeverity('success');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      // Safely handle error object which might not have a message property
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = String(err);
      } else {
        errorMessage = 'An unknown error occurred';
      }
      
      console.error('Error deleting incident:', errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'investigating':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Incident Logging
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {availableFestivals.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={currentFestival?.id || ''}
                  label="Festival"
                  onChange={(e) => handleFestivalChange(e.target.value)}
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Log Incident
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={() => currentFestival && fetchIncidentsForFestival(currentFestival.id)}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : incidents.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No incidents found. Click "Log Incident" to record a new incident.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {incidents.map((incident) => (
              <Grid item xs={12} key={incident.id}>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{incident.title}</Typography>
                        <Chip 
                          label={incident.incident_type} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={incident.severity} 
                          size="small" 
                          color={getSeverityColor(incident.severity) as any} 
                        />
                        <Chip 
                          label={incident.status} 
                          size="small" 
                          color={getStatusColor(incident.status) as any} 
                        />
                      </Box>
                      <Typography variant="body1" paragraph>
                        {incident.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Location:</strong> {incident.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Reported by:</strong> {incident.reported_by}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Reported at:</strong> {formatDate(incident.reported_at)}
                        </Typography>
                        {incident.resolved_at && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Resolved at:</strong> {formatDate(incident.resolved_at)}
                          </Typography>
                        )}
                      </Box>
                      {incident.resolution_notes && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Resolution Notes:</strong>
                          </Typography>
                          <Typography variant="body2">
                            {incident.resolution_notes}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(incident)}
                          fullWidth
                        >
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(incident.id)}
                          fullWidth
                        >
                          Delete
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create/Edit Incident Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedIncident ? 'Update Incident' : 'Log New Incident'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Incident Type</InputLabel>
                  <Select
                    value={formData.incident_type || ''}
                    label="Incident Type"
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  >
                    {incidentTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity || 'medium'}
                    label="Severity"
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status || 'open'}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="investigating">Investigating</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(formData.status === 'resolved' || formData.status === 'closed') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Resolution Notes"
                    value={formData.resolution_notes || ''}
                    onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
              )}
              {availableFestivals.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Festival</InputLabel>
                    <Select
                      value={formData.festival_id || (currentFestival ? currentFestival.id : '')}
                      label="Festival"
                      onChange={(e) => setFormData({ ...formData, festival_id: e.target.value })}
                    >
                      {availableFestivals.map(festival => (
                        <MenuItem key={festival.id} value={festival.id}>
                          {festival.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={
                !formData.title || 
                !formData.description || 
                !formData.incident_type || 
                !formData.location || 
                !formData.festival_id
              }
            >
              {selectedIncident ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export { IncidentLogging }; 