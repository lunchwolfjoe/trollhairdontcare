import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';

interface FormData {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
}

const AdminFestivals: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    start_date: '',
    end_date: '',
    location: '',
    status: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchFestivals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await festivalService.getFestivals();
      
      if (error) {
        throw new Error(`Failed to fetch festivals: ${error.message}`);
      }
      
      setFestivals(data || []);
    } catch (err: any) {
      console.error('Error fetching festivals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleOpen = (festival?: Festival) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData({
        name: festival.name,
        start_date: festival.start_date,
        end_date: festival.end_date,
        location: festival.location || '',
        status: festival.status,
      });
    } else {
      setSelectedFestival(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        location: '',
        status: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFestival(null);
  };

  const handleOpenDetails = (festival: Festival) => {
    setSelectedFestival(festival);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedFestival(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      let result;
      
      if (selectedFestival) {
        // Update existing festival
        result = await festivalService.updateFestival(selectedFestival.id, {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          location: formData.location,
          status: formData.status.toLowerCase(),
        });
      } else {
        // Create new festival
        result = await festivalService.createFestival({
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          location: formData.location,
          status: formData.status.toLowerCase(),
        });
      }
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to save festival');
      }
      
      // Fetch festivals to refresh the list
      fetchFestivals();
      
      handleClose();
      
      // Show success message
      setSnackbarMessage('Festival saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error saving festival:', error);
      // Show error message
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await festivalService.deleteFestival(id);
      
      if (error) {
        throw new Error(`Failed to delete festival: ${error.message}`);
      }
      
      // Refresh the festivals list
      fetchFestivals();
      
      // Show success message
      setSnackbarMessage('Festival deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting festival:', error);
      // Show error message
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Festival Name', flex: 1 },
    { 
      field: 'start_date', 
      headerName: 'Start Date', 
      flex: 1,
      valueGetter: (params) => params.row.start_date,
    },
    { 
      field: 'end_date', 
      headerName: 'End Date', 
      flex: 1,
      valueGetter: (params) => params.row.end_date,
    },
    { field: 'location', headerName: 'Location', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          color={
            params.value === 'active' ? 'success' :
            params.value === 'planning' ? 'warning' :
            params.value === 'completed' ? 'default' :
            'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpenDetails(params.row)}
            size="small"
            sx={{ mr: 1 }}
          >
            <EventIcon />
          </IconButton>
          <IconButton
            onClick={() => handleOpen(params.row)}
            size="small"
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <div>
            <Typography variant="h4" component="h1">
              Festival Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage festivals for your organization
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={loading}
          >
            Create Festival
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button
              size="small" 
              onClick={fetchFestivals}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Festivals" />
          <Tab label="Active" />
          <Tab label="Planning" />
          <Tab label="Completed" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={festivals.filter(f => {
              switch (tabIndex) {
                case 1: return f.status.toLowerCase() === 'active';
                case 2: return f.status.toLowerCase() === 'planning';
                case 3: return f.status.toLowerCase() === 'completed';
                default: return true;
              }
            })}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableRowSelectionOnClick
          />
        )}

        {/* Add/Edit Festival Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedFestival ? 'Edit Festival' : 'Add New Festival'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Festival Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!formData.name || !formData.start_date || !formData.end_date || !formData.location || !formData.status}
            >
              {selectedFestival ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Festival Details Dialog */}
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          {selectedFestival && (
            <>
              <DialogTitle>{selectedFestival.name}</DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={selectedFestival.status} 
                    color={
                      selectedFestival.status === 'active' ? 'success' : 
                      selectedFestival.status === 'planning' ? 'warning' :
                      selectedFestival.status === 'completed' ? 'default' : 'error'
                    } 
                    sx={{ mb: 2 }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Dates</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {new Date(selectedFestival.start_date).toLocaleDateString()} to {new Date(selectedFestival.end_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Location</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {selectedFestival.location || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button 
                  startIcon={<EditIcon />} 
                  onClick={() => {
                    handleCloseDetails();
                    handleOpen(selectedFestival);
                  }}
                >
                  Edit
                </Button>
                <Button onClick={handleCloseDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export { AdminFestivals }; 
