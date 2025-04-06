import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PinDrop as PinIcon,
  LocationOn as LocationIcon,
  Preview as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabaseClient';
import { assetService } from '../../lib/services';

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
  lng: -99.1403
};

// Custom marker icons for different asset statuses
const customIcons = {
  available: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  'in-use': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  maintenance: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  lost: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  retired: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  default: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

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

const AssetMap: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [zoomLevel, setZoomLevel] = useState(15);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Update the defaultCenter to always initialize with Lazy Hills Ranch coordinates
  const defaultCenter: [number, number] = [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchFestivalLocation();
  }, [festivalId]);
  
  // When filters change, update the filtered assets
  useEffect(() => {
    filterAssets();
  }, [assets, statusFilter, categoryFilter, searchTerm]);
  
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.getAssets({ festival_id: festivalId });
      
      if (response.error) {
        throw new Error(`Failed to fetch assets: ${response.error.message}`);
      }
      
      // Filter assets to only those with coordinates
      const assetsWithCoordinates = (response.data || []).filter(asset => 
        asset.location_lat && asset.location_long
      );
      
      setAssets(assetsWithCoordinates);
      setFilteredAssets(assetsWithCoordinates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await assetService.getAssetCategories();
      
      if (response.error) {
        throw new Error(`Failed to fetch categories: ${response.error.message}`);
      }
      
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };
  
  const fetchFestivalLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('festivals')
        .select('location_lat, location_long')
        .eq('id', festivalId)
        .single();
      
      if (error) throw error;
      
      if (data && data.location_lat && data.location_long) {
        setMapCenter([data.location_lat, data.location_long]);
      } else {
        // If no festival location, use the default Lazy Hills Ranch location
        setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
      }
    } catch (err) {
      console.error('Failed to fetch festival location:', err);
      // If we can't get festival location, we'll use the default Lazy Hills Ranch location
      setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
    }
  };
  
  const filterAssets = useCallback(() => {
    let filtered = [...assets];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category_id === categoryFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        asset => 
          asset.name.toLowerCase().includes(term) || 
          asset.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredAssets(filtered);
  }, [assets, statusFilter, categoryFilter, searchTerm]);
  
  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const handleCenterMap = (lat, long) => {
    setMapCenter([lat, long]);
    setZoomLevel(18); // Zoom in more on the selected asset
    handleDialogClose();
  };
  
  const handleGoToEdit = (assetId) => {
    // Navigate to asset edit page
    window.location.href = `/coordinator/festivals/${festivalId}/assets/${assetId}`;
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'primary';
      case 'maintenance':
        return 'warning';
      case 'lost':
        return 'error';
      case 'retired':
        return 'default';
      default:
        return 'default';
    }
  };
  
  const getMarkerIcon = (status) => {
    return customIcons[status] || customIcons.default;
  };

  // Define map component correctly to avoid Context issues
  const MapComponent = () => {
    return (
      <MapContainer 
        center={mapCenter || defaultCenter} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Default marker for Lazy Hills Ranch */}
        {(!filteredAssets || filteredAssets.length === 0) && (
          <Marker 
            position={defaultCenter}
            icon={new L.Icon.Default()}
          >
            <Popup>
              <Typography variant="subtitle1">Lazy Hills Ranch</Typography>
              <Typography variant="body2">
                Kerrville, TX
              </Typography>
            </Popup>
          </Marker>
        )}
        
        {filteredAssets.map((asset) => (
          <Marker 
            key={asset.id} 
            position={[asset.location_lat, asset.location_long]}
            icon={getMarkerIcon(asset.status)}
            eventHandlers={{
              click: () => handleAssetClick(asset),
            }}
          >
            <Popup>
              <Typography variant="subtitle1">{asset.name}</Typography>
              <Typography variant="body2">
                {asset.description || 'No description'}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={asset.status?.toUpperCase()} 
                  color={getStatusColor(asset.status)}
                  size="small"
                />
              </Box>
            </Popup>
          </Marker>
        ))}
        
        {/* Component to update map view when center changes */}
        <SetMapView center={mapCenter || defaultCenter} zoom={zoomLevel} />
      </MapContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Asset Map - {DEFAULT_LOCATION.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={fetchAssets}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh Assets'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Assets"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in-use">In Use</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {filteredAssets.length} assets displayed on map
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {/* Map */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{
                height: '600px',
                width: '100%',
                overflow: 'hidden',
                '& .leaflet-container': {
                  height: '100%',
                  width: '100%'
                }
              }}
              elevation={2}
            >
              {loading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <MapComponent />
              )}
            </Paper>
          </Grid>
          
          {/* Asset List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '600px', overflow: 'auto' }}>
              <List dense>
                {filteredAssets.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No assets with coordinates found" 
                      secondary="Add location coordinates to assets to see them on the map"
                    />
                  </ListItem>
                ) : (
                  filteredAssets.map((asset) => (
                    <React.Fragment key={asset.id}>
                      <ListItem
                        button
                        onClick={() => handleAssetClick(asset)}
                      >
                        <ListItemIcon>
                          <LocationIcon color={getStatusColor(asset.status)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={asset.name}
                          secondary={
                            <>
                              {getCategoryName(asset.category_id)}
                              <br />
                              <Chip 
                                label={asset.status?.toUpperCase()} 
                                color={getStatusColor(asset.status)}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Asset Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedAsset && (
          <>
            <DialogTitle>{selectedAsset.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Description</Typography>
                  <Typography variant="body2">
                    {selectedAsset.description || 'No description available'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Category</Typography>
                  <Typography variant="body2">
                    {getCategoryName(selectedAsset.category_id)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip 
                    label={selectedAsset.status?.toUpperCase()} 
                    color={getStatusColor(selectedAsset.status)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Location</Typography>
                  <Typography variant="body2">
                    Latitude: {selectedAsset.location_lat}, Longitude: {selectedAsset.location_long}
                  </Typography>
                </Grid>
                
                {selectedAsset.current_location_id && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Location ID/Name</Typography>
                    <Typography variant="body2">
                      {selectedAsset.current_location_id}
                    </Typography>
                  </Grid>
                )}
                
                {selectedAsset.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Notes</Typography>
                    <Typography variant="body2">
                      {selectedAsset.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<PinIcon />}
                onClick={() => handleCenterMap(selectedAsset.location_lat, selectedAsset.location_long)}
              >
                Center on Map
              </Button>
              <Button 
                startIcon={<EditIcon />}
                onClick={() => handleGoToEdit(selectedAsset.id)}
              >
                Edit Asset
              </Button>
              <Button onClick={handleDialogClose}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AssetMap; 