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
const mockFestivals = [
  { id: 1, name: 'Summer Festival 2024', startDate: '2024-06-01', endDate: '2024-06-03', location: 'Central Park', status: 'Upcoming' },
  { id: 2, name: 'Winter Wonderland', startDate: '2024-12-15', endDate: '2024-12-20', location: 'Downtown', status: 'Planning' },
];

const AdminFestivals: React.FC = () => {
  const [festivals, setFestivals] = useState(mockFestivals);
  const [open, setOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
  });

  const handleOpen = (festival?: any) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData(festival);
    } else {
      setSelectedFestival(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
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

  const handleSubmit = () => {
    if (selectedFestival) {
      setFestivals(festivals.map(f => 
        f.id === selectedFestival.id ? { ...formData, id: f.id } : f
      ));
    } else {
      setFestivals([...festivals, { ...formData, id: festivals.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setFestivals(festivals.filter(f => f.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Festival Name', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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
            Festival Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Festival
          </Button>
        </Box>

        <DataGrid
          rows={festivals}
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
            {selectedFestival ? 'Edit Festival' : 'Add New Festival'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Festival Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedFestival ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminFestivals; 
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
const mockFestivals = [
  { id: 1, name: 'Summer Festival 2024', startDate: '2024-06-01', endDate: '2024-06-03', location: 'Central Park', status: 'Upcoming' },
  { id: 2, name: 'Winter Wonderland', startDate: '2024-12-15', endDate: '2024-12-20', location: 'Downtown', status: 'Planning' },
];

const AdminFestivals: React.FC = () => {
  const [festivals, setFestivals] = useState(mockFestivals);
  const [open, setOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
  });

  const handleOpen = (festival?: any) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData(festival);
    } else {
      setSelectedFestival(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
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

  const handleSubmit = () => {
    if (selectedFestival) {
      setFestivals(festivals.map(f => 
        f.id === selectedFestival.id ? { ...formData, id: f.id } : f
      ));
    } else {
      setFestivals([...festivals, { ...formData, id: festivals.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setFestivals(festivals.filter(f => f.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Festival Name', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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
            Festival Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Festival
          </Button>
        </Box>

        <DataGrid
          rows={festivals}
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
            {selectedFestival ? 'Edit Festival' : 'Add New Festival'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Festival Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedFestival ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminFestivals; 
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
const mockFestivals = [
  { id: 1, name: 'Summer Festival 2024', startDate: '2024-06-01', endDate: '2024-06-03', location: 'Central Park', status: 'Upcoming' },
  { id: 2, name: 'Winter Wonderland', startDate: '2024-12-15', endDate: '2024-12-20', location: 'Downtown', status: 'Planning' },
];

const AdminFestivals: React.FC = () => {
  const [festivals, setFestivals] = useState(mockFestivals);
  const [open, setOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
  });

  const handleOpen = (festival?: any) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData(festival);
    } else {
      setSelectedFestival(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
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

  const handleSubmit = () => {
    if (selectedFestival) {
      setFestivals(festivals.map(f => 
        f.id === selectedFestival.id ? { ...formData, id: f.id } : f
      ));
    } else {
      setFestivals([...festivals, { ...formData, id: festivals.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setFestivals(festivals.filter(f => f.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Festival Name', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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
            Festival Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Festival
          </Button>
        </Box>

        <DataGrid
          rows={festivals}
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
            {selectedFestival ? 'Edit Festival' : 'Add New Festival'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Festival Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedFestival ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminFestivals; 