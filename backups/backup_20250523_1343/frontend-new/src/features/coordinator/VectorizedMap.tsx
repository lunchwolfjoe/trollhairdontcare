import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  MyLocation as LocationIcon,
} from '@mui/icons-material';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import '../../../src/utils/leaflet-icons';
import { redIcon } from '../../../src/utils/leaflet-icons';

// Use a different approach to provide the default marker icons for Leaflet
// that avoids TypeScript errors with the prototype
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set the default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

// Define the available maps with correct file paths that actually exist
const mapImages = [
  {
    id: 'map1',
    name: '2019 Program Map',
    url: '/images/2019-Program-Map-of-QVR-1536x983.jpg',
    bounds: L.latLngBounds(
      [-983, 0],
      [0, 1536]
    )
  },
  {
    id: 'map2',
    name: 'Mapdana 2020',
    url: '/images/KFF_Mapdana2020-FINAL-W-1536x1536.jpg',
    bounds: L.latLngBounds(
      [-1536, 0],
      [0, 1536]
    )
  },
  {
    id: 'aerial1',
    name: 'Aerial View 1',
    url: '/images/Aerial01KenSchmidt.avif',
    bounds: L.latLngBounds(
      [-670, 0],
      [0, 1200]
    )
  },
  {
    id: 'aerial2',
    name: 'Aerial View 2',
    url: '/images/Aerial03KenSchmidt.avif',
    bounds: L.latLngBounds(
      [-868, 0],
      [0, 1200]
    )
  }
];

// Define location types
const LOCATION_TYPES = {
  RV_SPOT: 'RV Spot',
  STAGE: 'Stage',
  AMENITY: 'Amenity',
  SERVICE: 'Service',
  CAMPING: 'Camping',
  VENDOR: 'Vendor',
  GENERAL: 'General',
} as const;

// Add these interfaces at the top of the file
interface RVDetails {
  powerHookup: '30amp' | '50amp' | 'none';
  waterHookup: boolean;
  sewerHookup: boolean;
  length: number;
  spotNumber: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
  status: string;
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  notes: string;
  rvDetails?: RVDetails;
}

// Interface for reference points
interface ReferencePoint {
  id: string;
  geoPoint: {
    lat: number;
    lng: number;
  };
  description?: string;
}

interface MapReferencePoint {
  referencePointId: string;
  mapId: string;
  imagePoint: {
    x: number;
    y: number;
  };
}

// Component to set map view
interface SetMapViewProps {
  center: [number, number];
  zoom: number;
}

const SetMapView: React.FC<SetMapViewProps> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Click handler - IMPORTANT FIX: Add isSettingReference to handle both types of clicks
interface ClickHandlerProps {
  onMapClick: (latlng: [number, number]) => void;
  isAdding: boolean;
  isSettingReference: boolean;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick, isAdding, isSettingReference }) => {
  useMapEvents({
    click: (e) => {
      // Handle both adding locations and setting reference points
      if (isAdding || isSettingReference) {
        console.log("Map clicked at:", [e.latlng.lat, e.latlng.lng]);
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });

  return null;
};

// Map component
interface LeafletMapProps {
  bounds: L.LatLngBounds;
  currentMap: typeof mapImages[0];
  locations: Location[];
  referencePoints: ReferencePoint[];
  mapReferencePoints: MapReferencePoint[];
  isAdding: boolean;
  isSettingReference: boolean;
  handleMapClick: (position: [number, number]) => void;
}

// Debug component to show map information with null safety
const MapDebugInfo: React.FC = () => {
  const map = useMap();
  const [info, setInfo] = useState({
    center: map.getCenter(),
    bounds: map.getBounds(),
    zoom: map.getZoom(),
    size: map.getSize(),
  });

  useEffect(() => {
    const updateInfo = () => {
      setInfo({
        center: map.getCenter(),
        bounds: map.getBounds(),
        zoom: map.getZoom(),
        size: map.getSize(),
      });
    };

    map.on('move', updateInfo);
    map.on('zoom', updateInfo);
    map.on('resize', updateInfo);
    updateInfo();

    return () => {
      map.off('move', updateInfo);
      map.off('zoom', updateInfo);
      map.off('resize', updateInfo);
    };
  }, [map]);

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '8px',
      borderRadius: '5px',
      zIndex: 1000,
      fontSize: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <div><strong>Center:</strong> [{info.center?.lat.toFixed(2) || 0}, {info.center?.lng.toFixed(2) || 0}]</div>
      <div><strong>Zoom:</strong> {info.zoom}</div>
      <div><strong>Map Size:</strong> {info.size?.x || 0}×{info.size?.y || 0}</div>
      <div><strong>Bounds:</strong></div>
      {info.bounds ? (
        <>
          <div>SW: [{info.bounds.getSouthWest().lat.toFixed(2)}, {info.bounds.getSouthWest().lng.toFixed(2)}]</div>
          <div>NE: [{info.bounds.getNorthEast().lat.toFixed(2)}, {info.bounds.getNorthEast().lng.toFixed(2)}]</div>
        </>
      ) : (
        <div>Not available</div>
      )}
    </div>
  );
};

// Component to initialize map with bounds
const MapInitializer: React.FC<{ bounds: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    console.log("Initializing map with bounds:", bounds.toString());
    try {
      map.fitBounds(bounds);
    } catch (err) {
      console.error("Error fitting bounds:", err);
    }
  }, [map, bounds]);
  
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  bounds,
  currentMap,
  locations,
  referencePoints,
  mapReferencePoints,
  isAdding,
  isSettingReference,
  handleMapClick
}) => {
  const instanceKey = React.useMemo(() => currentMap.id + '_' + Math.random(), [currentMap.id]);
  const center = bounds.getCenter();
  
  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative' 
    }}>
      <MapContainer 
        key={instanceKey}
        center={center}
        style={{ 
          height: '100%', 
          width: '100%'
        }}
        crs={L.CRS.Simple}
        minZoom={-2}
        maxZoom={2}
        zoom={0}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <MapInitializer bounds={bounds} />
        
        <ImageOverlay
          url={currentMap.url}
          bounds={bounds}
          opacity={1}
        />
        
        <MapDebugInfo />
        
        {locations.map((location) => (
          <Marker 
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={defaultIcon}
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
        
        {referencePoints.map((point) => {
          const mapPosition = mapReferencePoints.find(
            mp => mp.referencePointId === point.id && mp.mapId === currentMap.id
          )?.imagePoint;
          
          if (!mapPosition) return null;
          
          return (
            <Marker 
              key={`ref-${point.id}`}
              position={[mapPosition.x, mapPosition.y]}
              icon={redIcon}
            >
              <Popup>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1">{point.description || 'Reference Point'}</Typography>
                  <Typography variant="body2">Map: ({mapPosition.x.toFixed(2)}, {mapPosition.y.toFixed(2)})</Typography>
                  <Typography variant="body2">GPS: ({point.geoPoint.lat.toFixed(6)}, {point.geoPoint.lng.toFixed(6)})</Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
        
        <ClickHandler 
          onMapClick={handleMapClick} 
          isAdding={isAdding} 
          isSettingReference={isSettingReference} 
        />
      </MapContainer>
    </div>
  );
};

const VectorizedMap: React.FC = () => {
  // State for map management
  const [selectedMapIndex, setSelectedMapIndex] = useState<number>(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for location editing
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState<boolean>(false);
  
  // State for reference points
  const [globalReferencePoints, setGlobalReferencePoints] = useState<ReferencePoint[]>([]);
  const [mapReferencePoints, setMapReferencePoints] = useState<MapReferencePoint[]>([]);
  const [isSettingReference, setIsSettingReference] = useState<boolean>(false);
  const [selectedReferencePoint, setSelectedReferencePoint] = useState<ReferencePoint | null>(null);
  const [referenceDialogOpen, setReferenceDialogOpen] = useState<boolean>(false);
  const [newRefLat, setNewRefLat] = useState<string>('');
  const [newRefLng, setNewRefLng] = useState<string>('');
  const [tempReferencePoint, setTempReferencePoint] = useState<{x: number, y: number} | null>(null);
  
  // Sidebar for locations list
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Get current map
  const currentMap = mapImages[selectedMapIndex];
  
  const defaultLocation: Location = {
    id: '',
    name: '',
    type: LOCATION_TYPES.GENERAL,
    coordinates: { lat: 0, lng: 0 },
    status: 'Available',
    capacity: 1,
    currentOccupancy: 0,
    facilities: [],
    notes: '',
  };

  const [editedLocation, setEditedLocation] = useState<Location>(defaultLocation);
  
  // Load locations from localStorage on component mount
  useEffect(() => {
    // Load locations for the current map
    const savedLocations = localStorage.getItem(`locations_${currentMap.id}`);
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
    
    // Load reference points
    const savedGlobalRefPoints = localStorage.getItem('globalReferencePoints');
    if (savedGlobalRefPoints) {
      setGlobalReferencePoints(JSON.parse(savedGlobalRefPoints));
    }
    
    const savedMapRefPoints = localStorage.getItem(`mapReferencePoints_${currentMap.id}`);
    if (savedMapRefPoints) {
      setMapReferencePoints(JSON.parse(savedMapRefPoints));
    }
  }, [currentMap.id]);
  
  // Handle map change
  const handleMapChange = (event: SelectChangeEvent<number>) => {
    const newIndex = Number(event.target.value);
    // Ensure valid index
    if (newIndex >= 0 && newIndex < mapImages.length) {
      setSelectedMapIndex(newIndex);
      
      // Load locations for the new map
      const savedLocations = localStorage.getItem(`locations_${mapImages[newIndex].id}`);
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      } else {
        setLocations([]);
      }
      
      // Reset states
      setSelectedLocation(null);
      setEditedLocation({
        id: '',
        name: '',
        type: LOCATION_TYPES.GENERAL,
        coordinates: { lat: 0, lng: 0 },
        status: 'Available',
        capacity: 1,
        currentOccupancy: 0,
        facilities: [],
        notes: '',
      });
      setIsAdding(false);
      setLocationDialogOpen(false);
    }
  };
  
  // Handle map click for adding location or reference point
  const handleMapClick = (position: [number, number]) => {
    console.log("Map click received, isAdding:", isAdding, "isSettingReference:", isSettingReference);
    
    if (isAdding) {
      setSelectedLocation({
        id: Date.now().toString(),
        name: '',
        type: '',
        coordinates: { lat: position[0], lng: position[1] },
        status: 'Active',
        capacity: 0,
        currentOccupancy: 0,
        facilities: [],
        notes: '',
      });
      
      setLocationDialogOpen(true);
    } else if (isSettingReference) {
      // Use exact coordinates from click for reference point
      const point = { x: position[0], y: position[1] };
      console.log(`Setting reference point at:`, point);
      setTempReferencePoint(point);
      setReferenceDialogOpen(true);
    }
  };
  
  const handleAddLocation = () => {
    setIsAdding(true);
    setSelectedLocation(null);
    setEditedLocation(defaultLocation);
    setLocationDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setEditedLocation({ ...location });
    setLocationDialogOpen(true);
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      // Update existing location
      const updatedLocations = locations.map(loc => 
        loc.id === selectedLocation.id ? editedLocation : loc
      );
    setLocations(updatedLocations);
      localStorage.setItem(`locations_${currentMap.id}`, JSON.stringify(updatedLocations));
    } else {
      // Add new location
      const newLocation: Location = {
        ...editedLocation,
        id: uuidv4(),
      };
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      localStorage.setItem(`locations_${currentMap.id}`, JSON.stringify(updatedLocations));
    }
    setLocationDialogOpen(false);
    setSelectedLocation(null);
    setEditedLocation(defaultLocation);
    setIsAdding(false);
  };
  
  // Delete a location
  const handleDeleteLocation = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    setLocations(updatedLocations);
    
    // Save to localStorage
    localStorage.setItem(`locations_${currentMap.id}`, JSON.stringify(updatedLocations));
  };
  
  // Fetch reference points
  const fetchReferencePoints = async () => {
    try {
      // Load global reference points
      const savedGlobalPoints = localStorage.getItem('globalReferencePoints');
      if (savedGlobalPoints) {
        setGlobalReferencePoints(JSON.parse(savedGlobalPoints));
      }

      // Load map-specific positions
      const savedMapPoints = localStorage.getItem(`mapReferencePoints_${currentMap.id}`);
      if (savedMapPoints) {
        setMapReferencePoints(JSON.parse(savedMapPoints));
      }
    } catch (err) {
      console.error('Error loading reference points:', err);
    }
  };
  
  // Save reference point with geo coordinates
  const handleSaveReferencePoint = async () => {
    if (!tempReferencePoint || !selectedReferencePoint) return;

    // Create or update the map-specific position
    const mapPoint: MapReferencePoint = {
      referencePointId: selectedReferencePoint.id,
      mapId: currentMap.id,
      imagePoint: tempReferencePoint
    };

    // Update or add the map point
    const updatedMapPoints = mapReferencePoints.filter(
      p => !(p.referencePointId === selectedReferencePoint.id && p.mapId === currentMap.id)
    );
    updatedMapPoints.push(mapPoint);

    // Save to state and localStorage
    setMapReferencePoints(updatedMapPoints);
    localStorage.setItem(`mapReferencePoints_${currentMap.id}`, JSON.stringify(updatedMapPoints));

    setReferenceDialogOpen(false);
    setTempReferencePoint(null);
    setIsSettingReference(false);
    setSelectedReferencePoint(null);
  };

  // Create new global reference point
  const handleCreateGlobalReference = async () => {
    if (!tempReferencePoint) return;
    
    const newPoint: ReferencePoint = {
      id: Date.now().toString(),
      geoPoint: {
        lat: parseFloat(newRefLat),
        lng: parseFloat(newRefLng)
      },
      description: `Reference Point ${globalReferencePoints.length + 1}`
    };

    // Save global point
    const updatedGlobalPoints = [...globalReferencePoints, newPoint];
    setGlobalReferencePoints(updatedGlobalPoints);
    localStorage.setItem('globalReferencePoints', JSON.stringify(updatedGlobalPoints));

    // Save map-specific position
    const mapPoint: MapReferencePoint = {
      referencePointId: newPoint.id,
      mapId: currentMap.id,
      imagePoint: tempReferencePoint
    };

    const updatedMapPoints = [...mapReferencePoints, mapPoint];
    setMapReferencePoints(updatedMapPoints);
    localStorage.setItem(`mapReferencePoints_${currentMap.id}`, JSON.stringify(updatedMapPoints));

    setReferenceDialogOpen(false);
    setTempReferencePoint(null);
    setIsSettingReference(false);
  };

  // Handle reference point selection for positioning
  const handleSelectReferencePoint = (point: ReferencePoint) => {
    setSelectedReferencePoint(point);
    setIsSettingReference(true);
    setNewRefLat(point.geoPoint.lat.toString());
    setNewRefLng(point.geoPoint.lng.toString());
  };

  // Get the map position for a reference point
  const getMapPosition = (referencePointId: string) => {
    return mapReferencePoints.find(
      p => p.referencePointId === referencePointId && p.mapId === currentMap.id
    )?.imagePoint;
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Map</InputLabel>
          <Select
            value={selectedMapIndex}
            label="Select Map"
            onChange={handleMapChange}
          >
            {mapImages.map((map, index) => (
              <MenuItem key={map.id} value={index}>
                {map.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          color={isAdding ? "secondary" : "primary"}
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
        >
          {isAdding ? 'Cancel Adding' : 'Add Location'}
        </Button>
      </Box>
      
      {/* Information alerts */}
      {mapReferencePoints.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Reference Points Needed</AlertTitle>
          To accurately place items on your map, add at least 3 reference points by clicking the "Add Reference Point" button
          and then clicking on the map. For each point, you'll need to provide the real-world GPS coordinates.
        </Alert>
      )}
      
      {mapReferencePoints.length > 0 && mapReferencePoints.length < 3 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>More Reference Points Needed</AlertTitle>
          You have {mapReferencePoints.length} reference point(s). For better accuracy, add at least 3 reference points.
        </Alert>
      )}
      
      {/* Map container - FULL HEIGHT */}
      <Paper 
        sx={{ 
          width: '100%',
          height: 'calc(100vh - 100px)',
          minHeight: '800px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, position: 'relative', height: '100%' }}>
            <LeafletMap 
              bounds={currentMap.bounds}
              currentMap={currentMap}
              locations={locations}
              referencePoints={globalReferencePoints}
              mapReferencePoints={mapReferencePoints}
              isAdding={isAdding}
              isSettingReference={isSettingReference}
              handleMapClick={handleMapClick}
            />
          </Box>
        )}
        
        {isAdding && (
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: '50%', 
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              p: 2,
              borderRadius: 1
            }}
          >
            <Typography variant="body2">
              Click on the map to add a new location
            </Typography>
          </Box>
        )}
        
        {isSettingReference && (
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: '50%', 
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              p: 2,
              borderRadius: 1
            }}
          >
            <Typography variant="body2">
              Click on the map to add a reference point. You'll be prompted to enter GPS coordinates.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Location Dialog */}
      <LocationDialog 
        open={locationDialogOpen} 
        onClose={() => {
          setLocationDialogOpen(false);
          setIsAdding(false);
        }}
        onSave={handleSaveLocation}
        location={selectedLocation}
        isNew={!selectedLocation}
      />
      
      {/* Reference Point Dialog */}
      <Dialog
        open={referenceDialogOpen}
        onClose={() => {
          setReferenceDialogOpen(false);
          setIsSettingReference(false);
          setTempReferencePoint(null);
          setSelectedReferencePoint(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedReferencePoint ? 'Position Reference Point' : 'Add New Reference Point'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tempReferencePoint && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Map Position: ({tempReferencePoint.x.toFixed(2)}, {tempReferencePoint.y.toFixed(2)})
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  These are the pixel coordinates where you clicked on the map image.
                </Typography>
              </Alert>
            )}
            
            {selectedReferencePoint ? (
              <>
                <Typography variant="body1" color="text.primary">
                  Position this reference point on the current map:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  GPS: ({selectedReferencePoint.geoPoint.lat.toFixed(6)}, {selectedReferencePoint.geoPoint.lng.toFixed(6)})
                </Typography>
              </>
            ) : (
              <>
            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
              Enter the real-world GPS coordinates for this location:
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Reference points help connect map positions to real-world GPS coordinates.
              Add at least 3 reference points for accurate coordinate conversion.
            </Typography>
            
            <TextField
              label="Latitude"
              type="number"
              value={newRefLat}
              onChange={(e) => setNewRefLat(e.target.value)}
              fullWidth
              required
              helperText="Example: 30.2672"
              inputProps={{ step: 'any' }}
            />
            
            <TextField
              label="Longitude"
              type="number"
              value={newRefLng}
              onChange={(e) => setNewRefLng(e.target.value)}
              fullWidth
              required
              helperText="Example: -97.7431"
              inputProps={{ step: 'any' }}
            />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReferenceDialogOpen(false);
            setIsSettingReference(false);
            setTempReferencePoint(null);
            setSelectedReferencePoint(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={selectedReferencePoint ? handleSaveReferencePoint : handleCreateGlobalReference}
            color="primary"
            variant="contained"
            disabled={selectedReferencePoint ? !tempReferencePoint : (!newRefLat || !newRefLng || !tempReferencePoint)}
          >
            {selectedReferencePoint ? 'Update Position' : 'Create Reference Point'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Update the location dialog content to handle undefined cases
const LocationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  location: Location | null;
  isNew: boolean;
}> = ({ open, onClose, onSave, location, isNew }) => {
  const [editedLocation, setEditedLocation] = useState<Location>(() => {
    if (location) return { ...location };
    return {
      id: '',
      name: '',
      type: LOCATION_TYPES.GENERAL,
      coordinates: { lat: 0, lng: 0 },
      status: 'Available',
      capacity: 1,
      currentOccupancy: 0,
      facilities: [],
      notes: '',
    };
  });

  const updateRVDetails = (update: Partial<RVDetails>) => {
    setEditedLocation(prev => ({
      ...prev,
      rvDetails: {
        ...(prev.rvDetails || {
          powerHookup: '30amp',
          waterHookup: false,
          sewerHookup: false,
          length: 0,
          spotNumber: '',
        }),
        ...update,
      }
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isNew ? 'Add New Location' : 'Edit Location'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={editedLocation.name}
            onChange={(e) => setEditedLocation(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={editedLocation.type}
              label="Type"
              onChange={(e) => {
                const newType = e.target.value;
                setEditedLocation(prev => ({
                  ...prev,
                  type: newType,
                  rvDetails: newType === LOCATION_TYPES.RV_SPOT ? {
                    powerHookup: '30amp',
                    waterHookup: false,
                    sewerHookup: false,
                    length: 0,
                    spotNumber: '',
                  } : undefined
                }));
              }}
            >
              {Object.values(LOCATION_TYPES).map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {editedLocation.type === LOCATION_TYPES.RV_SPOT && (
            <>
              <TextField
                label="Spot Number"
                value={editedLocation.rvDetails?.spotNumber || ''}
                onChange={(e) => updateRVDetails({ spotNumber: e.target.value })}
                fullWidth
                required
                helperText="Enter the RV spot number (e.g. 'RV-42')"
              />
              
              <FormControl fullWidth>
                <InputLabel>Power Hookup</InputLabel>
                <Select
                  value={editedLocation.rvDetails?.powerHookup || '30amp'}
                  label="Power Hookup"
                  onChange={(e) => updateRVDetails({ powerHookup: e.target.value as '30amp' | '50amp' | 'none' })}
                >
                  <MenuItem value="30amp">30 AMP</MenuItem>
                  <MenuItem value="50amp">50 AMP</MenuItem>
                  <MenuItem value="none">No Power</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedLocation.rvDetails?.waterHookup || false}
                      onChange={(e) => updateRVDetails({ waterHookup: e.target.checked })}
                    />
                  }
                  label="Water Hookup"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedLocation.rvDetails?.sewerHookup || false}
                      onChange={(e) => updateRVDetails({ sewerHookup: e.target.checked })}
                    />
                  }
                  label="Sewer Hookup"
                />
              </Box>
              
              <TextField
                label="Maximum Length (ft)"
                type="number"
                value={editedLocation.rvDetails?.length || ''}
                onChange={(e) => updateRVDetails({ length: parseInt(e.target.value) || 0 })}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </>
          )}
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editedLocation.status}
              label="Status"
              onChange={(e) => setEditedLocation(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Occupied">Occupied</MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Notes"
            value={editedLocation.notes}
            onChange={(e) => setEditedLocation(prev => ({ ...prev, notes: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => {
            onSave();
            setEditedLocation({
              id: '',
              name: '',
              type: LOCATION_TYPES.GENERAL,
              coordinates: { lat: 0, lng: 0 },
              status: 'Available',
              capacity: 1,
              currentOccupancy: 0,
              facilities: [],
              notes: '',
            });
          }} 
          color="primary" 
          variant="contained"
          disabled={!editedLocation.name}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { VectorizedMap }; 