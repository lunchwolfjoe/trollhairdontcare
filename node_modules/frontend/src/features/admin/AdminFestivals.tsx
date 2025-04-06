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
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CardActionArea,
  Chip,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  LinearProgress,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  MoreVert as MoreVertIcon,
  DateRange as DateRangeIcon,
  Place as PlaceIcon,
  Refresh as RefreshIcon,
  PeopleAlt as PeopleIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFestivalForMenu, setSelectedFestivalForMenu] = useState<Festival | null>(null);
  const [volunteers, setVolunteers] = useState<Record<string, number>>({});

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

  const fetchVolunteerCounts = async () => {
    if (!festivals || festivals.length === 0) return;
    
    try {
      const counts: Record<string, number> = {};
      
      // For each festival, count the volunteers
      for (const festival of festivals) {
        const { data, error } = await supabase
          .from('volunteers')
          .select('id', { count: 'exact' })
          .eq('festival_id', festival.id);
        
        if (!error) {
          counts[festival.id] = data?.length || 0;
        }
      }
      
      setVolunteers(counts);
    } catch (err) {
      console.error('Error fetching volunteer counts:', err);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  useEffect(() => {
    if (festivals.length > 0) {
      fetchVolunteerCounts();
    }
  }, [festivals]);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, festival: Festival) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFestivalForMenu(festival);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedFestivalForMenu(null);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same month and year
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // If same year but different months
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
    }
    
    // Different years
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'planning': return 'warning';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const filteredFestivals = festivals.filter(f => {
    switch (tabIndex) {
      case 1: return f.status.toLowerCase() === 'active';
      case 2: return f.status.toLowerCase() === 'planning';
      case 3: return f.status.toLowerCase() === 'completed';
      default: return true;
    }
  });

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
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <div>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Festival Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage festivals for your organization
            </Typography>
          </div>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchFestivals}
              disabled={loading}
            >
              Refresh
            </Button>
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

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            sx={{ mb: 1 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={<Badge badgeContent={festivals.length} color="primary">All Festivals</Badge>} />
            <Tab label={<Badge badgeContent={festivals.filter(f => f.status.toLowerCase() === 'active').length} color="success">Active</Badge>} />
            <Tab label={<Badge badgeContent={festivals.filter(f => f.status.toLowerCase() === 'planning').length} color="warning">Planning</Badge>} />
            <Tab label={<Badge badgeContent={festivals.filter(f => f.status.toLowerCase() === 'completed').length} color="default">Completed</Badge>} />
          </Tabs>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <Tooltip title="List View">
                <ListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Grid View">
                <GridIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'list' ? (
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={filteredFestivals}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
                sorting: {
                  sortModel: [{ field: 'start_date', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                  cursor: 'pointer',
                },
              }}
            />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredFestivals.map((festival) => (
              <Grid item xs={12} sm={6} md={4} key={festival.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 120,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={(e) => handleMenuOpen(e, festival)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <CalendarIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Chip 
                      label={festival.status.charAt(0).toUpperCase() + festival.status.slice(1)}
                      color={getStatusColor(festival.status) as any}
                      size="small"
                      sx={{ position: 'absolute', bottom: -12, fontWeight: 'bold' }}
                    />
                  </CardMedia>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {festival.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateRange(festival.start_date, festival.end_date)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {festival.location || 'No location set'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {volunteers[festival.id] || 0} Volunteers
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EventIcon />}
                      onClick={() => handleOpenDetails(festival)}
                    >
                      Details
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpen(festival)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            {filteredFestivals.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No festivals found
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ mt: 2 }}
                  >
                    Create Festival
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Festival Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleOpenDetails(selectedFestivalForMenu!);
            handleMenuClose();
          }}>
            <EventIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpen(selectedFestivalForMenu!);
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              handleDelete(selectedFestivalForMenu!.id);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

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
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          {selectedFestival && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {selectedFestival.name}
                  </Typography>
                  <Chip 
                    label={selectedFestival.status.charAt(0).toUpperCase() + selectedFestival.status.slice(1)} 
                    color={getStatusColor(selectedFestival.status) as any}
                    size="medium"
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  {/* Festival Banner */}
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        height: 120, 
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        p: 3,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <Typography variant="overline">
                        {new Date(selectedFestival.start_date).getFullYear()}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {selectedFestival.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Festival Details */}
                  <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Festival Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <DateRangeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Duration
                                </Typography>
                                <Typography variant="body2">
                                  {formatDateRange(selectedFestival.start_date, selectedFestival.end_date)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <TimeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Days Until Start
                                </Typography>
                                <Typography variant="body2">
                                  {Math.max(0, Math.ceil((new Date(selectedFestival.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <LocationIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Location
                                </Typography>
                                <Typography variant="body2">
                                  {selectedFestival.location || 'Not specified'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <PeopleIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Volunteers
                                </Typography>
                                <Typography variant="body2">
                                  {volunteers[selectedFestival.id] || 0} registered
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Progress
                        </Typography>
                        
                        {selectedFestival.status === 'planning' && (
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Planning Phase</Typography>
                              <Typography variant="caption">75%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                        )}
                        
                        {selectedFestival.status === 'active' && (
                          <Box sx={{ mt: 1 }}>
                            {(() => {
                              const startDate = new Date(selectedFestival.start_date).getTime();
                              const endDate = new Date(selectedFestival.end_date).getTime();
                              const today = new Date().getTime();
                              const progress = Math.max(0, Math.min(100, ((today - startDate) / (endDate - startDate)) * 100));
                              
                              return (
                                <>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption">Festival Progress</Typography>
                                    <Typography variant="caption">{Math.round(progress)}%</Typography>
                                  </Box>
                                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                                </>
                              );
                            })()}
                          </Box>
                        )}
                        
                        {selectedFestival.status === 'completed' && (
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Completed</Typography>
                              <Typography variant="caption">100%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Festival Stats */}
                  <Grid item xs={12} md={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={12}>
                        <Card sx={{ borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                          <CardContent>
                            <Typography variant="overline" fontWeight="bold">Total Days</Typography>
                            <Typography variant="h4">
                              {Math.ceil((new Date(selectedFestival.end_date).getTime() - new Date(selectedFestival.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} md={12}>
                        <Card sx={{ borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                          <CardContent>
                            <Typography variant="overline" fontWeight="bold">Volunteers</Typography>
                            <Typography variant="h4">
                              {volunteers[selectedFestival.id] || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Quick Actions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<EditIcon />}
                                onClick={() => {
                                  handleCloseDetails();
                                  handleOpen(selectedFestival);
                                }}
                                fullWidth
                              >
                                Edit Festival
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<PeopleIcon />}
                                fullWidth
                              >
                                Manage Volunteers
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
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
