import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../../hooks/useAppDispatch';
import {
  selectUsers,
  selectLoading,
  setUsers,
  setSelectedUser,
} from '../../../store/slices/adminSlice';

export default function ManageUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectLoading);
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    email: '',
    role: '',
    status: 'active',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewUser({ email: '', role: '', status: 'active' });
  };

  const handleSubmit = () => {
    // TODO: Implement user creation logic
    handleClose();
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'active'
                ? 'success.light'
                : 'error.light',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => dispatch(setSelectedUser(params.row))}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                // TODO: Implement delete functionality
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add User
        </Button>
      </Box>

      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newUser.role}
              label="Role"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newUser.status}
              label="Status"
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../../hooks/useAppDispatch';
import {
  selectUsers,
  selectLoading,
  setUsers,
  setSelectedUser,
} from '../../../store/slices/adminSlice';

export default function ManageUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectLoading);
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    email: '',
    role: '',
    status: 'active',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewUser({ email: '', role: '', status: 'active' });
  };

  const handleSubmit = () => {
    // TODO: Implement user creation logic
    handleClose();
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'active'
                ? 'success.light'
                : 'error.light',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => dispatch(setSelectedUser(params.row))}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                // TODO: Implement delete functionality
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add User
        </Button>
      </Box>

      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newUser.role}
              label="Role"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newUser.status}
              label="Status"
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../../hooks/useAppDispatch';
import {
  selectUsers,
  selectLoading,
  setUsers,
  setSelectedUser,
} from '../../../store/slices/adminSlice';

export default function ManageUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectLoading);
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    email: '',
    role: '',
    status: 'active',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewUser({ email: '', role: '', status: 'active' });
  };

  const handleSubmit = () => {
    // TODO: Implement user creation logic
    handleClose();
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'active'
                ? 'success.light'
                : 'error.light',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => dispatch(setSelectedUser(params.row))}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                // TODO: Implement delete functionality
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add User
        </Button>
      </Box>

      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newUser.role}
              label="Role"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newUser.status}
              label="Status"
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 