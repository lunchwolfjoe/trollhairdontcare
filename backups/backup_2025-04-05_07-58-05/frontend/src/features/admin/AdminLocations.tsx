import React, { useState } from 'react';
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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  { id: 1, name: 'Main Stage', type: 'Stage', capacity: 5000, coordinates: '40.7128° N, 74.0060° W', description: 'Primary performance area' },
  { id: 2, name: 'Food Court', type: 'Service', capacity: 1000, coordinates: '40.7129° N, 74.0061° W', description: 'Food and beverage area' },
];

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState(mockLocations);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    coordinates: '',
    description: '',
  });

  const handleOpen = (location?: any) => {
    if (location) {
      setSelectedLocation(location);
      setFormData(location);
    } else {
      setSelectedLocation(null);
      setFormData({
        name: '',
        type: '',
        capacity: '',
        coordinates: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocation(null);
  };

  const handleSubmit = () => {
    if (selectedLocation) {
      setLocations(locations.map(loc => 
        loc.id === selectedLocation.id ? { ...formData, id: loc.id } : loc
      ));
    } else {
      setLocations([...locations, { ...formData, id: locations.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Location Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'capacity', headerName: 'Capacity', flex: 1 },
    { field: 'coordinates', headerName: 'Coordinates', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Location Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Location
          </Button>
        </Box>

        <DataGrid
          rows={locations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          autoHeight
          disableRowSelectionOnClick
        />

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Coordinates"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedLocation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminLocations; 
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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  { id: 1, name: 'Main Stage', type: 'Stage', capacity: 5000, coordinates: '40.7128° N, 74.0060° W', description: 'Primary performance area' },
  { id: 2, name: 'Food Court', type: 'Service', capacity: 1000, coordinates: '40.7129° N, 74.0061° W', description: 'Food and beverage area' },
];

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState(mockLocations);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    coordinates: '',
    description: '',
  });

  const handleOpen = (location?: any) => {
    if (location) {
      setSelectedLocation(location);
      setFormData(location);
    } else {
      setSelectedLocation(null);
      setFormData({
        name: '',
        type: '',
        capacity: '',
        coordinates: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocation(null);
  };

  const handleSubmit = () => {
    if (selectedLocation) {
      setLocations(locations.map(loc => 
        loc.id === selectedLocation.id ? { ...formData, id: loc.id } : loc
      ));
    } else {
      setLocations([...locations, { ...formData, id: locations.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Location Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'capacity', headerName: 'Capacity', flex: 1 },
    { field: 'coordinates', headerName: 'Coordinates', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Location Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Location
          </Button>
        </Box>

        <DataGrid
          rows={locations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          autoHeight
          disableRowSelectionOnClick
        />

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Coordinates"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedLocation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminLocations; 
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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockLocations = [
  { id: 1, name: 'Main Stage', type: 'Stage', capacity: 5000, coordinates: '40.7128° N, 74.0060° W', description: 'Primary performance area' },
  { id: 2, name: 'Food Court', type: 'Service', capacity: 1000, coordinates: '40.7129° N, 74.0061° W', description: 'Food and beverage area' },
];

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState(mockLocations);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    coordinates: '',
    description: '',
  });

  const handleOpen = (location?: any) => {
    if (location) {
      setSelectedLocation(location);
      setFormData(location);
    } else {
      setSelectedLocation(null);
      setFormData({
        name: '',
        type: '',
        capacity: '',
        coordinates: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocation(null);
  };

  const handleSubmit = () => {
    if (selectedLocation) {
      setLocations(locations.map(loc => 
        loc.id === selectedLocation.id ? { ...formData, id: loc.id } : loc
      ));
    } else {
      setLocations([...locations, { ...formData, id: locations.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Location Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'capacity', headerName: 'Capacity', flex: 1 },
    { field: 'coordinates', headerName: 'Coordinates', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Location Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Location
          </Button>
        </Box>

        <DataGrid
          rows={locations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          autoHeight
          disableRowSelectionOnClick
        />

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Coordinates"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedLocation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminLocations; 