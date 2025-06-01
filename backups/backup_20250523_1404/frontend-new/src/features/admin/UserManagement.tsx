import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as CoordinatorIcon,
  Person as VolunteerIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Key as KeyIcon,
  PersonAdd as InviteIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

// Mock user data for development
const mockUsers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    role: 'admin',
    last_login: '2025-03-30T15:30:45Z',
    created_at: '2023-11-15T10:20:30Z',
    status: 'active',
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    role: 'coordinator',
    last_login: '2025-04-01T09:15:22Z',
    created_at: '2024-01-05T14:30:10Z',
    status: 'active',
  },
  {
    id: '3',
    full_name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '(555) 456-7890',
    role: 'volunteer',
    last_login: '2025-03-28T11:45:33Z',
    created_at: '2024-02-10T08:45:20Z',
    status: 'active',
  },
  {
    id: '4',
    full_name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '(555) 234-5678',
    role: 'coordinator',
    last_login: '2025-03-29T16:20:15Z',
    created_at: '2024-01-20T09:10:45Z',
    status: 'inactive',
  },
  {
    id: '5',
    full_name: 'Robert Brown',
    email: 'robert.b@example.com',
    phone: '(555) 876-5432',
    role: 'volunteer',
    last_login: '2025-03-25T10:30:40Z',
    created_at: '2024-02-15T13:25:50Z',
    status: 'active',
  },
  {
    id: '6',
    full_name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '(555) 321-6547',
    role: 'volunteer',
    last_login: '2025-03-31T14:15:10Z',
    created_at: '2024-02-28T11:35:25Z',
    status: 'active',
  },
  {
    id: '7',
    full_name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '(555) 765-4321',
    role: 'coordinator',
    last_login: '2025-03-27T09:45:50Z',
    created_at: '2024-01-10T15:50:15Z',
    status: 'active',
  },
  {
    id: '8',
    full_name: 'Lisa Martinez',
    email: 'lisa.m@example.com',
    phone: '(555) 432-1098',
    role: 'volunteer',
    last_login: null,
    created_at: '2024-03-05T10:15:30Z',
    status: 'pending',
  },
];

// Stats for dashboard cards
const userStats = {
  total: mockUsers.length,
  admins: mockUsers.filter(user => user.role === 'admin').length,
  coordinators: mockUsers.filter(user => user.role === 'coordinator').length,
  volunteers: mockUsers.filter(user => user.role === 'volunteer').length,
  active: mockUsers.filter(user => user.status === 'active').length,
  pending: mockUsers.filter(user => user.status === 'pending').length,
  inactive: mockUsers.filter(user => user.status === 'inactive').length,
};

// User form interface
interface UserFormData {
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'coordinator' | 'volunteer';
  password?: string;
  status: 'active' | 'inactive' | 'pending';
}

const UserManagement: React.FC = () => {
  // State variables
  const [users, setUsers] = useState<any[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<any[]>(mockUsers);
  const [stats, setStats] = useState(userStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    phone: '',
    role: 'volunteer',
    password: '',
    status: 'active',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, this would fetch from Supabase
        // For now, we're using mock data
        
        // const { data, error } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // setUsers(data || []);
        
        // Using mock data for development
        setTimeout(() => {
          setUsers(mockUsers);
          updateStats(mockUsers);
          setLoading(false);
        }, 500);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update filteredUsers when tab changes or search term changes
  useEffect(() => {
    filterUsers();
  }, [tabValue, searchTerm, users]);

  // Update stats when users change
  const updateStats = (userList: any[]) => {
    setStats({
      total: userList.length,
      admins: userList.filter(user => user.role === 'admin').length,
      coordinators: userList.filter(user => user.role === 'coordinator').length,
      volunteers: userList.filter(user => user.role === 'volunteer').length,
      active: userList.filter(user => user.status === 'active').length,
      pending: userList.filter(user => user.status === 'pending').length,
      inactive: userList.filter(user => user.status === 'inactive').length,
    });
  };

  // Filter users based on tab and search term
  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role or status based on tab
    switch (tabValue) {
      case 1: // Admins
        filtered = filtered.filter(user => user.role === 'admin');
        break;
      case 2: // Coordinators
        filtered = filtered.filter(user => user.role === 'coordinator');
        break;
      case 3: // Volunteers
        filtered = filtered.filter(user => user.role === 'volunteer');
        break;
      case 4: // Pending
        filtered = filtered.filter(user => user.status === 'pending');
        break;
      case 5: // Inactive
        filtered = filtered.filter(user => user.status === 'inactive');
        break;
      // case 0 is All Users, no filter needed
    }

    // Apply search filter if search term exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.full_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.includes(term))
      );
    }

    setFilteredUsers(filtered);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle dialog open for adding a new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'volunteer',
      password: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing a user
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input change
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  // Handle user form submission
  const handleSubmitUser = async () => {
    setLoading(true);
    try {
      if (selectedUser) {
        // Update existing user
        // In a real app, this would update in Supabase
        // const { error } = await supabase
        //   .from('profiles')
        //   .update({
        //     full_name: formData.full_name,
        //     phone: formData.phone,
        //     role: formData.role,
        //     status: formData.status,
        //   })
        //   .eq('id', selectedUser.id);
        
        // if (error) throw error;

        // Mock update for development
        const updatedUsers = users.map(user => 
          user.id === selectedUser.id ? { ...user, ...formData } : user
        );
        setUsers(updatedUsers);
        updateStats(updatedUsers);
      } else {
        // Create new user
        // In a real app, this would create in Supabase Auth and then Profiles
        // const { data, error } = await supabase.auth.signUp({
        //   email: formData.email,
        //   password: formData.password || 'temporaryPassword123',
        //   options: {
        //     data: {
        //       full_name: formData.full_name,
        //       phone: formData.phone,
        //       role: formData.role,
        //       status: formData.status,
        //     }
        //   }
        // });
        
        // if (error) throw error;

        // Mock create for development
        const newUser = {
          id: (users.length + 1).toString(),
          ...formData,
          created_at: new Date().toISOString(),
          last_login: null,
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        updateStats(updatedUsers);
      }

      setOpenDialog(false);
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user dialog open
  const handleDeleteDialogOpen = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Handle delete user confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      // In a real app, this would delete from Supabase
      // const { error } = await supabase
      //   .from('profiles')
      //   .delete()
      //   .eq('id', userToDelete.id);
      
      // if (error) throw error;

      // Mock delete for development
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      updateStats(updatedUsers);
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon color="error" />;
      case 'coordinator':
        return <CoordinatorIcon color="warning" />;
      case 'volunteer':
        return <VolunteerIcon color="success" />;
      default:
        return <AccountCircleIcon />;
    }
  };

  // Helper function to get status chip
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'inactive':
        return <Chip label="Inactive" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, roles, and permissions for the festival volunteer portal.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.total}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <AccountCircleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {stats.active} Active Users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Administrators
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.admins}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <AdminIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Full system access
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Coordinators
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.coordinators}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CoordinatorIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Festival management
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Volunteers
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.volunteers}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <VolunteerIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Festival participants
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User List Section */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Search users..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 500);
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* User Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Badge badgeContent={stats.total} color="primary">
                All Users
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.admins} color="error">
                Admins
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.coordinators} color="warning">
                Coordinators
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.volunteers} color="success">
                Volunteers
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.pending} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.inactive} color="default">
                Inactive
              </Badge>
            } 
          />
        </Tabs>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddUser}
              sx={{ mt: 2 }}
            >
              Add User
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: user.role === 'admin' 
                              ? 'error.main' 
                              : user.role === 'coordinator' 
                                ? 'warning.main' 
                                : 'success.main' 
                            }}>
                              {user.full_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">{user.full_name}</Typography>
                              {user.phone && (
                                <Typography variant="caption" color="text.secondary">
                                  {user.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getRoleIcon(user.role)}
                            <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                              {user.role}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(user.status)}</TableCell>
                        <TableCell>
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString() 
                            : 'Never'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton onClick={() => handleEditUser(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton color="error" onClick={() => handleDeleteDialogOpen(user)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                disabled={!!selectedUser} // Email can't be changed for existing users
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {!selectedUser && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  helperText="Leave blank to send a password reset email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleFormChange}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="coordinator">Coordinator</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitUser}
            disabled={!formData.full_name || !formData.email || !formData.role || !formData.status}
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user:{' '}
            <strong>{userToDelete?.full_name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export { UserManagement }; 