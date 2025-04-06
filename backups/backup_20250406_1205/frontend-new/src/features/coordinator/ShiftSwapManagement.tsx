import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
}

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface ShiftSwapRequest {
  id: string;
  shift_id: string;
  requester_id: string;
  proposed_volunteer_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  requester?: Volunteer;
  proposed_volunteer?: Volunteer;
  shift?: Shift;
}

// Mock data for development
const mockRequests: ShiftSwapRequest[] = [
  {
    id: '1',
    shift_id: '101',
    requester_id: '201',
    proposed_volunteer_id: '202',
    reason: 'I have a doctor\'s appointment that day',
    status: 'pending',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    requester: {
      id: '201',
      full_name: 'Alice Johnson',
      email: 'alice@example.com'
    },
    proposed_volunteer: {
      id: '202',
      full_name: 'Bob Smith',
      email: 'bob@example.com'
    },
    shift: {
      id: '101',
      date: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
      start_time: '09:00',
      end_time: '13:00',
      location: 'Main Stage'
    }
  },
  {
    id: '2',
    shift_id: '102',
    requester_id: '203',
    proposed_volunteer_id: '204',
    reason: 'Family emergency',
    status: 'pending',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    requester: {
      id: '203',
      full_name: 'Charlie Davis',
      email: 'charlie@example.com'
    },
    proposed_volunteer: {
      id: '204',
      full_name: 'Diana Evans',
      email: 'diana@example.com'
    },
    shift: {
      id: '102',
      date: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
      start_time: '13:00',
      end_time: '17:00',
      location: 'Food Court'
    }
  },
  {
    id: '3',
    shift_id: '103',
    requester_id: '205',
    proposed_volunteer_id: '206',
    reason: 'Transportation issues',
    status: 'approved',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    requester: {
      id: '205',
      full_name: 'Erik Fisher',
      email: 'erik@example.com'
    },
    proposed_volunteer: {
      id: '206',
      full_name: 'Fiona Gomez',
      email: 'fiona@example.com'
    },
    shift: {
      id: '103',
      date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      start_time: '10:00',
      end_time: '14:00',
      location: 'Information Booth'
    }
  },
  {
    id: '4',
    shift_id: '104',
    requester_id: '207',
    proposed_volunteer_id: '208',
    reason: 'No longer available on this date',
    status: 'rejected',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    requester: {
      id: '207',
      full_name: 'George Harris',
      email: 'george@example.com'
    },
    proposed_volunteer: {
      id: '208',
      full_name: 'Hannah Irwin',
      email: 'hannah@example.com'
    },
    shift: {
      id: '104',
      date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      start_time: '14:00',
      end_time: '18:00',
      location: 'Parking Area'
    }
  }
];

// Define types for Supabase data structures
interface VolunteerProfile {
  id: string;
  full_name: string;
  email: string;
}

interface VolunteerWithProfile {
  id: string;
  profiles: VolunteerProfile | VolunteerProfile[];
}

const ShiftSwapManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(mockRequests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found. Please create a festival first.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // If festivalId is in URL, use that, otherwise use the first festival
        const targetFestivalId = festivalId || data[0].id;
        const festival = data.find(f => f.id === targetFestivalId);
        
        if (festival) {
          setCurrentFestival(festival);
          
          // Once we have the festival, fetch swap requests for it
          fetchSwapRequestsForFestival(festival.id);
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);

  const fetchSwapRequestsForFestival = async (festivalId: string) => {
    console.log(`Fetching swap requests for festival: ${festivalId}`);
    setLoading(true);
    setError(null);
    
    try {
      // First, get volunteers for this festival
      const { data: festivalVolunteers, error: festivalVolunteersError } = await supabase
        .from('volunteers')
        .select('id')
        .eq('festival_id', festivalId);
      
      if (festivalVolunteersError) {
        throw new Error(`Failed to fetch festival volunteers: ${festivalVolunteersError.message}`);
      }
      
      // If no volunteers, show empty state
      if (!festivalVolunteers || festivalVolunteers.length === 0) {
        setSwapRequests([]);
        setLoading(false);
        return;
      }
      
      // Extract volunteer IDs
      const volunteerIds = festivalVolunteers.map(v => v.id);
      
      // Using a simpler query to avoid relationship issues
      const { data: requestsData, error: requestsError } = await supabase
        .from('shift_swap_requests')
        .select(`
          id,
          shift_id,
          requester_id,
          proposed_volunteer_id,
          reason,
          status,
          created_at
        `)
        .in('requester_id', volunteerIds);
      
      if (requestsError) {
        throw new Error(`Failed to fetch swap requests: ${requestsError.message}`);
      }
      
      // Separately fetch shift data
      const shiftIds = requestsData.map(req => req.shift_id).filter(Boolean);
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .in('id', shiftIds);
        
      if (shiftsError) {
        console.error('Error fetching shifts:', shiftsError);
      }
      
      // Fetch volunteer data
      const requesterIds = requestsData.map(req => req.requester_id).filter(Boolean);
      const proposedIds = requestsData.map(req => req.proposed_volunteer_id).filter(Boolean);
      const allVolunteerIds = [...new Set([...requesterIds, ...proposedIds])];
      
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select(`
          id,
          profiles:profile_id (
            id,
            full_name,
            email
          )
        `)
        .in('id', allVolunteerIds);
      
      if (volunteersError) {
        console.error('Error fetching volunteers:', volunteersError);
      }
      
      // Process the data to match the expected format
      const processedRequests = requestsData.map(request => {
        // Find related shift
        const shift = shiftsData?.find(s => s.id === request.shift_id) || null;
        
        // Find requester and proposed volunteer
        const requester = volunteersData?.find(v => v.id === request.requester_id) as VolunteerWithProfile | null;
        const proposedVolunteer = volunteersData?.find(v => v.id === request.proposed_volunteer_id) as VolunteerWithProfile | null;
        
        // Helper function to extract profile data safely
        const extractProfileData = (volunteer: VolunteerWithProfile | null): VolunteerProfile | null => {
          if (!volunteer || !volunteer.profiles) return null;
          
          if (Array.isArray(volunteer.profiles)) {
            return volunteer.profiles[0] || null;
          }
          
          return volunteer.profiles;
        };
        
        const requesterProfile = extractProfileData(requester);
        const proposedVolunteerProfile = extractProfileData(proposedVolunteer);
        
        return {
          id: request.id,
          shift_id: request.shift_id,
          requester_id: request.requester_id,
          proposed_volunteer_id: request.proposed_volunteer_id,
          reason: request.reason,
          status: request.status,
          created_at: request.created_at,
          requester: {
            id: requester?.id || '',
            full_name: requesterProfile?.full_name || 'Unknown',
            email: requesterProfile?.email || ''
          },
          proposed_volunteer: {
            id: proposedVolunteer?.id || '',
            full_name: proposedVolunteerProfile?.full_name || 'Unknown',
            email: proposedVolunteerProfile?.email || ''
          },
          shift: {
            id: shift?.id || '',
            date: shift?.date || '',
            start_time: shift?.start_time || '',
            end_time: shift?.end_time || '',
            location: shift?.location || ''
          }
        };
      });
      
      console.log('Fetched volunteer IDs:', volunteerIds);
      console.log('Fetched swap requests:', requestsData);

      // In development mode, override with mock data
      if (import.meta.env.DEV) {
        console.log('Using mock data for swap requests');
        setSwapRequests(mockRequests);
      } else {
        // Process actual data (disable for now)
        // setSwapRequests(processedRequests);
        setSwapRequests(mockRequests);
      }
      
    } catch (err: any) {
      console.error('Error fetching swap requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchSwapRequestsForFestival(festival.id);
    }
  };

  const handleApprove = (requestId: string) => {
    // For development, update local state
    setSwapRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === requestId ? { ...request, status: 'approved' } : request
      )
    );
  };

  const handleReject = (requestId: string) => {
    // For development, update local state
    setSwapRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === requestId ? { ...request, status: 'rejected' } : request
      )
    );
  };

  const filteredRequests = activeFilter === 'all'
    ? swapRequests
    : swapRequests.filter(request => request.status === activeFilter);

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewRequest = (request: ShiftSwapRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedRequest(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Shift Swap Management
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {availableFestivals.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={currentFestival?.id || ''}
                  label="Festival"
                  onChange={(e) => handleFestivalChange(e.target.value)}
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box display="flex" mb={3}>
              <Button
                variant={activeFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setActiveFilter('all')}
                sx={{ mr: 1 }}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'pending' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setActiveFilter('pending')}
                sx={{ mr: 1 }}
              >
                Pending
              </Button>
              <Button
                variant={activeFilter === 'approved' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setActiveFilter('approved')}
                sx={{ mr: 1 }}
              >
                Approved
              </Button>
              <Button
                variant={activeFilter === 'rejected' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setActiveFilter('rejected')}
              >
                Rejected
              </Button>
            </Box>

            <Grid container spacing={3}>
              {filteredRequests.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No shift swap requests matching the selected filter.
                  </Alert>
                </Grid>
              ) : (
                filteredRequests.map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6">
                            Shift Swap Request
                          </Typography>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status)}
                          />
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Shift Details
                          </Typography>
                          <Typography>
                            Date: {formatDate(request.shift?.date || '')}
                          </Typography>
                          <Typography>
                            Time: {request.shift?.start_time} - {request.shift?.end_time}
                          </Typography>
                          <Typography>
                            Location: {request.shift?.location}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Requester
                          </Typography>
                          <Typography>
                            {request.requester?.full_name}
                          </Typography>
                          <Typography color="textSecondary">
                            {request.requester?.email}
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Proposed Replacement
                          </Typography>
                          <Typography>
                            {request.proposed_volunteer?.full_name}
                          </Typography>
                          <Typography color="textSecondary">
                            {request.proposed_volunteer?.email}
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Reason
                          </Typography>
                          <Typography>
                            {request.reason}
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="textSecondary">
                          Requested on: {formatDate(request.created_at)}
                        </Typography>
                      </CardContent>
                      {request.status === 'pending' && (
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="Approve">
                            <IconButton color="success" onClick={() => handleApprove(request.id)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton color="error" onClick={() => handleReject(request.id)}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            <Dialog open={viewDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
              <DialogTitle>Swap Request Details</DialogTitle>
              <DialogContent>
                {selectedRequest && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Shift Information
                    </Typography>
                    <Typography>
                      Date: {new Date(selectedRequest.shift?.date || '').toLocaleDateString()}
                    </Typography>
                    <Typography>
                      Time: {selectedRequest.shift?.start_time} - {selectedRequest.shift?.end_time}
                    </Typography>
                    <Typography>
                      Location: {selectedRequest.shift?.location}
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Volunteers
                    </Typography>
                    <Typography>
                      Requester: {selectedRequest.requester?.full_name}
                    </Typography>
                    <Typography>
                      Proposed: {selectedRequest.proposed_volunteer?.full_name}
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Reason
                    </Typography>
                    <Typography>{selectedRequest.reason}</Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Container>
  );
};

export { ShiftSwapManagement }; 
