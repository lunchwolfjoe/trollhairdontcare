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
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

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

const ShiftSwapManagement: React.FC = () => {
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(mockRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    // For development, we're using mock data
  }, []);

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
    <Box>
      <Typography variant="h4" gutterBottom>
        Shift Swap Management
      </Typography>

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
    </Box>
  );
};

export default ShiftSwapManagement; 