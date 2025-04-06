import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const defaultRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access',
    permissions: ['manage_users', 'manage_roles', 'manage_events'],
  },
  {
    id: 2,
    name: 'Coordinator',
    description: 'Event management access',
    permissions: ['manage_events', 'view_users'],
  },
  {
    id: 3,
    name: 'Volunteer',
    description: 'Basic access',
    permissions: ['view_events'],
  },
];

const availablePermissions = [
  'manage_users',
  'manage_roles',
  'manage_events',
  'view_users',
  'view_events',
  'manage_volunteers',
  'manage_locations',
  'manage_assets',
];

export default function ManageRoles() {
  const [roles, setRoles] = React.useState(defaultRoles);
  const [open, setOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleSubmit = () => {
    // TODO: Implement role creation logic
    handleClose();
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'manage_users':
      case 'manage_roles':
        return 'error';
      case 'manage_events':
      case 'manage_volunteers':
        return 'primary';
      case 'view_users':
      case 'view_events':
        return 'success';
      case 'manage_locations':
      case 'manage_assets':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
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
          Add Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="div" gutterBottom>
                    {role.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit role logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {role.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {role.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace('_', ' ')}
                      size="small"
                      color={getPermissionColor(permission)}
                      sx={{ mr: 1, mb: 1, textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          Add New Role
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
          />
          <Autocomplete
            multiple
            options={availablePermissions}
            value={newRole.permissions}
            onChange={(event, newValue) => {
              setNewRole({ ...newRole, permissions: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Permissions"
                margin="dense"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option.replace('_', ' ')}
                  size="small"
                  color={getPermissionColor(option)}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const defaultRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access',
    permissions: ['manage_users', 'manage_roles', 'manage_events'],
  },
  {
    id: 2,
    name: 'Coordinator',
    description: 'Event management access',
    permissions: ['manage_events', 'view_users'],
  },
  {
    id: 3,
    name: 'Volunteer',
    description: 'Basic access',
    permissions: ['view_events'],
  },
];

const availablePermissions = [
  'manage_users',
  'manage_roles',
  'manage_events',
  'view_users',
  'view_events',
  'manage_volunteers',
  'manage_locations',
  'manage_assets',
];

export default function ManageRoles() {
  const [roles, setRoles] = React.useState(defaultRoles);
  const [open, setOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleSubmit = () => {
    // TODO: Implement role creation logic
    handleClose();
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'manage_users':
      case 'manage_roles':
        return 'error';
      case 'manage_events':
      case 'manage_volunteers':
        return 'primary';
      case 'view_users':
      case 'view_events':
        return 'success';
      case 'manage_locations':
      case 'manage_assets':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
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
          Add Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="div" gutterBottom>
                    {role.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit role logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {role.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {role.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace('_', ' ')}
                      size="small"
                      color={getPermissionColor(permission)}
                      sx={{ mr: 1, mb: 1, textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          Add New Role
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
          />
          <Autocomplete
            multiple
            options={availablePermissions}
            value={newRole.permissions}
            onChange={(event, newValue) => {
              setNewRole({ ...newRole, permissions: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Permissions"
                margin="dense"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option.replace('_', ' ')}
                  size="small"
                  color={getPermissionColor(option)}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const defaultRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access',
    permissions: ['manage_users', 'manage_roles', 'manage_events'],
  },
  {
    id: 2,
    name: 'Coordinator',
    description: 'Event management access',
    permissions: ['manage_events', 'view_users'],
  },
  {
    id: 3,
    name: 'Volunteer',
    description: 'Basic access',
    permissions: ['view_events'],
  },
];

const availablePermissions = [
  'manage_users',
  'manage_roles',
  'manage_events',
  'view_users',
  'view_events',
  'manage_volunteers',
  'manage_locations',
  'manage_assets',
];

export default function ManageRoles() {
  const [roles, setRoles] = React.useState(defaultRoles);
  const [open, setOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleSubmit = () => {
    // TODO: Implement role creation logic
    handleClose();
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'manage_users':
      case 'manage_roles':
        return 'error';
      case 'manage_events':
      case 'manage_volunteers':
        return 'primary';
      case 'view_users':
      case 'view_events':
        return 'success';
      case 'manage_locations':
      case 'manage_assets':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
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
          Add Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="div" gutterBottom>
                    {role.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit role logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {role.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {role.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace('_', ' ')}
                      size="small"
                      color={getPermissionColor(permission)}
                      sx={{ mr: 1, mb: 1, textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          Add New Role
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
          />
          <Autocomplete
            multiple
            options={availablePermissions}
            value={newRole.permissions}
            onChange={(event, newValue) => {
              setNewRole({ ...newRole, permissions: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Permissions"
                margin="dense"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option.replace('_', ' ')}
                  size="small"
                  color={getPermissionColor(option)}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 