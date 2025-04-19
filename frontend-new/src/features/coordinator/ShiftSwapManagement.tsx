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
import { useSorting } from '../../hooks/useSorting';
import { Database } from '../../lib/types/supabase';

type ShiftSwapRequest = Database['public']['Tables']['shift_swap_requests']['Row'];
type Shift = Database['public']['Tables']['shifts']['Row'];
type Volunteer = Database['public']['Tables']['volunteers']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface VolunteerWithProfile extends Volunteer {
  profiles: Profile;
}

interface ShiftSwapRequestWithDetails extends ShiftSwapRequest {
  shift: Shift;
  requester: VolunteerWithProfile;
  proposed_volunteer: VolunteerWithProfile;
}

// Mock data for development
const mockRequests: ShiftSwapRequestWithDetails[] = [
  {
    id: '1',
    shift_id: '101',
    requester_id: '201',
    proposed_volunteer_id: '202',
    reason: 'Family emergency',
    status: 'pending',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    shift: {
      id: '101',
      crew_id: '301',
      start_time: new Date(Date.now() + 432000000).toISOString(),
      end_time: new Date(Date.now() + 432000000 + 14400000).toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    requester: {
      id: '201',
      profile_id: 'profile1',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile1',
        full_name: 'Alice Johnson',
        avatar_url: 'https://example.com/avatar1.jpg',
        email: 'alice@example.com',
        phone: '555-1234',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    proposed_volunteer: {
      id: '202',
      profile_id: 'profile2',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile2',
        full_name: 'Bob Smith',
        avatar_url: 'https://example.com/avatar2.jpg',
        email: 'bob@example.com',
        phone: '555-5678',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },
  {
    id: '2',
    shift_id: '102',
    requester_id: '203',
    proposed_volunteer_id: '204',
    reason: 'Schedule conflict',
    status: 'pending',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    shift: {
      id: '102',
      crew_id: '302',
      start_time: new Date(Date.now() + 345600000).toISOString(),
      end_time: new Date(Date.now() + 345600000 + 14400000).toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    requester: {
      id: '203',
      profile_id: 'profile3',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile3',
        full_name: 'Charlie Davis',
        avatar_url: 'https://example.com/avatar3.jpg',
        email: 'charlie@example.com',
        phone: '555-9012',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    proposed_volunteer: {
      id: '204',
      profile_id: 'profile4',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile4',
        full_name: 'Diana Evans',
        avatar_url: 'https://example.com/avatar4.jpg',
        email: 'diana@example.com',
        phone: '555-3456',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },
  {
    id: '3',
    shift_id: '103',
    requester_id: '205',
    proposed_volunteer_id: '206',
    reason: 'Personal appointment',
    status: 'approved',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    shift: {
      id: '103',
      crew_id: '303',
      start_time: new Date(Date.now() + 259200000).toISOString(),
      end_time: new Date(Date.now() + 259200000 + 14400000).toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    requester: {
      id: '205',
      profile_id: 'profile5',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile5',
        full_name: 'Erik Fisher',
        avatar_url: 'https://example.com/avatar5.jpg',
        email: 'erik@example.com',
        phone: '555-7890',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    proposed_volunteer: {
      id: '206',
      profile_id: 'profile6',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile6',
        full_name: 'Fiona Gomez',
        avatar_url: 'https://example.com/avatar6.jpg',
        email: 'fiona@example.com',
        phone: '555-1234',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },
  {
    id: '4',
    shift_id: '104',
    requester_id: '207',
    proposed_volunteer_id: '208',
    reason: 'Transportation issues',
    status: 'rejected',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
    shift: {
      id: '104',
      crew_id: '304',
      start_time: new Date(Date.now() + 172800000).toISOString(),
      end_time: new Date(Date.now() + 172800000 + 14400000).toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    requester: {
      id: '207',
      profile_id: 'profile7',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile7',
        full_name: 'George Harris',
        avatar_url: 'https://example.com/avatar7.jpg',
        email: 'george@example.com',
        phone: '555-5678',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    proposed_volunteer: {
      id: '208',
      profile_id: 'profile8',
      festival_id: '401',
      status: 'approved',
      skills: ['first aid', 'crowd management'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: 'profile8',
        full_name: 'Hannah Irwin',
        avatar_url: 'https://example.com/avatar8.jpg',
        email: 'hannah@example.com',
        phone: '555-9012',
        roles: ['volunteer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }
];

const ShiftSwapManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequestWithDetails[]>(mockRequests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequestWithDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  
  // Add sorting hook
  const sorting = useSorting<ShiftSwapRequestWithDetails>('created_at', 'desc');

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      // Correctly access the data from the ApiResponse
      const { data: festivalsData, error: festivalsError } = await festivalService.getActiveFestivals();
      
      if (festivalsError) throw festivalsError;
      
      // Set state with the actual data array (or empty array)
      setAvailableFestivals(festivalsData || []);
      
      if (festivalId && festivalsData) { // Check if festivalsData is not null
        // Use .find on the data array
        const currentFest = festivalsData.find(f => f.id === festivalId);
        if (currentFest) {
          setCurrentFestival(currentFest);
          await fetchSwapRequestsForFestival(currentFest.id);
        }
      } else if (festivalsData && festivalsData.length > 0) {
        // Default to first festival if no ID in URL
        setCurrentFestival(festivalsData[0]);
        await fetchSwapRequestsForFestival(festivalsData[0].id);
      }
      
    } catch (err: any) {
      setError('Failed to fetch festivals: ' + (err.message || 'Unknown error'));
      console.error('Error fetching festivals:', err);
    }
  };

  const fetchSwapRequestsForFestival = async (festivalId: string) => {
    try {
      setLoading(true);
      // Fetch shift swap requests with explicit nested selections
      const { data: swapRequestsData, error: swapRequestsError } = await supabase
        .from('shift_swap_requests')
        .select(`
          *,
          shift:shifts!inner(*), 
          requester:volunteers!inner(
            *,
            profiles!inner(*)
          ),
          proposed_volunteer:volunteers!inner(
            *,
            profiles!inner(*)
          )
        `);
        // Add .eq filter after select if needed, but filtering client-side first
        // .eq('shifts.festival_id', festivalId); // Requires correct relationship setup

      if (swapRequestsError) {
        console.error("Supabase error fetching swaps:", swapRequestsError);
        throw swapRequestsError;
      }

      // Filter the results client-side based on the festival ID of the shift
      // Assuming the Shift type has festival_id or crew_id relates to festival
      const filteredData = swapRequestsData?.filter(req => {
        // Need logic to link req.shift.crew_id to the festivalId
        // For now, let's assume all fetched requests are for the correct festival
        // if direct filtering on the query isn't straightforward.
        return true; // Placeholder filter
      }) || [];
      
      // Explicitly map to the required type to avoid casting errors
      const mappedRequests: ShiftSwapRequestWithDetails[] = filteredData.map((req: any) => ({
         id: req.id,
         shift_id: req.shift_id,
         requester_id: req.requester_id,
         proposed_volunteer_id: req.proposed_volunteer_id,
         reason: req.reason,
         status: req.status,
         created_at: req.created_at,
         updated_at: req.updated_at, 
         shift: req.shift as Shift, // Cast nested parts
         requester: {
           ...req.requester,
           profiles: req.requester.profiles as Profile
         } as VolunteerWithProfile,
         proposed_volunteer: {
           ...req.proposed_volunteer,
           profiles: req.proposed_volunteer.profiles as Profile
         } as VolunteerWithProfile
      }));

      setSwapRequests(mappedRequests);

    } catch (err: any) {
      setError('Failed to fetch shift swap requests: ' + (err.message || 'Unknown error'));
      console.error('Error fetching shift swap requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: ShiftSwapRequestWithDetails) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state
      setSwapRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'approved' }
            : req
        )
      );
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleRejectRequest = async (request: ShiftSwapRequestWithDetails) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state
      setSwapRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'rejected' }
            : req
        )
      );
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  const filteredRequests = activeFilter === 'all'
    ? swapRequests
    : swapRequests.filter(request => request.status === activeFilter);
    
  // Apply sorting to filtered requests
  const sortedRequests = sorting.getSortedData(filteredRequests);

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    // You can derive date from start_time if needed
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString?: string) => {
     if (!timeString) return 'N/A';
     try {
       return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     } catch (e) {
       return timeString; // Return original if parsing fails
     }
  };

  const handleViewRequest = (request: ShiftSwapRequestWithDetails) => {
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
                  onChange={(e) => {
                    const festivalId = e.target.value;
                    if (festivalId) {
                      fetchSwapRequestsForFestival(festivalId);
                    }
                  }}
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
              {sortedRequests.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No shift swap requests matching the selected filter.
                  </Alert>
                </Grid>
              ) : (
                sortedRequests.map((request) => (
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
                            Date: {formatDate(request.shift?.start_time)}
                          </Typography>
                          <Typography>
                            Time: {formatTime(request.shift?.start_time)} - {formatTime(request.shift?.end_time)}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Requester
                          </Typography>
                          <Typography>
                            {request.requester.profiles.full_name}
                          </Typography>
                          <Typography color="textSecondary">
                            {request.requester.profiles.email}
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Proposed Replacement
                          </Typography>
                          <Typography>
                            {request.proposed_volunteer.profiles.full_name}
                          </Typography>
                          <Typography color="textSecondary">
                            {request.proposed_volunteer.profiles.email}
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
                            <IconButton color="success" onClick={() => handleApproveRequest(request)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton color="error" onClick={() => handleRejectRequest(request)}>
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
                      Date: {selectedRequest?.shift?.start_time ? new Date(selectedRequest.shift.start_time).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography>
                      Time: {formatTime(selectedRequest?.shift?.start_time)} - {formatTime(selectedRequest?.shift?.end_time)}
                    </Typography>
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
