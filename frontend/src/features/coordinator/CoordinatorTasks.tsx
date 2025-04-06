import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'assigned' | 'in_progress' | 'completed';
  assigned_to: string | null;
  created_at: string;
  due_date: string;
  required_skills: string[];
  location: string;
  start_time: string;
  end_time: string;
}

interface Volunteer {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
}

const CoordinatorTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    due_date: '',
    required_skills: '',
    location: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchVolunteers();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    }
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        ...task,
        required_skills: task.required_skills.join(', '),
        assigned_to: task.assigned_to || '',
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        due_date: '',
        required_skills: '',
        location: '',
        start_time: '',
        end_time: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };

  const handleSubmit = async () => {
    try {
      const processedData = {
        ...formData,
        required_skills: formData.required_skills.split(',').map(skill => skill.trim()),
        assigned_to: formData.assigned_to || null,
      };

      if (selectedTask) {
        const { error } = await supabase
          .from('tasks')
          .update(processedData)
          .eq('id', selectedTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([processedData]);

        if (error) throw error;
      }

      fetchTasks();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'high'
              ? 'error'
              : params.value === 'medium'
              ? 'warning'
              : 'success'
          }
          size="small"
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
          color={
            params.value === 'completed'
              ? 'success'
              : params.value === 'in_progress'
              ? 'warning'
              : params.value === 'assigned'
              ? 'info'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'assigned_to',
      headerName: 'Assigned To',
      flex: 1,
      renderCell: (params) => {
        const volunteer = volunteers.find(v => v.id === params.value);
        return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'Unassigned';
      },
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Task Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <DataGrid
          rows={filteredTasks}
          columns={columns}
          loading={loading}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
        />

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
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
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={formData.assigned_to}
                    label="Assigned To"
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {volunteers.map((volunteer) => (
                      <MenuItem key={volunteer.id} value={volunteer.id}>
                        {volunteer.first_name} {volunteer.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Required Skills"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  helperText="Enter skills separated by commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CoordinatorTasks; 