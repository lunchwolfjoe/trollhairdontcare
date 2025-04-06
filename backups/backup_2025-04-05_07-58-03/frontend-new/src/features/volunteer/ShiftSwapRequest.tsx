import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
} from '@mui/material';

// Mock data
const mockShifts = [
  {
    id: '1',
    title: 'Registration Desk',
    start_time: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    end_time: new Date(Date.now() + 183600000).toISOString(),
    location: 'Main Entrance',
    role: 'Greeter'
  },
  {
    id: '2',
    title: 'Parking Assistance',
    start_time: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    end_time: new Date(Date.now() + 270000000).toISOString(),
    location: 'Parking Lot',
    role: 'Traffic Guide'
  },
  {
    id: '3',
    title: 'Information Booth',
    start_time: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
    end_time: new Date(Date.now() + 356400000).toISOString(),
    location: 'Main Hall',
    role: 'Information Provider'
  }
];

const mockVolunteers = [
  { id: '101', full_name: 'Alice Johnson' },
  { id: '102', full_name: 'Bob Smith' },
  { id: '103', full_name: 'Charlie Brown' },
  { id: '104', full_name: 'Diana Miller' }
];

const mockSwapRequests = [
  {
    id: '201',
    shift_id: '1',
    proposed_volunteer_id: '101',
    reason: 'Family commitment',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    shift: mockShifts[0],
    proposed_volunteer: mockVolunteers[0]
  },
  {
    id: '202',
    shift_id: '2',
    proposed_volunteer_id: '102',
    reason: 'Doctor appointment',
    status: 'approved',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    shift: mockShifts[1],
    proposed_volunteer: mockVolunteers[1]
  },
  {
    id: '203',
    shift_id: '3',
    proposed_volunteer_id: '103',
    reason: 'Transportation issues',
    status: 'rejected',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    shift: mockShifts[2],
    proposed_volunteer: mockVolunteers[2]
  }
];

export const ShiftSwapRequest: React.FC = () => {
  const [shifts] = useState(mockShifts);
  const [volunteers] = useState(mockVolunteers);
  const [swapRequests] = useState(mockSwapRequests);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [reason, setReason] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleOpenDialog = (shift: any) => {
    setSelectedShift(shift);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedShift(null);
    setSelectedVolunteer('');
    setReason('');
  };

  const handleSubmitRequest = () => {
    // In a real app, this would submit to the database
    console.log('Submitted swap request:', {
      shift_id: selectedShift?.id,
      proposed_volunteer_id: selectedVolunteer,
      reason
    });
    handleCloseDialog();
    // In a real app, you would refresh the swap requests list here
  };

  const filteredRequests = statusFilter === 'all'
    ? swapRequests
    : swapRequests.filter(request => request.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shift Swap Requests
      </Typography>

      <Typography variant="h5" gutterBottom>
        My Upcoming Shifts
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {shifts.map((shift) => (
          <Paper key={shift.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">
                  {shift.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(shift.start_time)} - {formatDate(shift.end_time)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {shift.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {shift.role}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog(shift)}
              >
                Request Swap
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Typography variant="h5" gutterBottom>
        My Swap Requests
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Filter by Status</InputLabel>
        <Select
          value={statusFilter}
          label="Filter by Status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredRequests.map((request) => (
          <Paper key={request.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1">
                    {request.shift.title}
                  </Typography>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(request.shift.start_time)} - {formatDate(request.shift.end_time)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {request.shift.location}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Proposed Volunteer: {request.proposed_volunteer.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reason: {request.reason}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Requested on: {formatDate(request.created_at)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
        {filteredRequests.length === 0 && (
          <Typography color="text.secondary" align="center">
            No swap requests match your filter
          </Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request Shift Swap</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedShift.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedShift.start_time)} - {formatDate(selectedShift.end_time)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Location: {selectedShift.location}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Proposed Volunteer</InputLabel>
                <Select
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                  label="Proposed Volunteer"
                >
                  {volunteers.map((volunteer) => (
                    <MenuItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason for Swap"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            color="primary"
            disabled={!selectedVolunteer || !reason.trim()}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 
