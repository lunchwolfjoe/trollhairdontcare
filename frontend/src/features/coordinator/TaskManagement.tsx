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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Alert,
  Autocomplete,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  category_id: string;
  location: string;
  start_time: string;
  end_time: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  required_skills: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  skills: string[];
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    location: '',
    start_time: '',
    end_time: '',
    priority: 'medium',
    required_skills: [] as string[],
  });

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchVolunteers();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;
      setVolunteers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    }
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        category_id: task.category_id,
        location: task.location,
        start_time: task.start_time,
        end_time: task.end_time,
        priority: task.priority,
        required_skills: task.required_skills,
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        category_id: '',
        location: '',
        start_time: '',
        end_time: '',
        priority: 'medium',
        required_skills: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };

  const handleOpenAssignment = (task: Task) => {
    setSelectedTask(task);
    setOpenAssignment(true);
  };

  const handleCloseAssignment = () => {
    setOpenAssignment(false);
    setSelectedTask(null);
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (selectedTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([
            {
              ...formData,
              created_by: user.id,
              status: 'pending',
            },
          ]);

        if (error) throw error;
      }

      fetchTasks();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleAssign = async (volunteerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedTask) throw new Error('Invalid user or task');

      const { error } = await supabase
        .from('task_assignments')
        .insert([
          {
            task_id: selectedTask.id,
            volunteer_id: volunteerId,
            assigned_by: user.id,
            status: 'assigned',
          },
        ]);

      if (error) throw error;
      handleCloseAssignment();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'category_id',
      headerName: 'Category',
      flex: 1,
      renderCell: (params) => {
        const category = categories.find((c) => c.id === params.value);
        return category ? (
          <Chip
            label={category.name}
            size="small"
            sx={{ backgroundColor: category.color, color: 'white' }}
          />
        ) : null;
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'urgent'
              ? 'error'
              : params.value === 'high'
              ? 'warning'
              : params.value === 'medium'
              ? 'info'
              : 'success'
          }
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'completed'
              ? 'success'
              : params.value === 'in_progress'
              ? 'info'
              : params.value === 'cancelled'
              ? 'error'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'start_time',
      headerName: 'Start Time',
      flex: 1,
      valueFormatter: (params) =>
        params.value ? format(parseISO(params.value), 'PPp') : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleOpenAssignment(params.row)}
            size="small"
          >
            <AssignmentIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          loading={loading}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                value={formData.required_skills}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, required_skills: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Required Skills"
                    placeholder="Add skills"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAssignment}
        onClose={handleCloseAssignment}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle1">
              Task: {selectedTask?.title}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Volunteer</InputLabel>
              <Select
                label="Volunteer"
                onChange={(e) => handleAssign(e.target.value)}
              >
                {volunteers.map((volunteer) => (
                  <MenuItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.first_name} {volunteer.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignment}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement; 