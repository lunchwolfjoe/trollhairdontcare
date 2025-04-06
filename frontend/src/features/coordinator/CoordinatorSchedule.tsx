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
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';
import Calendar from '../../../components/Calendar';
import { isWithinInterval, parseISO } from 'date-fns';

interface Shift {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  required_skills: string[];
  assigned_to: string | null;
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  created_at: string;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  skills: string[];
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
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CoordinatorSchedule: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    required_skills: '',
    assigned_to: '',
    status: 'open',
  });

  useEffect(() => {
    fetchShifts();
    fetchVolunteers();
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

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData({
        ...shift,
        required_skills: shift.required_skills.join(', '),
        assigned_to: shift.assigned_to || '',
      });
    } else {
      setSelectedShift(null);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        required_skills: '',
        assigned_to: '',
        status: 'open',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShift(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const checkShiftConflicts = (shift: Shift) => {
    const conflicts = shifts.filter((existingShift) => {
      if (existingShift.id === shift.id) return false;
      if (existingShift.assigned_to !== shift.assigned_to) return false;

      const newStart = parseISO(shift.start_time);
      const newEnd = parseISO(shift.end_time);
      const existingStart = parseISO(existingShift.start_time);
      const existingEnd = parseISO(existingShift.end_time);

      return (
        isWithinInterval(newStart, { start: existingStart, end: existingEnd }) ||
        isWithinInterval(newEnd, { start: existingStart, end: existingEnd })
      );
    });

    return conflicts;
  };

  const handleSubmit = async () => {
    try {
      const processedData = {
        ...formData,
        required_skills: formData.required_skills.split(',').map(skill => skill.trim()),
        assigned_to: formData.assigned_to || null,
      };

      if (formData.assigned_to) {
        const conflicts = checkShiftConflicts(processedData as Shift);
        if (conflicts.length > 0) {
          setError('This volunteer has conflicting shifts during this time period');
          return;
        }
      }

      if (selectedShift) {
        const { error } = await supabase
          .from('shifts')
          .update(processedData)
          .eq('id', selectedShift.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shifts')
          .insert([processedData]);

        if (error) throw error;
      }

      fetchShifts();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shift');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'start_time',
      headerName: 'Start Time',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'end_time',
      headerName: 'End Time',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { field: 'location', headerName: 'Location', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'completed'
              ? 'success'
              : params.value === 'filled'
              ? 'info'
              : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      field: 'assigned_to',
      headerName: 'Assigned To',
      flex: 1,
      renderCell: (params) => {
        const volunteer = volunteers.find(v => v.id === params.value);
        return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'Unassigned';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpen(params.row)}
            size="small"
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Schedule Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Shift
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Calendar View" />
          <Tab label="List View" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Calendar events={shifts} onEventClick={handleOpen} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={shifts}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedShift ? 'Edit Shift' : 'Add New Shift'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Skills"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                helperText="Enter skills separated by commas"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={formData.assigned_to}
                  label="Assigned To"
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {volunteers.map((volunteer) => (
                    <MenuItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.first_name} {volunteer.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="filled">Filled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedShift ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorSchedule; 