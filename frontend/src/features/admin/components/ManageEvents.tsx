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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/useAppDispatch';
import { selectFestivals } from '../../../store/slices/adminSlice';

export default function ManageEvents() {
  const festivals = useAppSelector(selectFestivals);
  const [open, setOpen] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'draft',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEvent({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      status: 'draft',
    });
  };

  const handleSubmit = () => {
    // TODO: Implement event creation logic
    handleClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'published':
        return 'success';
      case 'completed':
        return 'info';
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
          Add Festival
        </Button>
      </Box>

      <Grid container spacing={3}>
        {festivals.map((festival) => (
          <Grid item xs={12} md={4} key={festival.id}>
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
                  <Typography variant="h6" component="div">
                    {festival.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Festival">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit festival logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Festival">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Chip
                  label={festival.status}
                  color={getStatusColor(festival.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 1,
                    }}
                  >
                    <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{festival.location}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(festival.startDate).toLocaleDateString()} -{' '}
                      {new Date(festival.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
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
          Add New Festival
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Festival Name"
            fullWidth
            variant="outlined"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.startDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="End Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.endDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endDate: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newEvent.status}
              label="Status"
              onChange={(e) =>
                setNewEvent({ ...newEvent, status: e.target.value })
              }
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
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
            Add Festival
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/useAppDispatch';
import { selectFestivals } from '../../../store/slices/adminSlice';

export default function ManageEvents() {
  const festivals = useAppSelector(selectFestivals);
  const [open, setOpen] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'draft',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEvent({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      status: 'draft',
    });
  };

  const handleSubmit = () => {
    // TODO: Implement event creation logic
    handleClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'published':
        return 'success';
      case 'completed':
        return 'info';
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
          Add Festival
        </Button>
      </Box>

      <Grid container spacing={3}>
        {festivals.map((festival) => (
          <Grid item xs={12} md={4} key={festival.id}>
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
                  <Typography variant="h6" component="div">
                    {festival.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Festival">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit festival logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Festival">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Chip
                  label={festival.status}
                  color={getStatusColor(festival.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 1,
                    }}
                  >
                    <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{festival.location}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(festival.startDate).toLocaleDateString()} -{' '}
                      {new Date(festival.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
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
          Add New Festival
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Festival Name"
            fullWidth
            variant="outlined"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.startDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="End Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.endDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endDate: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newEvent.status}
              label="Status"
              onChange={(e) =>
                setNewEvent({ ...newEvent, status: e.target.value })
              }
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
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
            Add Festival
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/useAppDispatch';
import { selectFestivals } from '../../../store/slices/adminSlice';

export default function ManageEvents() {
  const festivals = useAppSelector(selectFestivals);
  const [open, setOpen] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'draft',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEvent({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      status: 'draft',
    });
  };

  const handleSubmit = () => {
    // TODO: Implement event creation logic
    handleClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'published':
        return 'success';
      case 'completed':
        return 'info';
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
          Add Festival
        </Button>
      </Box>

      <Grid container spacing={3}>
        {festivals.map((festival) => (
          <Grid item xs={12} md={4} key={festival.id}>
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
                  <Typography variant="h6" component="div">
                    {festival.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Festival">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement edit festival logic
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Festival">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Chip
                  label={festival.status}
                  color={getStatusColor(festival.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 1,
                    }}
                  >
                    <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{festival.location}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(festival.startDate).toLocaleDateString()} -{' '}
                      {new Date(festival.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
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
          Add New Festival
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Festival Name"
            fullWidth
            variant="outlined"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.startDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="End Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEvent.endDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endDate: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newEvent.status}
              label="Status"
              onChange={(e) =>
                setNewEvent({ ...newEvent, status: e.target.value })
              }
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
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
            Add Festival
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 