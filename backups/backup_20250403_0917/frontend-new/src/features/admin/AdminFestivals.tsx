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
  CardActions,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data - replace with actual data from your backend
const mockFestivals = [
  { 
    id: 1, 
    name: 'Summer Music Festival', 
    startDate: '2025-06-15', 
    endDate: '2025-06-18', 
    location: 'Central Park', 
    status: 'Planning',
    description: 'Annual summer celebration with music, food, and entertainment for the whole community.',
    expectedAttendance: 5000,
    organizer: 'Community Events Association',
    budget: 75000,
    sponsors: ['ABC Corporation', 'XYZ Foundation', 'Local Business Alliance']
  },
  { 
    id: 2, 
    name: 'Food & Wine Festival', 
    startDate: '2025-08-22', 
    endDate: '2025-08-25', 
    location: 'Riverfront Plaza', 
    status: 'Planning',
    description: 'Celebration of local cuisine and beverages with demonstrations by top chefs.',
    expectedAttendance: 4200,
    organizer: 'Regional Food Association',
    budget: 90000,
    sponsors: ['Gourmet Foods Inc.', 'Premium Wineries', 'Culinary Institute']
  },
  { 
    id: 3, 
    name: 'Fall Arts Festival', 
    startDate: '2025-10-10', 
    endDate: '2025-10-12', 
    location: 'Downtown District', 
    status: 'Planning',
    description: 'Exhibition of local art with workshops, performances and interactive installations.',
    expectedAttendance: 2800,
    organizer: 'Arts Council',
    budget: 45000,
    sponsors: ['Creative Foundation', 'Art Supplies Co.', 'Local Gallery Cooperative']
  },
];

// Mock locations
const mockLocations = [
  { id: 1, name: 'Central Park', capacity: 8000, indoorOutdoor: 'Outdoor', facilities: ['Restrooms', 'Parking', 'Stage'] },
  { id: 2, name: 'Downtown Square', capacity: 5000, indoorOutdoor: 'Outdoor', facilities: ['Restrooms', 'Power Outlets', 'Vendor Spaces'] },
  { id: 3, name: 'Riverfront Park', capacity: 6000, indoorOutdoor: 'Outdoor', facilities: ['Restrooms', 'Parking', 'Water Access'] },
  { id: 4, name: 'Community Center', capacity: 3000, indoorOutdoor: 'Indoor', facilities: ['Restrooms', 'Kitchen', 'A/V Equipment', 'Climate Control'] },
];

const AdminFestivals: React.FC = () => {
  const [festivals, setFestivals] = useState(mockFestivals);
  const [locations, setLocations] = useState(mockLocations);
  const [open, setOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
    description: '',
    expectedAttendance: '',
    organizer: '',
    budget: '',
    sponsors: [],
  });

  useEffect(() => {
    // Fetch festivals from backend
    // In a real app, this would make an API call
  }, []);

  const handleOpen = (festival?: any) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData({
        name: festival.name,
        startDate: festival.startDate,
        endDate: festival.endDate,
        location: festival.location,
        status: festival.status,
        description: festival.description || '',
        expectedAttendance: festival.expectedAttendance?.toString() || '',
        organizer: festival.organizer || '',
        budget: festival.budget?.toString() || '',
        sponsors: festival.sponsors || [],
      });
    } else {
      setSelectedFestival(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        location: '',
        status: '',
        description: '',
        expectedAttendance: '',
        organizer: '',
        budget: '',
        sponsors: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFestival(null);
  };

  const handleOpenDetails = (festival: any) => {
    setSelectedFestival(festival);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedFestival(null);
  };

  const handleSubmit = () => {
    const formattedData = {
      ...formData,
      expectedAttendance: formData.expectedAttendance !== '' ? parseInt(formData.expectedAttendance) : 0,
      budget: formData.budget !== '' ? parseInt(formData.budget) : 0,
      sponsors: formData.sponsors || [],
    };

    if (selectedFestival) {
      // Update existing festival
      setFestivals(
        festivals.map(f => (f.id === selectedFestival.id ? { ...formattedData, id: f.id } : f))
      );
    } else {
      // Create new festival
      setFestivals([
        ...festivals,
        { ...formattedData, id: festivals.length > 0 ? Math.max(...festivals.map(f => f.id)) + 1 : 1 },
      ]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setFestivals(festivals.filter(f => f.id !== id));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  // Field for sponsors (comma-separated string)
  const handleSponsorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sponsorsText = e.target.value;
    const sponsorsArray = sponsorsText.split(',').map(s => s.trim()).filter(s => s !== '');
    setFormData({
      ...formData,
      sponsors: sponsorsArray,
    });
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
            Create Festival
          </Button>
        </Box>

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Festivals" />
          <Tab label="Upcoming" />
          <Tab label="Planning" />
          <Tab label="Completed" />
        </Tabs>

        <DataGrid
          rows={festivals.filter(f => {
            switch (tabIndex) {
              case 1: return f.status === 'Upcoming';
              case 2: return f.status === 'Planning';
              case 3: return f.status === 'Completed';
              default: return true;
            }
          })}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          disableRowSelectionOnClick
        />

        {/* Add/Edit Festival Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                  label="Organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="Planning">Planning</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Attendance"
                  type="number"
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sponsors (comma-separated)"
                  value={formData.sponsors.join(', ')}
                  onChange={handleSponsorsChange}
                  helperText="Enter sponsor names separated by commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!formData.name || !formData.startDate || !formData.endDate || !formData.location || !formData.status}
            >
              {selectedFestival ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Festival Details Dialog */}
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          {selectedFestival && (
            <>
              <DialogTitle>{selectedFestival.name}</DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={selectedFestival.status} 
                    color={
                      selectedFestival.status === 'Upcoming' ? 'primary' : 
                      selectedFestival.status === 'Planning' ? 'info' :
                      selectedFestival.status === 'Completed' ? 'success' : 'default'
                    } 
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body1" paragraph>
                    {selectedFestival.description}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Dates</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {new Date(selectedFestival.startDate).toLocaleDateString()} to {new Date(selectedFestival.endDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Location</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {selectedFestival.location}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Expected Attendance</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {selectedFestival.expectedAttendance?.toLocaleString() || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Organizer</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4 }}>
                        {selectedFestival.organizer || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Budget
                      </Typography>
                      <Typography variant="h6">
                        ${selectedFestival.budget?.toLocaleString() || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Sponsors
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedFestival.sponsors?.map((sponsor: string, index: number) => (
                          <Chip key={index} label={sponsor} />
                        )) || 'No sponsors specified'}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button 
                  startIcon={<EditIcon />} 
                  onClick={() => {
                    handleCloseDetails();
                    handleOpen(selectedFestival);
                  }}
                >
                  Edit
                </Button>
                <Button onClick={handleCloseDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminFestivals; 