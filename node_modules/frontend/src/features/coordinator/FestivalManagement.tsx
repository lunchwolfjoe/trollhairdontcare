import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import { festivalService, volunteerService } from '../../lib/services';
import { Festival, Volunteer } from '../../lib/types/models';
import { SearchFilter, FilterOption } from '../../components/common/SearchFilter';
import { usePagination } from '../../hooks/usePagination';
import { useSorting } from '../../hooks/useSorting';

interface FestivalStats {
  totalVolunteers: number;
  pendingVolunteers: number;
  approvedVolunteers: number;
  totalCrews: number;
  assignedVolunteers: number;
  totalShifts: number;
  assignedShifts: number;
  upcomingShifts: number;
}

const FestivalManagement: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [festivalStats, setFestivalStats] = useState<Record<string, FestivalStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Festival>>({
    name: '',
    start_date: '',
    end_date: '',
    location: '',
    status: 'planning',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [filters, setFilters] = useState<{
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
    search?: string;
  }>({});

  const pagination = usePagination({ initialPageSize: 10 });
  const sorting = useSorting('start_date', 'asc');

  // Fetch festivals and their stats
  const fetchFestivalsAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get festivals
      try {
        const { data: festivalsData, error: festivalsError } = await festivalService.getFestivals(
          filters,
          {
            page: pagination.currentPage,
            pageSize: pagination.pageSize
          }
        );

        if (festivalsError) {
          throw new Error(`Failed to fetch festivals: ${festivalsError.message}`);
        }

        setFestivals(festivalsData || []);

        // Get stats for each festival
        const stats: Record<string, FestivalStats> = {};
        for (const festival of festivalsData || []) {
          try {
            const { data: volunteerStats } = await volunteerService.countByStatus(festival.id);
            
            // Create default stats since the methods don't exist yet
            const crewStats = { 
              totalCrews: 0, 
              assignedVolunteers: 0 
            };
            
            const shiftStats = {
              totalShifts: 0,
              assignedShifts: 0,
              upcomingShifts: 0
            };

            stats[festival.id] = {
              totalVolunteers: volunteerStats?.reduce((sum, stat) => sum + stat.count, 0) || 0,
              pendingVolunteers: volunteerStats?.find(s => s.status === 'pending')?.count || 0,
              approvedVolunteers: volunteerStats?.find(s => s.status === 'approved')?.count || 0,
              totalCrews: crewStats.totalCrews,
              assignedVolunteers: crewStats.assignedVolunteers,
              totalShifts: shiftStats.totalShifts,
              assignedShifts: shiftStats.assignedShifts,
              upcomingShifts: shiftStats.upcomingShifts,
            };
          } catch (statError) {
            console.error(`Error fetching stats for festival ${festival.id}:`, statError);
            // Continue with next festival
          }
        }
        setFestivalStats(stats);

        // Update pagination total
        try {
          const { data: countData } = await festivalService.getFestivals(filters);
          if (countData) {
            pagination.setTotalItems(countData.length);
          }
        } catch (countError) {
          console.error('Error fetching festival count:', countError);
        }
      } catch (apiError: any) {
        console.error('API Error in getFestivals:', apiError);
        setError(`Failed to connect to database. Please verify your connection. (${apiError.message})`);
        // Show an empty state
        setFestivals([]);
        setFestivalStats({});
      }
    } catch (err: any) {
      console.error('Error fetching festivals:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.pageSize, pagination.setTotalItems]);

  useEffect(() => {
    fetchFestivalsAndStats();
  }, [fetchFestivalsAndStats]);

  const handleOpenDialog = (festival?: Festival) => {
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
        status: 'planning',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFestival(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      let result;
      
      if (selectedFestival) {
        // Update existing festival
        result = await festivalService.updateFestival(selectedFestival.id, formData);
      } else {
        // Create new festival
        result = await festivalService.createFestival(formData);
      }
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to save festival');
      }
      
      // Refresh the list
      fetchFestivalsAndStats();
      
      handleCloseDialog();
      
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
    if (!window.confirm('Are you sure you want to delete this festival?')) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await festivalService.deleteFestival(id);
      
      if (error) {
        throw new Error(`Failed to delete festival: ${error.message}`);
      }
      
      // Refresh the list
      fetchFestivalsAndStats();
      
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

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Festival Name', flex: 1 },
    { 
      field: 'start_date', 
      headerName: 'Start Date', 
      flex: 1,
      valueGetter: (params) => new Date(params.row.start_date).toLocaleDateString(),
    },
    { 
      field: 'end_date', 
      headerName: 'End Date', 
      flex: 1,
      valueGetter: (params) => new Date(params.row.end_date).toLocaleDateString(),
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
            params.value === 'completed' ? 'default' : 'error'
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
            component={RouterLink}
            to={`/coordinator/festivals/${params.row.id}`}
            size="small"
            sx={{ mr: 1 }}
          >
            <EventIcon />
          </IconButton>
          <IconButton
            onClick={() => handleOpenDialog(params.row)}
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
            onClick={() => handleOpenDialog()}
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
              onClick={fetchFestivalsAndStats}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Database Connection Issues Helper */}
        {error && error.includes("Failed to connect to database") && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Database Connection Issues
            </Typography>
            <Typography variant="body1" paragraph>
              It looks like there might be issues with the database connection. Here are some things to check:
            </Typography>
            <ol>
              <li>
                <Typography>Make sure your Supabase environment variables are correctly set in your .env.local file</Typography>
              </li>
              <li>
                <Typography>Check if your Supabase project is running and accessible</Typography>
              </li>
              <li>
                <Typography>Ensure the "festivals" table exists in your Supabase database</Typography>
              </li>
              <li>
                <Typography>Check browser console for more detailed error information</Typography>
              </li>
            </ol>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" onClick={fetchFestivalsAndStats} sx={{ mr: 2 }}>
                <RefreshIcon sx={{ mr: 1 }} /> Try Again
              </Button>
            </Box>
          </Paper>
        )}

        <Box sx={{ mb: 3 }}>
          <SearchFilter
            onSearch={(query: string) => setFilters({ ...filters, search: query })}
            onFilter={(filterValues: Record<string, any>) => {
              setFilters({
                ...filters,
                status: filterValues.status || undefined
              });
            }}
            searchPlaceholder="Search festivals..."
            filterOptions={[
              {
                id: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]
              }
            ]}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={festivals}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableRowSelectionOnClick
          />
        )}

        {/* Add/Edit Festival Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <MenuItem value="planning">Planning</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
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

export { FestivalManagement }; 


