import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';

// Mock data for shifts - replace with actual data from backend
const mockShifts = [
  { id: '1', crewId: '1', startTime: '2024-07-15T08:00:00', endTime: '2024-07-15T16:00:00', requiredVolunteers: 4 },
  { id: '2', crewId: '2', startTime: '2024-07-15T12:00:00', endTime: '2024-07-15T20:00:00', requiredVolunteers: 2 },
  { id: '3', crewId: '3', startTime: '2024-07-15T10:00:00', endTime: '2024-07-15T18:00:00', requiredVolunteers: 3 },
];

interface Shift {
  id: string;
  crewId: string;
  startTime: string;
  endTime: string;
  requiredVolunteers: number;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<Partial<Shift>>({});

  useEffect(() => {
    // Fetch shifts from the backend
    const fetchShifts = async () => {
      try {
        const data = await volunteerService.getShifts();
        setShifts(data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchShifts();
  }, []);

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData(shift);
    } else {
      setSelectedShift(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedShift) {
        await volunteerService.updateShift(selectedShift.id, formData);
        setShifts(shifts.map(shift => shift.id === selectedShift.id ? { ...shift, ...formData } : shift));
      } else {
        const newShift = await volunteerService.createShift(formData);
        setShifts([...shifts, newShift]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await volunteerService.deleteShift(id);
      setShifts(shifts.filter(shift => shift.id !== id));
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shift Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Shift
        </Button>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {shifts.map((shift) => (
              <Grid item xs={12} key={shift.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">Shift {shift.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crew ID: {shift.crewId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start Time: {new Date(shift.startTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End Time: {new Date(shift.endTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Required Volunteers: {shift.requiredVolunteers}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpen(shift)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(shift.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
        <DialogContent>
          <TextField
            name="crewId"
            label="Crew ID"
            value={formData.crewId || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="startTime"
            label="Start Time"
            type="datetime-local"
            value={formData.startTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="endTime"
            label="End Time"
            type="datetime-local"
            value={formData.endTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="requiredVolunteers"
            label="Required Volunteers"
            type="number"
            value={formData.requiredVolunteers || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedShift ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShiftManagement; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';

// Mock data for shifts - replace with actual data from backend
const mockShifts = [
  { id: '1', crewId: '1', startTime: '2024-07-15T08:00:00', endTime: '2024-07-15T16:00:00', requiredVolunteers: 4 },
  { id: '2', crewId: '2', startTime: '2024-07-15T12:00:00', endTime: '2024-07-15T20:00:00', requiredVolunteers: 2 },
  { id: '3', crewId: '3', startTime: '2024-07-15T10:00:00', endTime: '2024-07-15T18:00:00', requiredVolunteers: 3 },
];

interface Shift {
  id: string;
  crewId: string;
  startTime: string;
  endTime: string;
  requiredVolunteers: number;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<Partial<Shift>>({});

  useEffect(() => {
    // Fetch shifts from the backend
    const fetchShifts = async () => {
      try {
        const data = await volunteerService.getShifts();
        setShifts(data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchShifts();
  }, []);

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData(shift);
    } else {
      setSelectedShift(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedShift) {
        await volunteerService.updateShift(selectedShift.id, formData);
        setShifts(shifts.map(shift => shift.id === selectedShift.id ? { ...shift, ...formData } : shift));
      } else {
        const newShift = await volunteerService.createShift(formData);
        setShifts([...shifts, newShift]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await volunteerService.deleteShift(id);
      setShifts(shifts.filter(shift => shift.id !== id));
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shift Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Shift
        </Button>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {shifts.map((shift) => (
              <Grid item xs={12} key={shift.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">Shift {shift.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crew ID: {shift.crewId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start Time: {new Date(shift.startTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End Time: {new Date(shift.endTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Required Volunteers: {shift.requiredVolunteers}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpen(shift)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(shift.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
        <DialogContent>
          <TextField
            name="crewId"
            label="Crew ID"
            value={formData.crewId || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="startTime"
            label="Start Time"
            type="datetime-local"
            value={formData.startTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="endTime"
            label="End Time"
            type="datetime-local"
            value={formData.endTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="requiredVolunteers"
            label="Required Volunteers"
            type="number"
            value={formData.requiredVolunteers || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedShift ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShiftManagement; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';

// Mock data for shifts - replace with actual data from backend
const mockShifts = [
  { id: '1', crewId: '1', startTime: '2024-07-15T08:00:00', endTime: '2024-07-15T16:00:00', requiredVolunteers: 4 },
  { id: '2', crewId: '2', startTime: '2024-07-15T12:00:00', endTime: '2024-07-15T20:00:00', requiredVolunteers: 2 },
  { id: '3', crewId: '3', startTime: '2024-07-15T10:00:00', endTime: '2024-07-15T18:00:00', requiredVolunteers: 3 },
];

interface Shift {
  id: string;
  crewId: string;
  startTime: string;
  endTime: string;
  requiredVolunteers: number;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<Partial<Shift>>({});

  useEffect(() => {
    // Fetch shifts from the backend
    const fetchShifts = async () => {
      try {
        const data = await volunteerService.getShifts();
        setShifts(data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchShifts();
  }, []);

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData(shift);
    } else {
      setSelectedShift(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedShift) {
        await volunteerService.updateShift(selectedShift.id, formData);
        setShifts(shifts.map(shift => shift.id === selectedShift.id ? { ...shift, ...formData } : shift));
      } else {
        const newShift = await volunteerService.createShift(formData);
        setShifts([...shifts, newShift]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await volunteerService.deleteShift(id);
      setShifts(shifts.filter(shift => shift.id !== id));
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shift Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Shift
        </Button>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {shifts.map((shift) => (
              <Grid item xs={12} key={shift.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">Shift {shift.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crew ID: {shift.crewId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start Time: {new Date(shift.startTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End Time: {new Date(shift.endTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Required Volunteers: {shift.requiredVolunteers}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpen(shift)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(shift.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
        <DialogContent>
          <TextField
            name="crewId"
            label="Crew ID"
            value={formData.crewId || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="startTime"
            label="Start Time"
            type="datetime-local"
            value={formData.startTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="endTime"
            label="End Time"
            type="datetime-local"
            value={formData.endTime || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="requiredVolunteers"
            label="Required Volunteers"
            type="number"
            value={formData.requiredVolunteers || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedShift ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShiftManagement; 