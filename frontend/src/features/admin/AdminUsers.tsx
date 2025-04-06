import React, { useState } from 'react';
import {
  Box,
  Container,
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
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data - replace with actual data from your backend
const mockUsers = [
  { id: 1, email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 2, email: 'coordinator@example.com', role: 'coordinator', status: 'active' },
  { id: 3, email: 'volunteer1@example.com', role: 'volunteer', status: 'pending' },
  { id: 4, email: 'volunteer2@example.com', role: 'volunteer', status: 'active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    status: 'pending',
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        role: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = () => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      setUsers([...users, { id: users.length + 1, ...formData }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Box>

        <Paper elevation={0} sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="coordinator">Coordinator</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedUser ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 
import {
  Box,
  Container,
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
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data - replace with actual data from your backend
const mockUsers = [
  { id: 1, email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 2, email: 'coordinator@example.com', role: 'coordinator', status: 'active' },
  { id: 3, email: 'volunteer1@example.com', role: 'volunteer', status: 'pending' },
  { id: 4, email: 'volunteer2@example.com', role: 'volunteer', status: 'active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    status: 'pending',
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        role: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = () => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      setUsers([...users, { id: users.length + 1, ...formData }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Box>

        <Paper elevation={0} sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="coordinator">Coordinator</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedUser ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 
import {
  Box,
  Container,
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
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data - replace with actual data from your backend
const mockUsers = [
  { id: 1, email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 2, email: 'coordinator@example.com', role: 'coordinator', status: 'active' },
  { id: 3, email: 'volunteer1@example.com', role: 'volunteer', status: 'pending' },
  { id: 4, email: 'volunteer2@example.com', role: 'volunteer', status: 'active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    status: 'pending',
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        role: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = () => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      setUsers([...users, { id: users.length + 1, ...formData }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Box>

        <Paper elevation={0} sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="coordinator">Coordinator</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedUser ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 