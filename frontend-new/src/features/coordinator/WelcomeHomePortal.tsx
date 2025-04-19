import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  LocalParking as ParkingIcon,
  Home as RVIcon,
  Announcement as AnnouncementIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { festivalService } from '../../lib/services';
import { Festival, Guest } from '../../lib/types/models';
import { guestService } from '../../lib/services/guestService';

// Types for the guest check-in functionality
interface GuestSearchResult {
  guests: Guest[];
  total: number;
}

const WelcomeHomePortal: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  
  // State for festival
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  
  // State for search and guest data
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for guest details and check-in
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [credentialsIssued, setCredentialsIssued] = useState(false);
  const [addPermitDialogOpen, setAddPermitDialogOpen] = useState(false);
  const [additionalPermits, setAdditionalPermits] = useState({
    towVehicle: false,
    sleeperVehicle: false,
  });
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  
  // State for permit checkboxes (assuming these are boolean fields on Guest)
  const [towPermit, setTowPermit] = useState(false);
  const [sleeperPermit, setSleeperPermit] = useState(false);
  
  // Fetch festivals on component mount
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
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);
  
  // Handle festival change
  const handleFestivalChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newFestivalId = event.target.value as string;
    const festival = availableFestivals.find(f => f.id === newFestivalId);
    
    if (festival) {
      setCurrentFestival(festival);
      // Clear search results when changing festivals
      setSearchResults([]);
      setSelectedGuest(null);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle search submission
  const handleSearch = async () => {
    if (!currentFestival || !searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: searchError } = await guestService.getGuests(currentFestival.id, searchTerm);
      
      if (searchError) throw searchError;
      
      setSearchResults((data as Guest[]) || []);
      
      if (!data || data.length === 0) {
        setError('No guests found matching your search.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search guests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle guest selection
  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setCredentialsIssued(guest.credentials_issued);
    // Initialize checkboxes based on selected guest
    setTowPermit(guest.tow_vehicle_permit || false);
    setSleeperPermit(guest.sleeper_vehicle_permit || false);
  };
  
  // Open check-in dialog
  const handleOpenCheckIn = () => {
    if (selectedGuest) {
      setCheckInDialogOpen(true);
    }
  };
  
  // Handle check-in process
  const handleCheckIn = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: checkinError } = await guestService.checkInGuest(selectedGuest.id);
      if (checkinError) throw checkinError;
      // Update local state after check-in
      setSelectedGuest(data as Guest);
      setSearchResults(prev => prev.map(g => g.id === data?.id ? (data as Guest) : g));
      setCheckInDialogOpen(false);
      setSnackbarMessage('Guest check-in completed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to check in guest');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle opening add permit dialog
  const handleOpenAddPermit = () => {
    if (selectedGuest) {
      setAdditionalPermits({
        towVehicle: selectedGuest.tow_vehicle_permit,
        sleeperVehicle: selectedGuest.sleeper_vehicle_permit
      });
      setAddPermitDialogOpen(true);
    }
  };
  
  // Handle adding permits
  const handleAddPermits = async () => {
    if (!selectedGuest) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await guestService.updateGuestPermits(
        selectedGuest.id, 
        additionalPermits.towVehicle, 
        additionalPermits.sleeperVehicle
      );
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSelectedGuest(data);
      
      setAddPermitDialogOpen(false);
      setSnackbarMessage('Guest permits updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh search results to show updated status
      handleSearch();
    } catch (err: any) {
      console.error('Error updating guest permits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to navigate to announcements
  const goToAnnouncements = () => {
    navigate('/volunteer/communications');
  };
  
  const handleCloseDialog = () => {
    setCheckInDialogOpen(false);
    setSelectedGuest(null);
  };
  
  const handleSavePermits = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    setError(null);
    try {
      const updateData: Partial<Guest> = {
        tow_vehicle_permit: towPermit,
        sleeper_vehicle_permit: sleeperPermit,
        credentials_issued: credentialsIssued
      };
      const { data, error: updateError } = await guestService.updateGuest(selectedGuest.id, updateData);
      
      if (updateError) throw updateError;
      
      // Update local state
      setSelectedGuest(data as Guest);
      setSearchResults(prev => prev.map(g => g.id === data?.id ? (data as Guest) : g));
      setCheckInDialogOpen(false);
      setSnackbarMessage('Guest permits updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update permits');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome Home Portal
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Check-in and verify guest information at the main campground entrance.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel id="festival-select-label">Festival</InputLabel>
                <Select
                  labelId="festival-select-label"
                  id="festival-select"
                  value={currentFestival?.id || ''}
                  onChange={handleFestivalChange as any}
                  label="Festival"
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name} ({new Date(festival.start_date).toLocaleDateString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Search for Guest"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter guest name"
                disabled={!currentFestival}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={!currentFestival || !searchTerm.trim()}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Box>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Grid>
          )}
          
          {loading && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Grid>
          )}
          
          {!loading && searchResults.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Search Results
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {searchResults.map(guest => (
                  <Card
                    key={guest.id}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: selectedGuest?.id === guest.id ? '2px solid #1976d2' : 'none',
                    }}
                    onClick={() => handleSelectGuest(guest)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{guest.full_name}</Typography>
                        {guest.credentials_issued && (
                          <Chip 
                            icon={<CheckIcon />} 
                            label="Checked In" 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Box>
                      <Typography color="text.secondary">
                        RV Spot: {guest.rv_spot_number || 'Not Assigned'}
                      </Typography>
                      <Typography color="text.secondary">
                        Ticket: {guest.ticket_type}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          )}
          
          {selectedGuest && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Guest Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1" fontWeight="bold">
                          {selectedGuest.full_name}
                        </Typography>
                      </Box>
                      {selectedGuest.email && (
                        <Typography variant="body2">
                          Email: {selectedGuest.email}
                        </Typography>
                      )}
                      {selectedGuest.phone && (
                        <Typography variant="body2">
                          Phone: {selectedGuest.phone}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RVIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1" fontWeight="bold">
                          RV Spot: {selectedGuest.rv_spot_number || 'Not Assigned'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>Ticket Type:</strong> {selectedGuest.ticket_type}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ParkingIcon sx={{ mr: 1, color: selectedGuest.tow_vehicle_permit ? 'success.main' : 'text.secondary' }} />
                          <Typography>
                            Tow Vehicle Permit: {selectedGuest.tow_vehicle_permit ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CarIcon sx={{ mr: 1, color: selectedGuest.sleeper_vehicle_permit ? 'success.main' : 'text.secondary' }} />
                          <Typography>
                            Sleeper Vehicle Permit: {selectedGuest.sleeper_vehicle_permit ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>
                          <strong>Credentials Issued:</strong> {selectedGuest.credentials_issued ? 'Yes' : 'No'}
                        </Typography>
                        {selectedGuest.credentials_issued && (
                          <Chip 
                            icon={<CheckIcon />} 
                            label="Checked In" 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <Box sx={{ display: 'flex', p: 2, justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddPermit}
                  >
                    Add Permits
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={handleOpenCheckIn}
                    disabled={selectedGuest.credentials_issued}
                  >
                    {selectedGuest.credentials_issued ? 'Already Checked In' : 'Check In Guest'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Check-in Guest</DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" paragraph>
                You are checking in <strong>{selectedGuest.full_name}</strong>.
              </Typography>
              
              <Typography variant="body2" paragraph>
                Please verify that you have issued the following to the guest:
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={credentialsIssued}
                    onChange={(e) => setCredentialsIssued(e.target.checked)}
                  />
                }
                label="Wristbands and credentials have been issued"
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Guest Details:
                </Typography>
                <Typography>RV Spot: {selectedGuest.rv_spot_number || 'Not Assigned'}</Typography>
                <Typography>Ticket Type: {selectedGuest.ticket_type}</Typography>
                <Typography>
                  Tow Vehicle Permit: {selectedGuest.tow_vehicle_permit ? 'Yes' : 'No'}
                </Typography>
                <Typography>
                  Sleeper Vehicle Permit: {selectedGuest.sleeper_vehicle_permit ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePermits}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Permits'}
          </Button>
          <Button
            onClick={handleCheckIn}
            color="success"
            variant="contained"
            disabled={loading || selectedGuest?.credentials_issued}
          >
            {loading ? <CircularProgress size={24} /> : (selectedGuest?.credentials_issued ? 'Checked In' : 'Check In')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Permits Dialog */}
      <Dialog open={addPermitDialogOpen} onClose={() => setAddPermitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Vehicle Permits</DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" paragraph>
                Add vehicle permits for <strong>{selectedGuest.full_name}</strong>.
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={additionalPermits.towVehicle}
                    onChange={(e) => setAdditionalPermits({
                      ...additionalPermits,
                      towVehicle: e.target.checked
                    })}
                  />
                }
                label="Tow Vehicle Permit"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={additionalPermits.sleeperVehicle}
                    onChange={(e) => setAdditionalPermits({
                      ...additionalPermits,
                      sleeperVehicle: e.target.checked
                    })}
                  />
                }
                label="Sleeper Vehicle Permit"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: These permits will be added to the guest's record. Payment processing will be implemented in a future update.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPermitDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPermits} color="primary" variant="contained">
            Save Permits
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
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
      
      {/* Action buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        {/* Add announcement button */}
        <Button
          variant="outlined"
          startIcon={<AnnouncementIcon />}
          size="large"
          onClick={goToAnnouncements}
          sx={{ 
            minWidth: { xs: '100%', sm: '200px' },
            height: '60px'
          }}
        >
          View Announcements
        </Button>
      </Box>
    </Container>
  );
};

export { WelcomeHomePortal }; 