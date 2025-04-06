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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tabs,
  Tab,
  TextField as MuiTextField,
} from '@mui/material';
import { supabase } from '../../../lib/supabase';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
  proposed_volunteer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shift-tabpanel-${index}`}
      aria-labelledby={`shift-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ShiftSwapRequest: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    proposed_volunteer_id: '',
    reason: '',
  });
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchShifts();
    fetchVolunteers();
    fetchSwapRequests();
  }, []);

  const fetchShifts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: volunteer } = await supabase
        .from('volunteers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!volunteer) throw new Error('No volunteer found');

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('assigned_to', volunteer.id)
        .gte('start_time', new Date().toISOString())
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

  const handleOpen = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      proposed_volunteer_id: '',
      reason: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const checkForConflicts = async (proposedVolunteerId: string, shiftId: string) => {
    try {
      const { data: shift } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

      if (!shift) throw new Error('Shift not found');

      const { data: existingShifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('assigned_to', proposedVolunteerId)
        .gte('start_time', new Date().toISOString());

      if (!existingShifts) return false;

      const shiftStart = parseISO(shift.start_time);
      const shiftEnd = parseISO(shift.end_time);

      return existingShifts.some((existingShift) => {
        const existingStart = parseISO(existingShift.start_time);
        const existingEnd = parseISO(existingShift.end_time);
        return (
          isWithinInterval(shiftStart, { start: existingStart, end: existingEnd }) ||
          isWithinInterval(shiftEnd, { start: existingStart, end: existingEnd })
        );
      });
    } catch (err) {
      console.error('Error checking for conflicts:', err);
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedShift) return;

      const hasConflict = await checkForConflicts(
        formData.proposed_volunteer_id,
        selectedShift.id
      );

      if (hasConflict) {
        setError('The proposed volunteer has a scheduling conflict for this shift.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: volunteer } = await supabase
        .from('volunteers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!volunteer) throw new Error('No volunteer found');

      const { error } = await supabase
        .from('shift_swap_requests')
        .insert([
          {
            original_shift_id: selectedShift.id,
            requesting_volunteer_id: volunteer.id,
            proposed_volunteer_id: formData.proposed_volunteer_id,
            reason: formData.reason,
          },
        ]);

      if (error) throw error;

      fetchSwapRequests();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit swap request');
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

  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch = shift.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || format(new Date(shift.start_time), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
    return matchesSearch && matchesDate;
  });

  const filteredRequests = swapRequests.filter((request) => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shift Swap Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Request Swap" />
          <Tab label="My Requests" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Upcoming Shifts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <MuiTextField
              label="Search shifts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by date"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredShifts.map((shift) => (
              <Chip
                key={shift.id}
                label={`${shift.title} - ${format(new Date(shift.start_time), 'PPp')}`}
                onClick={() => handleOpen(shift)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Swap Requests
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredRequests.map((request) => {
              const shift = shifts.find((s) => s.id === request.original_shift_id);
              const proposedVolunteer = volunteers.find(
                (v) => v.id === request.proposed_volunteer_id
              );

              return (
                <Paper key={request.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {shift?.title} - {shift && format(new Date(shift.start_time), 'PPp')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Proposed to: {proposedVolunteer?.first_name} {proposedVolunteer?.last_name}
                      </Typography>
                      {request.reason && (
                        <Typography variant="body2" color="text.secondary">
                          Reason: {request.reason}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </TabPanel>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request Shift Swap</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedShift?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedShift && format(new Date(selectedShift.start_time), 'PPp')}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Proposed Volunteer</InputLabel>
              <Select
                value={formData.proposed_volunteer_id}
                label="Proposed Volunteer"
                onChange={(e) =>
                  setFormData({ ...formData, proposed_volunteer_id: e.target.value })
                }
              >
                {volunteers.map((volunteer) => (
                  <MenuItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.first_name} {volunteer.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.proposed_volunteer_id || !formData.reason}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftSwapRequest; 