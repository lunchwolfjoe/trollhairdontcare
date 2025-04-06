import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Dialog,
  DialogTitle,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockAssignments = [
  {
    id: 1,
    task: 'Stage Setup',
    location: 'Main Stage',
    startTime: '2024-06-01T08:00',
    endTime: '2024-06-01T10:00',
    status: 'Pending',
    description: 'Set up main stage equipment',
    requiredSkills: ['Technical', 'Heavy Lifting'],
  },
  {
    id: 2,
    task: 'Food Court Support',
    location: 'Food Court',
    startTime: '2024-06-01T09:00',
    endTime: '2024-06-01T17:00',
    status: 'Confirmed',
    description: 'Assist vendors with setup and coordination',
    requiredSkills: ['Customer Service', 'Food Service'],
  },
];

const VolunteerSchedule: React.FC = () => {
  const [assignments, setAssignments] = useState(mockAssignments);

  const handleAccept = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Confirmed' } : a
    ));
  };

  const handleDecline = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Declined' } : a
    ));
  };

  const columns: GridColDef[] = [
    { field: 'task', headerName: 'Task', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { 
      field: 'startTime', 
      headerName: 'Start Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { 
      field: 'endTime', 
      headerName: 'End Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'requiredSkills',
      headerName: 'Required Skills',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((skill: string, index: number) => (
            <Chip key={index} label={skill} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Confirmed' 
              ? 'success' 
              : params.value === 'Declined' 
                ? 'error' 
                : 'warning'
          }
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              My Schedule
            </Typography>
            <DataGrid
              rows={assignments}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Pending Assignments
          </Typography>
          <Grid container spacing={3}>
            {assignments
              .filter(assignment => assignment.status === 'Pending')
              .map(assignment => (
                <Grid item xs={12} md={6} key={assignment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {assignment.task}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Location: {assignment.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {new Date(assignment.startTime).toLocaleString()} - {new Date(assignment.endTime).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {assignment.requiredSkills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={() => handleAccept(assignment.id)}
                        color="success"
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={() => handleDecline(assignment.id)}
                        color="error"
                      >
                        Decline
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerSchedule; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockAssignments = [
  {
    id: 1,
    task: 'Stage Setup',
    location: 'Main Stage',
    startTime: '2024-06-01T08:00',
    endTime: '2024-06-01T10:00',
    status: 'Pending',
    description: 'Set up main stage equipment',
    requiredSkills: ['Technical', 'Heavy Lifting'],
  },
  {
    id: 2,
    task: 'Food Court Support',
    location: 'Food Court',
    startTime: '2024-06-01T09:00',
    endTime: '2024-06-01T17:00',
    status: 'Confirmed',
    description: 'Assist vendors with setup and coordination',
    requiredSkills: ['Customer Service', 'Food Service'],
  },
];

const VolunteerSchedule: React.FC = () => {
  const [assignments, setAssignments] = useState(mockAssignments);

  const handleAccept = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Confirmed' } : a
    ));
  };

  const handleDecline = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Declined' } : a
    ));
  };

  const columns: GridColDef[] = [
    { field: 'task', headerName: 'Task', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { 
      field: 'startTime', 
      headerName: 'Start Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { 
      field: 'endTime', 
      headerName: 'End Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'requiredSkills',
      headerName: 'Required Skills',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((skill: string, index: number) => (
            <Chip key={index} label={skill} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Confirmed' 
              ? 'success' 
              : params.value === 'Declined' 
                ? 'error' 
                : 'warning'
          }
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              My Schedule
            </Typography>
            <DataGrid
              rows={assignments}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Pending Assignments
          </Typography>
          <Grid container spacing={3}>
            {assignments
              .filter(assignment => assignment.status === 'Pending')
              .map(assignment => (
                <Grid item xs={12} md={6} key={assignment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {assignment.task}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Location: {assignment.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {new Date(assignment.startTime).toLocaleString()} - {new Date(assignment.endTime).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {assignment.requiredSkills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={() => handleAccept(assignment.id)}
                        color="success"
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={() => handleDecline(assignment.id)}
                        color="error"
                      >
                        Decline
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerSchedule; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

// Mock data - replace with actual data from your backend
const mockAssignments = [
  {
    id: 1,
    task: 'Stage Setup',
    location: 'Main Stage',
    startTime: '2024-06-01T08:00',
    endTime: '2024-06-01T10:00',
    status: 'Pending',
    description: 'Set up main stage equipment',
    requiredSkills: ['Technical', 'Heavy Lifting'],
  },
  {
    id: 2,
    task: 'Food Court Support',
    location: 'Food Court',
    startTime: '2024-06-01T09:00',
    endTime: '2024-06-01T17:00',
    status: 'Confirmed',
    description: 'Assist vendors with setup and coordination',
    requiredSkills: ['Customer Service', 'Food Service'],
  },
];

const VolunteerSchedule: React.FC = () => {
  const [assignments, setAssignments] = useState(mockAssignments);

  const handleAccept = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Confirmed' } : a
    ));
  };

  const handleDecline = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'Declined' } : a
    ));
  };

  const columns: GridColDef[] = [
    { field: 'task', headerName: 'Task', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { 
      field: 'startTime', 
      headerName: 'Start Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { 
      field: 'endTime', 
      headerName: 'End Time', 
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'requiredSkills',
      headerName: 'Required Skills',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((skill: string, index: number) => (
            <Chip key={index} label={skill} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Confirmed' 
              ? 'success' 
              : params.value === 'Declined' 
                ? 'error' 
                : 'warning'
          }
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              My Schedule
            </Typography>
            <DataGrid
              rows={assignments}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Pending Assignments
          </Typography>
          <Grid container spacing={3}>
            {assignments
              .filter(assignment => assignment.status === 'Pending')
              .map(assignment => (
                <Grid item xs={12} md={6} key={assignment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {assignment.task}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Location: {assignment.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {new Date(assignment.startTime).toLocaleString()} - {new Date(assignment.endTime).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {assignment.requiredSkills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={() => handleAccept(assignment.id)}
                        color="success"
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={() => handleDecline(assignment.id)}
                        color="error"
                      >
                        Decline
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VolunteerSchedule; 