import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tab,
  Tabs,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as AssignIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Mock data - Will be replaced with Supabase integration
interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  status: 'pending' | 'approved' | 'rejected';
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  dateApplied: string;
  festival: string;
}

// List of available skills
const availableSkills = [
  'Stage Management',
  'Sound Engineering',
  'Lighting',
  'Security',
  'First Aid',
  'Food Service',
  'Guest Relations',
  'Ticketing',
  'Cleanup',
  'Setup',
];

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    skills: ['Stage Management', 'Sound Engineering'],
    status: 'pending',
    availability: {
      days: ['Friday', 'Saturday'],
      startTime: '09:00',
      endTime: '17:00',
    },
    dateApplied: '2025-03-15',
    festival: 'Summer Music Festival 2025',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '555-987-6543',
    skills: ['First Aid', 'Security'],
    status: 'approved',
    availability: {
      days: ['Saturday', 'Sunday'],
      startTime: '10:00',
      endTime: '18:00',
    },
    dateApplied: '2025-03-10',
    festival: 'Summer Music Festival 2025',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '555-456-7890',
    skills: ['Food Service', 'Cleanup'],
    status: 'rejected',
    availability: {
      days: ['Friday', 'Sunday'],
      startTime: '14:00',
      endTime: '22:00',
    },
    dateApplied: '2025-03-18',
    festival: 'Summer Music Festival 2025',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '555-222-3333',
    skills: ['Ticketing', 'Guest Relations'],
    status: 'pending',
    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '16:00',
    },
    dateApplied: '2025-03-20',
    festival: 'Summer Music Festival 2025',
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '555-444-5555',
    skills: ['Lighting', 'Setup'],
    status: 'approved',
    availability: {
      days: ['Saturday'],
      startTime: '12:00',
      endTime: '20:00',
    },
    dateApplied: '2025-03-05',
    festival: 'Summer Music Festival 2025',
  },
];

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
      id={`volunteer-tabpanel-${index}`}
      aria-labelledby={`volunteer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VolunteerManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [editedSkills, setEditedSkills] = useState<string[]>([]);

  // Effect to mimic data fetching from Supabase
  useEffect(() => {
    // This would be replaced with:
    // const fetchVolunteers = async () => {
    //   const { data, error } = await supabase
    //     .from('volunteers')
    //     .select('*, profiles(*)')
    //     .order('created_at', { ascending: false });
    //   if (error) {
    //     console.error('Error fetching volunteers:', error);
    //     return;
    //   }
    //   setVolunteers(data);
    // };
    // fetchVolunteers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleVolunteerStatus = (id: string, status: 'approved' | 'rejected') => {
    setVolunteers((prev) =>
      prev.map((volunteer) =>
        volunteer.id === id ? { ...volunteer, status } : volunteer
      )
    );
    
    // This would include Supabase update:
    // const updateStatus = async () => {
    //   const { error } = await supabase
    //     .from('volunteers')
    //     .update({ status })
    //     .eq('id', id);
    //   if (error) {
    //     console.error('Error updating volunteer status:', error);
    //     return;
    //   }
    // };
    // updateStatus();

    setSnackbarMessage(`Volunteer ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleVolunteerDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setDialogOpen(true);
  };

  const handleSkillsEdit = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setEditedSkills(volunteer.skills);
    setSkillsDialogOpen(true);
  };

  const handleSkillsUpdate = () => {
    if (!selectedVolunteer) return;

    setVolunteers((prev) =>
      prev.map((volunteer) =>
        volunteer.id === selectedVolunteer.id
          ? { ...volunteer, skills: editedSkills }
          : volunteer
      )
    );

    // This would include Supabase update:
    // const updateSkills = async () => {
    //   const { error } = await supabase
    //     .from('volunteers')
    //     .update({ skills: editedSkills })
    //     .eq('id', selectedVolunteer.id);
    //   if (error) {
    //     console.error('Error updating volunteer skills:', error);
    //     return;
    //   }
    // };
    // updateSkills();

    setSnackbarMessage('Volunteer skills updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setSkillsDialogOpen(false);
  };

  const handleSkillChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setEditedSkills(event.target.value as string[]);
  };

  // Filter volunteers based on status and search term
  const getFilteredVolunteers = () => {
    let filtered = volunteers;
    
    // Filter by tab/status
    if (tabValue === 1) {
      filtered = filtered.filter(volunteer => volunteer.status === 'pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(volunteer => volunteer.status === 'approved');
    } else if (tabValue === 3) {
      filtered = filtered.filter(volunteer => volunteer.status === 'rejected');
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        volunteer =>
          volunteer.name.toLowerCase().includes(searchLower) ||
          volunteer.email.toLowerCase().includes(searchLower) ||
          volunteer.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  };

  const filteredVolunteers = getFilteredVolunteers();

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Volunteer Management
        </Typography>
        <Typography variant="body1" paragraph>
          Review, approve, and manage volunteer applications. Assign skills and track volunteer status.
        </Typography>

        {/* Search and filter */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search volunteers"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mr: 2, width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              // This would navigate to volunteer registration or open creation dialog
              setSnackbarMessage('Volunteer creation form would open here');
              setSnackbarSeverity('success');
              setSnackbarOpen(true);
            }}
            sx={{ ml: 'auto' }}
          >
            Add Volunteer
          </Button>
        </Box>

        {/* Status tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="volunteer tabs">
            <Tab label="All Volunteers" />
            <Tab label="Pending Approval" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <VolunteerTable
            volunteers={filteredVolunteers}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleVolunteerStatus={handleVolunteerStatus}
            handleVolunteerDetails={handleVolunteerDetails}
            handleSkillsEdit={handleSkillsEdit}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <VolunteerTable
            volunteers={filteredVolunteers}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleVolunteerStatus={handleVolunteerStatus}
            handleVolunteerDetails={handleVolunteerDetails}
            handleSkillsEdit={handleSkillsEdit}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <VolunteerTable
            volunteers={filteredVolunteers}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleVolunteerStatus={handleVolunteerStatus}
            handleVolunteerDetails={handleVolunteerDetails}
            handleSkillsEdit={handleSkillsEdit}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <VolunteerTable
            volunteers={filteredVolunteers}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleVolunteerStatus={handleVolunteerStatus}
            handleVolunteerDetails={handleVolunteerDetails}
            handleSkillsEdit={handleSkillsEdit}
          />
        </TabPanel>
      </Paper>

      {/* Volunteer details dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Volunteer Details</DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Name</Typography>
                  <Typography variant="body1">{selectedVolunteer.name}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1">{selectedVolunteer.email}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Phone</Typography>
                  <Typography variant="body1">{selectedVolunteer.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Date Applied</Typography>
                  <Typography variant="body1">{selectedVolunteer.dateApplied}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip 
                    label={selectedVolunteer.status.charAt(0).toUpperCase() + selectedVolunteer.status.slice(1)} 
                    color={
                      selectedVolunteer.status === 'approved' 
                        ? 'success' 
                        : selectedVolunteer.status === 'rejected' 
                          ? 'error' 
                          : 'warning'
                    }
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedVolunteer.skills.map((skill) => (
                      <Chip key={skill} label={skill} />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Availability</Typography>
                  <Typography variant="body1">
                    Days: {selectedVolunteer.availability.days.join(', ')}
                  </Typography>
                  <Typography variant="body1">
                    Time: {selectedVolunteer.availability.startTime} - {selectedVolunteer.availability.endTime}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedVolunteer && selectedVolunteer.status === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  handleVolunteerStatus(selectedVolunteer.id, 'approved');
                  setDialogOpen(false);
                }} 
                color="success" 
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => {
                  handleVolunteerStatus(selectedVolunteer.id, 'rejected');
                  setDialogOpen(false);
                }} 
                color="error" 
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
            </>
          )}
          <Button 
            onClick={() => setDialogOpen(false)} 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Skills edit dialog */}
      <Dialog open={skillsDialogOpen} onClose={() => setSkillsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Volunteer Skills</DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Skills</InputLabel>
                <Select
                  multiple
                  value={editedSkills}
                  onChange={handleSkillChange}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Select all applicable skills for this volunteer. These skills will be used for crew assignments.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSkillsUpdate} color="primary">
            Save Skills
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/error notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Volunteer table component
interface VolunteerTableProps {
  volunteers: Volunteer[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVolunteerStatus: (id: string, status: 'approved' | 'rejected') => void;
  handleVolunteerDetails: (volunteer: Volunteer) => void;
  handleSkillsEdit: (volunteer: Volunteer) => void;
}

const VolunteerTable: React.FC<VolunteerTableProps> = ({
  volunteers,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleVolunteerStatus,
  handleVolunteerDetails,
  handleSkillsEdit,
}) => {
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="volunteer table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((volunteer) => (
                <TableRow key={volunteer.id} hover>
                  <TableCell>{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {volunteer.skills.slice(0, 2).map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                      {volunteer.skills.length > 2 && (
                        <Chip label={`+${volunteer.skills.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)} 
                      color={
                        volunteer.status === 'approved' 
                          ? 'success' 
                          : volunteer.status === 'rejected' 
                            ? 'error' 
                            : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{volunteer.dateApplied}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => handleVolunteerDetails(volunteer)}
                        >
                          <PersonIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit skills">
                        <IconButton
                          size="small"
                          onClick={() => handleSkillsEdit(volunteer)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {volunteer.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleVolunteerStatus(volunteer.id, 'approved')}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleVolunteerStatus(volunteer.id, 'rejected')}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip title="Assign to crew">
                        <IconButton size="small" color="primary">
                          <AssignIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            {volunteers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No volunteers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={volunteers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default VolunteerManagement; 