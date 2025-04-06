import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
// This is needed because the webpack build process doesn't handle the default icons correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Default coordinates for Lazy Hills Ranch in Kerrville, TX
const DEFAULT_LOCATION = {
  name: 'Lazy Hills Ranch, Kerrville, TX',
  lat: 30.0469,
  lon: -99.1403
};

// Mock data for locations - updated to use Kerrville coordinates
const mockLocations = [
  {
    id: '1',
    name: 'Main Stage',
    type: 'Stage',
    coordinates: { lat: 30.0469, lng: -99.1403 },
    status: 'Active',
    capacity: 5000,
    currentOccupancy: 3000,
    facilities: ['Sound System', 'Lighting', 'Backstage'],
    notes: 'Main performance area',
  },
  {
    id: '2',
    name: 'Food Court',
    type: 'Amenity',
    coordinates: { lat: 30.0470, lng: -99.1404 },
    status: 'Active',
    capacity: 2000,
    currentOccupancy: 1500,
    facilities: ['Food Stalls', 'Seating', 'Waste Management'],
    notes: 'Central dining area',
  },
  {
    id: '3',
    name: 'First Aid Station',
    type: 'Service',
    coordinates: { lat: 30.0471, lng: -99.1402 },
    status: 'Active',
    capacity: 50,
    currentOccupancy: 10,
    facilities: ['Medical Supplies', 'Beds', 'Staff Room'],
    notes: 'Emergency medical services',
  },
];

// Component to set map view to festival location
const SetMapView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const Map: React.FC = () => {
  const [locations, setLocations] = useState(mockLocations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: '',
    coordinates: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lon },
    capacity: 0,
    facilities: [],
    notes: '',
  });
  
  // Create a ref to check if the component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDialogOpen = (location = null) => {
    if (location) {
      setSelectedLocation(location);
      setNewLocation(location);
    } else {
      setSelectedLocation(null);
      setNewLocation({
        name: '',
        type: '',
        coordinates: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lon },
        capacity: 0,
        facilities: [],
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedLocation(null);
    setNewLocation({
      name: '',
      type: '',
      coordinates: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lon },
      capacity: 0,
      facilities: [],
      notes: '',
    });
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      // Update existing location
      setLocations(
        locations.map((location) =>
          location.id === selectedLocation.id ? { ...location, ...newLocation } : location
        )
      );
    } else {
      // Add new location
      const newLocationWithId = {
        ...newLocation,
        id: `${Date.now()}`,
        status: 'Active',
        currentOccupancy: 0,
      };
      setLocations([...locations, newLocationWithId]);
    }
    handleDialogClose();
  };

  const handleDeleteLocation = (locationId) => {
    setLocations(locations.filter((location) => location.id !== locationId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOccupancyPercentage = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  // Define the map component
  const MapComponent = () => {
    return (
      <MapContainer 
        center={[DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => (
          <Marker 
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle1">{location.name}</Typography>
                <Typography variant="body2">Type: {location.type}</Typography>
                <Typography variant="body2">Status: {location.status}</Typography>
                <Typography variant="body2">Capacity: {location.capacity}</Typography>
                <Typography variant="body2">Notes: {location.notes}</Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
        
        <SetMapView 
          center={[DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]} 
          zoom={15}
        />
      </MapContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Festival Map - {DEFAULT_LOCATION.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Add Location
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Location Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Locations</Typography>
            </Box>
            <Typography variant="h4">{locations.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Active Locations</Typography>
            </Box>
            <Typography variant="h4">
              {locations.filter((location) => location.status === 'Active').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BuildIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Maintenance</Typography>
            </Box>
            <Typography variant="h4">
              {locations.filter((location) => location.status === 'Maintenance').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">Closed</Typography>
            </Box>
            <Typography variant="h4">
              {locations.filter((location) => location.status === 'Closed').length}
            </Typography>
          </Paper>
        </Grid>

        {/* Map View */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '500px', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <MapComponent />
            )}
          </Paper>
        </Grid>

        {/* Locations List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Locations
            </Typography>
            <Grid container spacing={2}>
              {locations.map((location) => (
                <Grid item xs={12} md={6} key={location.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{location.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.type}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleDialogOpen(location)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteLocation(location.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={location.status}
                        color={getStatusColor(location.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {location.currentOccupancy}/{location.capacity} ({getOccupancyPercentage(location.currentOccupancy, location.capacity)}%)
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      Facilities: {location.facilities.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes: {location.notes}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Location Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedLocation ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Location Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Type"
            value={newLocation.type}
            onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={newLocation.coordinates.lat}
            onChange={(e) => setNewLocation({
              ...newLocation,
              coordinates: { ...newLocation.coordinates, lat: parseFloat(e.target.value) }
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={newLocation.coordinates.lng}
            onChange={(e) => setNewLocation({
              ...newLocation,
              coordinates: { ...newLocation.coordinates, lng: parseFloat(e.target.value) }
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={newLocation.capacity}
            onChange={(e) => setNewLocation({ ...newLocation, capacity: parseInt(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Facilities (comma-separated)"
            value={newLocation.facilities.join(', ')}
            onChange={(e) => setNewLocation({
              ...newLocation,
              facilities: e.target.value.split(',').map(f => f.trim())
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={newLocation.notes}
            onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSaveLocation}
            variant="contained"
            color="primary"
            disabled={!newLocation.name || !newLocation.type || !newLocation.capacity}
          >
            {selectedLocation ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export { Map }; 
