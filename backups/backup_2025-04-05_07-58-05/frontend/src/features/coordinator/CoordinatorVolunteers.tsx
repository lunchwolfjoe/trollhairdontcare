import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';

interface Volunteer {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  skills: string[];
  experience: string;
  available_days: string[];
  preferred_shifts: string[];
  max_hours_per_day: number;
}

const CoordinatorVolunteers: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'approve'>('view');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select(`
          id,
          profile_id,
          status,
          skills,
          experience,
          available_days,
          preferred_shifts,
          max_hours_per_day,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Volunteer interface
      const transformedData = data.map(volunteer => ({
        id: volunteer.id,
        profile_id: volunteer.profile_id,
        first_name: volunteer.profiles.first_name,
        last_name: volunteer.profiles.last_name,
        email: volunteer.profiles.email,
        phone: volunteer.profiles.phone,
        status: volunteer.status,
        skills: volunteer.skills,
        experience: volunteer.experience,
        available_days: volunteer.available_days,
        preferred_shifts: volunteer.preferred_shifts,
        max_hours_per_day: volunteer.max_hours_per_day,
      }));

      setVolunteers(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (volunteerId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ status: newStatus })
        .eq('id', volunteerId);

      if (error) throw error;

      // Update local state
      setVolunteers(prev =>
        prev.map(volunteer =>
          volunteer.id === volunteerId
            ? { ...volunteer, status: newStatus }
            : volunteer
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update volunteer status');
    }
  };

  const handleOpenDialog = (volunteer: Volunteer, type: 'view' | 'edit' | 'approve') => {
    setSelectedVolunteer(volunteer);
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVolunteer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Volunteer Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers.map((volunteer) => (
              <TableRow key={volunteer.id}>
                <TableCell>{`${volunteer.first_name} ${volunteer.last_name}`}</TableCell>
                <TableCell>{volunteer.email}</TableCell>
                <TableCell>{volunteer.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={volunteer.status}
                    color={getStatusColor(volunteer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {volunteer.skills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(volunteer, 'view')}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {volunteer.status === 'pending' && (
                    <>
                      <IconButton
                        onClick={() => handleOpenDialog(volunteer, 'approve')}
                        size="small"
                        color="success"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(volunteer.id, 'rejected')}
                        size="small"
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'view' && 'Volunteer Details'}
          {dialogType === 'edit' && 'Edit Volunteer'}
          {dialogType === 'approve' && 'Approve Volunteer'}
        </DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={selectedVolunteer.first_name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={selectedVolunteer.last_name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedVolunteer.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedVolunteer.phone}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Skills</InputLabel>
                  <Select
                    multiple
                    value={selectedVolunteer.skills}
                    disabled
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {selectedVolunteer.skills.map((skill) => (
                      <MenuItem key={skill} value={skill}>
                        {skill}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Experience"
                  value={selectedVolunteer.experience}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Available Days</InputLabel>
                  <Select
                    multiple
                    value={selectedVolunteer.available_days}
                    disabled
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {selectedVolunteer.available_days.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Shifts</InputLabel>
                  <Select
                    multiple
                    value={selectedVolunteer.preferred_shifts}
                    disabled
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {selectedVolunteer.preferred_shifts.map((shift) => (
                      <MenuItem key={shift} value={shift}>
                        {shift}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Hours per Day"
                  value={selectedVolunteer.max_hours_per_day}
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === 'approve' && (
            <Button
              onClick={() => {
                handleStatusChange(selectedVolunteer!.id, 'approved');
                handleCloseDialog();
              }}
              color="success"
            >
              Approve
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorVolunteers; 