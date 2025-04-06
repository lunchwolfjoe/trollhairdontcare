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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  start_time: string;
  end_time: string;
  created_at: string;
}

interface TaskCategory {
  id: string;
  name: string;
  description: string;
}

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
}

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Set up main stage',
    description: 'Coordinate setup of the main performance area including sound check and lighting',
    category: 'setup',
    priority: 'high',
    status: 'pending',
    start_time: new Date(Date.now() + 3600000).toISOString(),
    end_time: new Date(Date.now() + 7200000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Manage food vendors',
    description: 'Check in with all food vendors and ensure they have everything they need',
    category: 'management',
    priority: 'medium',
    status: 'in_progress',
    start_time: new Date(Date.now() + 10800000).toISOString(),
    end_time: new Date(Date.now() + 18000000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Organize volunteer shifts',
    description: 'Review all volunteer schedules and make adjustments as needed',
    category: 'planning',
    priority: 'high',
    status: 'completed',
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() - 82800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

const mockCategories: TaskCategory[] = [
  { id: '1', name: 'setup', description: 'Setting up equipment and areas' },
  { id: '2', name: 'management', description: 'Managing people and resources' },
  { id: '3', name: 'planning', description: 'Planning future activities' },
  { id: '4', name: 'cleanup', description: 'Cleaning and restoring areas' }
];

const mockVolunteers: Volunteer[] = [
  { id: '1', full_name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', full_name: 'Bob Smith', email: 'bob@example.com' },
  { id: '3', full_name: 'Charlie Davis', email: 'charlie@example.com' }
];

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [categories, setCategories] = useState<TaskCategory[]>(mockCategories);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    // For development, we're using mock data
    // Skip actual database calls
  }, []);

  const fetchTasks = async () => {
    // Using mock data for development
  };

  const fetchCategories = async () => {
    // Using mock data for development
  };

  const fetchVolunteers = async () => {
    // Using mock data for development
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        start_time: task.start_time,
        end_time: task.end_time,
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        start_time: '',
        end_time: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      start_time: '',
      end_time: '',
    });
  };

  const handleOpenAssignDialog = (task: Task) => {
    setSelectedTask(task);
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedTask(null);
  };

  const handleSubmit = async () => {
    // For development, update the local state
    if (selectedTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === selectedTask.id ? { ...task, ...formData } : task
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
    handleCloseDialog();
  };

  const handleDelete = async (taskId: string) => {
    // For development, update the local state
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleAssign = async (volunteerId: string) => {
    // For development, just close the dialog
    handleCloseAssignDialog();
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Task Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Task
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Paper sx={{ p: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Category: {task.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Priority: {task.priority}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {task.status}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpenDialog(task)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign">
                      <IconButton color="secondary" onClick={() => handleOpenAssignDialog(task)}>
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedTask && (
              <Typography variant="subtitle1" gutterBottom>
                Task: {selectedTask.title}
              </Typography>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Volunteer</InputLabel>
              <Select
                label="Volunteer"
                defaultValue=""
              >
                {volunteers.map((volunteer) => (
                  <MenuItem key={volunteer.id} value={volunteer.id} onClick={() => handleAssign(volunteer.id)}>
                    {volunteer.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement; 