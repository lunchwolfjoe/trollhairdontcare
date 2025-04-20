import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
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
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  AssignmentInd as AssignIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { volunteerService, festivalService } from '../../lib/services';
import { Volunteer, Festival } from '../../lib/types/models';
import { SearchFilter, FilterOption } from '../../components/common/SearchFilter';
import { DataTable, TableColumn, TableAction } from '../../components/common/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { useSorting } from '../../hooks/useSorting';

// List of available skills - in the future, this could come from the database
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
      {value === index && <div style={{ padding: '24px' }}>{children}</div>}
    </div>
  );
}

const VolunteerManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  // State for UI controls
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  
  // State for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  
  // Hooks
  const pagination = usePagination({ initialPageSize: 10 });
  const sorting = useSorting<Volunteer>('created_at', 'desc');
  
  // Filter options for the search filter component
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'festival_id',
      label: 'Festival',
      type: 'select',
      options: festivals.map(festival => ({
        value: festival.id,
        label: festival.name,
      })),
    },
  ];
  
  // Fetch festivals on component mount
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        setFestivals(data || []);
        
        // Set active festival to the first one if available
        if (data && data.length > 0) {
          setActiveFestival(data[0]);
          setFilters(prev => ({ ...prev, festival_id: data[0].id }));
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      }
    };
    
    fetchFestivals();
  }, []);
  
  // On component mount, check for festivalId in URL params
  useEffect(() => {
    if (festivalId) {
      // If festivalId is provided in URL, set it in filters
      const festival = festivals.find(f => f.id === festivalId);
      if (festival) {
        setActiveFestival(festival);
        setFilters(prev => ({ ...prev, festival_id: festivalId }));
      }
    }
  }, [festivalId, festivals]);
  
  // Fetch volunteers when filters, sorting, or pagination changes
  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Skip if no active festival
      if (!activeFestival) {
        setVolunteers([]);
        setTotalVolunteers(0);
        setLoading(false);
        return;
      }
      
      // Create filter object for the API
      const apiFilter: any = {
        festival_id: activeFestival.id,
      };
      
      // Add status filter from tab or explicit filter
      if (tabValue === 1) {
        apiFilter.application_status = 'pending';
      } else if (tabValue === 2) {
        apiFilter.application_status = 'approved';
      } else if (tabValue === 3) {
        apiFilter.application_status = 'rejected';
      } else if (filters.status) {
        apiFilter.application_status = filters.status;
      }
      
      // Add search term
      if (searchTerm) {
        apiFilter.search = searchTerm;
      }
      
      // Get paginated data
      const { data, error } = await volunteerService.getVolunteers(
        apiFilter,
        {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
        }
      );
      
      if (error) {
        throw new Error(`Failed to fetch volunteers: ${error.message}`);
      }
      
      // Update state with data
      setVolunteers(data || []);
      
      // Get total count for pagination
      const countResponse = await volunteerService.countVolunteers(apiFilter);
      if (countResponse.data) {
        setTotalVolunteers(countResponse.data);
        pagination.setTotalItems(countResponse.data);
      }
    } catch (err: any) {
      console.error('Error fetching volunteers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    activeFestival, 
    tabValue, 
    filters, 
    searchTerm, 
    pagination.currentPage, 
    pagination.pageSize
  ]);
  
  // Fetch volunteers when dependencies change
  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);
  
  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Search handler
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };
  
  // Filter handler
  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    
    // Update active festival if festival_id filter changes
    if (newFilters.festival_id && newFilters.festival_id !== filters.festival_id) {
      const festival = festivals.find(f => f.id === newFilters.festival_id);
      if (festival) {
        setActiveFestival(festival);
      }
    }
  };
  
  // Volunteer status update handler
  const handleVolunteerStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await volunteerService.updateApplicationStatus(id, status);
      
      if (error) {
        throw new Error(`Failed to update volunteer status: ${error.message}`);
      }
      
      // Update local state to reflect the change
      setVolunteers(prev => 
        prev.map(volunteer => 
          volunteer.id === id ? { ...volunteer, application_status: status } : volunteer
        )
      );
      
      // Show success message
      setSnackbarMessage(`Volunteer ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Close details dialog if open
      setDetailsDialogOpen(false);
      
      // Refresh data if needed
      if ((tabValue === 1 && status !== 'pending') || 
          (tabValue === 2 && status !== 'approved') || 
          (tabValue === 3 && status !== 'rejected')) {
        fetchVolunteers();
      }
    } catch (err: any) {
      console.error('Error updating volunteer status:', err);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Volunteer details handler
  const handleVolunteerDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setDetailsDialogOpen(true);
  };
  
  // Skills edit handler
  const handleSkillsEdit = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setEditedSkills(volunteer.skills || []);
    setSkillsDialogOpen(true);
  };
  
  // Skills update handler
  const handleSkillsUpdate = async () => {
    if (!selectedVolunteer) return;
    
    try {
      const { error } = await volunteerService.updateVolunteer(
        selectedVolunteer.id, 
        { skills: editedSkills }
      );
      
      if (error) {
        throw new Error(`Failed to update volunteer skills: ${error.message}`);
      }
      
      // Update local state
      setVolunteers(prev =>
        prev.map(volunteer =>
          volunteer.id === selectedVolunteer.id
            ? { ...volunteer, skills: editedSkills }
            : volunteer
        )
      );
      
      // Show success message
      setSnackbarMessage('Volunteer skills updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Close dialog
      setSkillsDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating volunteer skills:', err);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Skills change handler
  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    setEditedSkills(event.target.value as string[]);
  };
  
  // Table columns definition
  const columns: TableColumn<Volunteer>[] = [
    {
      id: 'name',
      label: 'Name',
      accessor: (volunteer) => {
        const profile = volunteer.profiles;
        return profile?.full_name || 'Unknown';
      },
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      accessor: (volunteer) => {
        const profile = volunteer.profiles;
        return profile?.email || volunteer.email || 'No email';
      },
      sortable: true,
    },
    {
      id: 'skills',
      label: 'Skills',
      accessor: (volunteer) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(volunteer.skills || []).slice(0, 2).map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
          {(volunteer.skills || []).length > 2 && (
            <Chip 
              label={`+${(volunteer.skills || []).length - 2}`} 
              size="small" 
              variant="outlined" 
            />
          )}
          {(!volunteer.skills || volunteer.skills.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              No skills
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      accessor: (volunteer) => (
        <Chip 
          label={
            (volunteer.application_status || 'pending')
              .charAt(0).toUpperCase() + 
            (volunteer.application_status || 'pending').slice(1)
          } 
          color={
            volunteer.application_status === 'approved' 
              ? 'success' 
              : volunteer.application_status === 'rejected' 
                ? 'error' 
                : 'warning'
          }
          size="small"
        />
      ),
      sortable: true,
    },
    {
      id: 'created_at',
      label: 'Date Applied',
      accessor: (volunteer) => {
        const date = new Date(volunteer.created_at);
        return date.toLocaleDateString();
      },
      sortable: true,
    },
  ];
  
  // Table actions definition
  const actions: TableAction<Volunteer>[] = [
    {
      icon: <ViewIcon />,
      label: 'View details',
      onClick: handleVolunteerDetails,
    },
    {
      icon: <EditIcon />,
      label: 'Edit skills',
      onClick: handleSkillsEdit,
    },
    {
      icon: <ApproveIcon />,
      label: 'Approve',
      onClick: (volunteer) => handleVolunteerStatus(volunteer.id, 'approved'),
      condition: (volunteer) => volunteer.application_status === 'pending',
      color: 'success',
    },
    {
      icon: <RejectIcon />,
      label: 'Reject',
      onClick: (volunteer) => handleVolunteerStatus(volunteer.id, 'rejected'),
      condition: (volunteer) => volunteer.application_status === 'pending',
      color: 'error',
    },
    {
      icon: <AssignIcon />,
      label: 'Assign to crew',
      onClick: (volunteer) => {
        // Future feature: crew assignment
        setSnackbarMessage('Crew assignment feature coming soon');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      },
      condition: (volunteer) => volunteer.application_status === 'approved',
      color: 'primary',
    },
  ];
  
  // If there are no festivals, show a placeholder
  if (festivals.length === 0 && !loading && !error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Active Festivals
          </Typography>
          <Typography variant="body1" paragraph>
            There are no active festivals available. Please create a festival first.
          </Typography>
          <Button variant="contained" href="/admin/festivals">
            Manage Festivals
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // If there's an error, show it
  if (error && !loading) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchVolunteers}>
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }
  
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
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filterOptions={filterOptions}
          searchPlaceholder="Search volunteers by name or email..."
          showFilterByDefault={false}
        />

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
          <DataTable
            data={sorting.getSortedData(volunteers)}
            columns={columns}
            actions={actions}
            keyExtractor={(item) => item.id}
            pagination={pagination.paginationProps}
            loading={loading}
            emptyMessage="No volunteers found"
            sortConfig={sorting.sortConfig}
            onSort={sorting.requestSort}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DataTable
            data={sorting.getSortedData(volunteers)}
            columns={columns}
            actions={actions}
            keyExtractor={(item) => item.id}
            pagination={pagination.paginationProps}
            loading={loading}
            emptyMessage="No pending volunteers found"
            sortConfig={sorting.sortConfig}
            onSort={sorting.requestSort}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <DataTable
            data={sorting.getSortedData(volunteers)}
            columns={columns}
            actions={actions}
            keyExtractor={(item) => item.id}
            pagination={pagination.paginationProps}
            loading={loading}
            emptyMessage="No approved volunteers found"
            sortConfig={sorting.sortConfig}
            onSort={sorting.requestSort}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <DataTable
            data={sorting.getSortedData(volunteers)}
            columns={columns}
            actions={actions}
            keyExtractor={(item) => item.id}
            pagination={pagination.paginationProps}
            loading={loading}
            emptyMessage="No rejected volunteers found"
            sortConfig={sorting.sortConfig}
            onSort={sorting.requestSort}
          />
        </TabPanel>
      </Paper>

      {/* Volunteer details dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Volunteer Details</DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Name</Typography>
                  <Typography variant="body1">
                    {selectedVolunteer.profiles?.full_name || 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1">
                    {selectedVolunteer.profiles?.email || selectedVolunteer.email || 'No email'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Phone</Typography>
                  <Typography variant="body1">
                    {selectedVolunteer.phone || 'No phone number'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Date Applied</Typography>
                  <Typography variant="body1">
                    {new Date(selectedVolunteer.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip 
                    label={
                      (selectedVolunteer.application_status || 'pending')
                        .charAt(0).toUpperCase() + 
                      (selectedVolunteer.application_status || 'pending').slice(1)
                    } 
                    color={
                      selectedVolunteer.application_status === 'approved' 
                        ? 'success' 
                        : selectedVolunteer.application_status === 'rejected' 
                          ? 'error' 
                          : 'warning'
                    }
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {(selectedVolunteer.skills || []).map((skill) => (
                      <Chip key={skill} label={skill} />
                    ))}
                    {(!selectedVolunteer.skills || selectedVolunteer.skills.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No skills assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Availability</Typography>
                  {selectedVolunteer.availability ? (
                    <>
                      <Typography variant="body1">
                        Days: {Array.isArray(selectedVolunteer.availability.days) 
                          ? selectedVolunteer.availability.days.join(', ')
                          : 'Not specified'}
                      </Typography>
                      <Typography variant="body1">
                        Time: {selectedVolunteer.availability.startTime || 'Not specified'} - 
                        {selectedVolunteer.availability.endTime || 'Not specified'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No availability information
                    </Typography>
                  )}
                </Box>
                {selectedVolunteer.notes && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1">Notes</Typography>
                    <Typography variant="body1">
                      {selectedVolunteer.notes}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedVolunteer && selectedVolunteer.application_status === 'pending' && (
            <>
              <Button 
                onClick={() => handleVolunteerStatus(selectedVolunteer.id, 'approved')} 
                color="success" 
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleVolunteerStatus(selectedVolunteer.id, 'rejected')}
                color="error" 
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
            </>
          )}
          <Button 
            onClick={() => setDetailsDialogOpen(false)} 
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

export { VolunteerManagement }; 


