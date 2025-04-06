import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  {
    id: 1,
    name: 'Main Stage',
    type: 'Stage',
    capacity: 5000,
    coordinates: '40.7128° N, 74.0060° W',
    description: 'Primary performance area',
    currentOccupancy: 3200,
    assignedVolunteers: ['John Doe', 'Jane Smith'],
    facilities: ['Restrooms', 'First Aid', 'Water Station'],
  },
  {
    id: 2,
    name: 'Food Court',
    type: 'Service',
    capacity: 1000,
    coordinates: '40.7129° N, 74.0061° W',
    description: 'Food and beverage area',
    currentOccupancy: 750,
    assignedVolunteers: ['Bob Wilson'],
    facilities: ['Seating Area', 'Waste Bins', 'Water Station'],
  },
];

const VolunteerMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Replace this with an actual map component (e.g., Google Maps, Leaflet) */}
            <Typography variant="h6" color="text.secondary">
              Map Component will be integrated here
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Festival Locations
            </Typography>
            <List>
              {mockLocations.map((location, index) => (
                <React.Fragment key={location.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    onClick={() => setSelectedLocation(location)}
                    selected={selectedLocation?.id === location.id}
                  >
                    <ListItemIcon>
                      <LocationIcon color={selectedLocation?.id === location.id ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={location.name}
                      secondary={`${location.type} - ${location.currentOccupancy}/${location.capacity} people`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {selectedLocation && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedLocation.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedLocation.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates: {selectedLocation.coordinates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedLocation.type}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Assigned Volunteers
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {selectedLocation.assignedVolunteers.map((volunteer: string, index: number) => (
                    <Chip key={index} label={volunteer} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Available Facilities
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selectedLocation.facilities.map((facility: string, index: number) => (
                    <Chip key={index} label={facility} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerMap; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  {
    id: 1,
    name: 'Main Stage',
    type: 'Stage',
    capacity: 5000,
    coordinates: '40.7128° N, 74.0060° W',
    description: 'Primary performance area',
    currentOccupancy: 3200,
    assignedVolunteers: ['John Doe', 'Jane Smith'],
    facilities: ['Restrooms', 'First Aid', 'Water Station'],
  },
  {
    id: 2,
    name: 'Food Court',
    type: 'Service',
    capacity: 1000,
    coordinates: '40.7129° N, 74.0061° W',
    description: 'Food and beverage area',
    currentOccupancy: 750,
    assignedVolunteers: ['Bob Wilson'],
    facilities: ['Seating Area', 'Waste Bins', 'Water Station'],
  },
];

const VolunteerMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Replace this with an actual map component (e.g., Google Maps, Leaflet) */}
            <Typography variant="h6" color="text.secondary">
              Map Component will be integrated here
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Festival Locations
            </Typography>
            <List>
              {mockLocations.map((location, index) => (
                <React.Fragment key={location.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    onClick={() => setSelectedLocation(location)}
                    selected={selectedLocation?.id === location.id}
                  >
                    <ListItemIcon>
                      <LocationIcon color={selectedLocation?.id === location.id ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={location.name}
                      secondary={`${location.type} - ${location.currentOccupancy}/${location.capacity} people`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {selectedLocation && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedLocation.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedLocation.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates: {selectedLocation.coordinates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedLocation.type}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Assigned Volunteers
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {selectedLocation.assignedVolunteers.map((volunteer: string, index: number) => (
                    <Chip key={index} label={volunteer} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Available Facilities
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selectedLocation.facilities.map((facility: string, index: number) => (
                    <Chip key={index} label={facility} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerMap; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  {
    id: 1,
    name: 'Main Stage',
    type: 'Stage',
    capacity: 5000,
    coordinates: '40.7128° N, 74.0060° W',
    description: 'Primary performance area',
    currentOccupancy: 3200,
    assignedVolunteers: ['John Doe', 'Jane Smith'],
    facilities: ['Restrooms', 'First Aid', 'Water Station'],
  },
  {
    id: 2,
    name: 'Food Court',
    type: 'Service',
    capacity: 1000,
    coordinates: '40.7129° N, 74.0061° W',
    description: 'Food and beverage area',
    currentOccupancy: 750,
    assignedVolunteers: ['Bob Wilson'],
    facilities: ['Seating Area', 'Waste Bins', 'Water Station'],
  },
];

const VolunteerMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Replace this with an actual map component (e.g., Google Maps, Leaflet) */}
            <Typography variant="h6" color="text.secondary">
              Map Component will be integrated here
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Festival Locations
            </Typography>
            <List>
              {mockLocations.map((location, index) => (
                <React.Fragment key={location.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    onClick={() => setSelectedLocation(location)}
                    selected={selectedLocation?.id === location.id}
                  >
                    <ListItemIcon>
                      <LocationIcon color={selectedLocation?.id === location.id ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={location.name}
                      secondary={`${location.type} - ${location.currentOccupancy}/${location.capacity} people`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {selectedLocation && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedLocation.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedLocation.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates: {selectedLocation.coordinates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedLocation.type}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Assigned Volunteers
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {selectedLocation.assignedVolunteers.map((volunteer: string, index: number) => (
                    <Chip key={index} label={volunteer} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Available Facilities
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selectedLocation.facilities.map((facility: string, index: number) => (
                    <Chip key={index} label={facility} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerMap; 