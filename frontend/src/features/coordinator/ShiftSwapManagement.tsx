import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { CSVLink } from 'react-csv';

interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  assigned_to: string | null;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
}

interface ShiftSwapRequest {
  id: string;
  original_shift_id: string;
  requesting_volunteer_id: string;
  proposed_volunteer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
}

const ShiftSwapManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  useEffect(() => {
    fetchShifts();
    fetchVolunteers();
    fetchSwapRequests();
  }, []);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    }
  };

  const fetchSwapRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSwapRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch swap requests');
    }
  };

  const handleOpen = (request: ShiftSwapRequest) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    try {
      if (!selectedRequest) return;

      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      fetchSwapRequests();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
    }
  };

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

  const getVolunteerName = (id: string) => {
    const volunteer = volunteers.find((v) => v.id === id);
    return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'Unknown';
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRequests(swapRequests.map((request) => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .in('id', selectedRequests);

      if (error) throw error;

      fetchSwapRequests();
      setSelectedRequests([]);
      handleMenuClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    }
  };

  const filteredRequests = swapRequests.filter((request) => {
    const shift = shifts.find((s) => s.id === request.original_shift_id);
    if (!shift) return false;

    const shiftDate = parseISO(shift.start_time);
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesDateFrom = !filters.dateFrom || shiftDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || shiftDate <= filters.dateTo;

    return matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const csvData = filteredRequests.map((request) => {
    const shift = shifts.find((s) => s.id === request.original_shift_id);
    const requestingVolunteer = volunteers.find(
      (v) => v.id === request.requesting_volunteer_id
    );
    const proposedVolunteer = volunteers.find(
      (v) => v.id === request.proposed_volunteer_id
    );

    return {
      'Shift Title': shift?.title || '',
      'Shift Date': shift ? format(parseISO(shift.start_time), 'PPp') : '',
      'From Volunteer': requestingVolunteer
        ? `${requestingVolunteer.first_name} ${requestingVolunteer.last_name}`
        : '',
      'To Volunteer': proposedVolunteer
        ? `${proposedVolunteer.first_name} ${proposedVolunteer.last_name}`
        : '',
      Status: request.status,
      Reason: request.reason || '',
      'Created At': format(parseISO(request.created_at), 'PPp'),
    };
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shift Swap Management
        </Typography>
        <Box>
          <IconButton onClick={handleFilterMenuClick}>
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {filteredRequests.map((request) => {
          const shift = shifts.find((s) => s.id === request.original_shift_id);

          return (
            <Grid item xs={12} key={request.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {shift?.title} - {shift && format(parseISO(shift.start_time), 'PPp')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {getVolunteerName(request.requesting_volunteer_id)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      To: {getVolunteerName(request.proposed_volunteer_id)}
                    </Typography>
                    {request.reason && (
                      <Typography variant="body2" color="text.secondary">
                        Reason: {request.reason}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                    {request.status === 'pending' && (
                      <>
                        <IconButton
                          color="success"
                          onClick={() => handleStatusUpdate('approved')}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleStatusUpdate('rejected')}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleBulkAction('approve')}>
          <ListItemIcon>
            <CheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Approve Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('reject')}>
          <ListItemIcon>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reject Selected</ListItemText>
        </MenuItem>
        <MenuItem component={CSVLink} data={csvData} filename="shift-swaps.csv">
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export to CSV</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={filters.dateFrom}
              onChange={(newValue) => setFilters({ ...filters, dateFrom: newValue })}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </MenuItem>
        <MenuItem>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="To Date"
              value={filters.dateTo}
              onChange={(newValue) => setFilters({ ...filters, dateTo: newValue })}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Shift Swap Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Shift Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shifts.find((s) => s.id === selectedRequest.original_shift_id)?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(shifts.find((s) => s.id === selectedRequest.original_shift_id)?.start_time || ''), 'PPp')}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Request Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From: {getVolunteerName(selectedRequest.requesting_volunteer_id)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To: {getVolunteerName(selectedRequest.proposed_volunteer_id)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reason: {selectedRequest.reason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleStatusUpdate('rejected')}
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleStatusUpdate('approved')}
                color="success"
                variant="contained"
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftSwapManagement; 