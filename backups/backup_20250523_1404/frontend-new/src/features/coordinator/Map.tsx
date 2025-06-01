import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
  CardContent,
  Grid,
  SelectChangeEvent,
  Button,
  Divider,
} from '@mui/material';
import { AppLogo } from '../../components/common/AppLogo';
import { MapOutlined as MapIcon } from '@mui/icons-material';

// Define maps with actual files in public directory
const maps = [
  {
    id: 'map1',
    name: '2019 Program Map',
    url: '/images/2019-Program-Map-of-QVR-1536x983.jpg',
    description: 'Program map from the 2019 festival'
  },
  {
    id: 'map2',
    name: 'Mapdana 2020',
    url: '/images/KFF_Mapdana2020-FINAL-W-1536x1536.jpg',
    description: 'Festival map from the 2020 event'
  },
  {
    id: 'aerial1',
    name: 'Aerial View 1',
    url: '/images/Aerial01KenSchmidt.avif',
    description: 'Aerial view of the festival grounds'
  },
  {
    id: 'aerial2',
    name: 'Aerial View 2',
    url: '/images/Aerial03KenSchmidt.avif',
    description: 'Second aerial view showing the full festival layout'
  }
];

const Map: React.FC = () => {
  const [selectedMapIndex, setSelectedMapIndex] = useState<number>(0);
  const currentMap = maps[selectedMapIndex];

  const handleMapChange = (event: SelectChangeEvent<number>) => {
    setSelectedMapIndex(Number(event.target.value));
  };

  return (
    <Container maxWidth="xl">
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          mt: 2, 
          p: 3, 
          borderRadius: '24px',
          background: 'linear-gradient(145deg, #8bc3b5 0%, #a3d1c5 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AppLogo size="medium" showText={false} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              Festival Maps
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              View and navigate the festival grounds
            </Typography>
          </Grid>
          <Grid item>
            <MapIcon fontSize="large" sx={{ color: 'white', opacity: 0.8 }} />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="map-select-label">Select Festival Map</InputLabel>
          <Select
            labelId="map-select-label"
            id="map-select"
            value={selectedMapIndex}
            label="Select Festival Map"
            onChange={handleMapChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.main',
                borderWidth: 2
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.light'
              }
            }}
          >
            {maps.map((map, index) => (
              <MenuItem key={map.id} value={index}>
                {map.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            height: 'calc(100vh - 320px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ 
            p: 2, 
            background: 'rgba(139, 195, 181, 0.05)', 
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {currentMap.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentMap.description}
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              p: 2
            }}
          >
            <img
              src={currentMap.url}
              alt={currentMap.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            component="a" 
            href="/coordinator/vectorized-map"
          >
            Switch to Interactive Map
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export { Map }; 

