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
  FormControl,
  InputLabel,
  Select,
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
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CRS, LatLngBounds, LatLng, Icon } from 'leaflet';
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

// Define the maps we have available
const mapImages = [
  {
    id: 'map1',
    name: 'Program Map 2019',
    url: '/images/2019-Program-Map-of-QVR-1536x983.jpg',
    bounds: [[0, 0], [983, 1536]] as [[number, number], [number, number]]
  },
  {
    id: 'map2',
    name: 'Map Dana 2020',
    url: '/images/KFF_Mapdana2020-FINAL-W-1536x1536.jpg',
    bounds: [[0, 0], [1536, 1536]] as [[number, number], [number, number]]
  },
  {
    id: 'map3',
    name: 'Shannon Holt Map',
    url: '/images/QVR-Map-Shannon-Holt-1536x867.webp',
    bounds: [[0, 0], [867, 1536]] as [[number, number], [number, number]]
  },
  {
    id: 'aerial1',
    name: 'Aerial View 1',
    url: '/images/Aerial01KenSchmidt.avif',
    bounds: [[0, 0], [670, 1200]] as [[number, number], [number, number]]
  },
  {
    id: 'aerial2',
    name: 'Aerial View 2',
    url: '/images/Aerial03KenSchmidt.avif',
    bounds: [[0, 0], [868, 1200]] as [[number, number], [number, number]]
  }
];

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

// Component to set map view to specific location
const SetMapView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Click handler to add new assets
const ClickHandler = ({ onMapClick, isAdding }) => {
  useMapEvents({
    click: (e) => {
      if (isAdding) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });

  return null;
};

// Component for displaying the map
function LeafletMap(props) { 
  const {
    bounds, 
    currentMap, 
    filteredAssets, 
    isAdding, 
    handleMapClick,
    handleAssetClick,
    getMarkerIcon,
    getStatusColor
  } = props;

  // Important: We need to include a random key so the MapContainer fully remounts
  // when the map changes to solve the React Context issues
  const instanceKey = React.useMemo(() => currentMap.id + '_' + Math.random(), [currentMap.id]);
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        key={instanceKey}
        center={[bounds.getCenter().lat, bounds.getCenter().lng]} 
        zoom={0}
        minZoom={-2}
        maxZoom={2}
        crs={CRS.Simple}
        style={{ height: '100%', width: '100%' }}
      >
        <ImageOverlay
          url={currentMap.url}
          bounds={bounds}
        />
        
        {filteredAssets.map((asset) => (
          <Marker 
            key={asset.id} 
            position={[
              asset.image_coordinates?.lat || bounds.getCenter().lat, 
              asset.image_coordinates?.lng || bounds.getCenter().lng
            ]}
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
        
        <ClickHandler onMapClick={handleMapClick} isAdding={isAdding} />
        <SetMapView center={[bounds.getCenter().lat, bounds.getCenter().lng]} zoom={0} />
      </MapContainer>
    </div>
  );
}

const AssetMap: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Get the current map image data
  const currentMap = mapImages[currentMapIndex];
  const bounds = new LatLngBounds(
    new LatLng(currentMap.bounds[0][0], currentMap.bounds[0][1]),
    new LatLng(currentMap.bounds[1][0], currentMap.bounds[1][1])
  );

  useEffect(() => {
    fetchAssets();
    fetchCategories();
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
      
      // Convert geographic coordinates to image coordinates for display
      const assetsWithImageCoordinates = (response.data || []).map(asset => {
        // This is a placeholder - you would need to implement a proper conversion
        // based on your specific map image and geographic coordinates
        // For now, we'll just assign some random coordinates in the image space
        return {
          ...asset,
          image_coordinates: {
            lat: Math.random() * bounds.getNorth(),
            lng: Math.random() * bounds.getEast()
          }
        };
      });
      
      setAssets(assetsWithImageCoordinates);
      setFilteredAssets(assetsWithImageCoordinates);
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
  
  const handleMapChange = (index) => {
    setCurrentMapIndex(index);
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

  const handleMapClick = (position) => {
    if (!isAdding) return;
    
    // In a real application, you would create a new asset with this position
    console.log('Adding new asset at position:', position);
    
    // Navigate to asset creation page
    window.location.href = `/coordinator/festivals/${festivalId}/assets/new?lat=${position[0]}&lng=${position[1]}`;
    
    setIsAdding(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Asset Map
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Map</InputLabel>
              <Select
                value={currentMapIndex}
                label="Select Map"
                onChange={(e) => handleMapChange(e.target.value)}
              >
                {mapImages.map((map, index) => (
                  <MenuItem key={map.id} value={index}>{map.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FilterIcon />}
              onClick={fetchAssets}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Refresh Assets'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? 'Cancel Adding' : 'Add Asset on Map'}
            </Button>
          </Box>
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
        </Grid>

        {/* Map View */}
        <Paper sx={{ height: '700px', overflow: 'hidden', mb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <LeafletMap 
              bounds={bounds}
              currentMap={currentMap}
              filteredAssets={filteredAssets}
              isAdding={isAdding}
              handleMapClick={handleMapClick}
              handleAssetClick={handleAssetClick}
              getMarkerIcon={getMarkerIcon}
              getStatusColor={getStatusColor}
            />
          )}
        </Paper>

        {/* Asset List View */}
        <Typography variant="h6" gutterBottom>
          Asset List
        </Typography>
        <Grid container spacing={2}>
          {filteredAssets.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No assets found matching the current filters.</Alert>
            </Grid>
          ) : (
            filteredAssets.map((asset) => (
              <Grid item xs={12} md={6} lg={4} key={asset.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{asset.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getCategoryName(asset.category_id)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={asset.status?.toUpperCase()} 
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {asset.description || 'No description'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleAssetClick(asset)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleGoToEdit(asset.id)}
                      >
                        Edit Asset
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Asset Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Asset Details
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box>
              <Typography variant="h6">{selectedAsset.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {getCategoryName(selectedAsset.category_id)}
              </Typography>
              <Chip 
                label={selectedAsset.status?.toUpperCase()} 
                color={getStatusColor(selectedAsset.status)}
                size="small"
                sx={{ ml: 1 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                {selectedAsset.description || 'No description available.'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Serial Number</Typography>
                  <Typography variant="body2">{selectedAsset.serial_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Purchase Date</Typography>
                  <Typography variant="body2">
                    {selectedAsset.purchase_date 
                      ? new Date(selectedAsset.purchase_date).toLocaleDateString() 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Value</Typography>
                  <Typography variant="body2">
                    {selectedAsset.value 
                      ? `$${selectedAsset.value.toFixed(2)}` 
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedAsset.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2">{selectedAsset.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {selectedAsset && (
            <Button 
              onClick={() => handleGoToEdit(selectedAsset.id)} 
              color="primary"
              startIcon={<EditIcon />}
            >
              Edit Asset
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {isAdding && (
        <Alert severity="info" sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          Click on the map to add a new asset at that location
        </Alert>
      )}
    </Container>
  );
};

export default AssetMap; 