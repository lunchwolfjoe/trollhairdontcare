import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Container,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';

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
  festival_id: string;
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
    festival_id: '1',
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
    festival_id: '1',
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
    festival_id: '1',
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

export const TaskManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [categories, setCategories] = useState<TaskCategory[]>(mockCategories);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [loading, setLoading] = useState(true);
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
    festival_id: '',
  });
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found. Please create a festival first.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // If festivalId is in URL, use that, otherwise use the first festival
        const targetFestivalId = festivalId || data[0].id;
        const festival = data.find(f => f.id === targetFestivalId);
        
        if (festival) {
          setCurrentFestival(festival);
          
          // Once we have the festival, fetch tasks for it
          fetchTasksForFestival(festival.id);
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);

  const fetchTasksForFestival = async (festivalId: string) => {
    console.log(`Fetching tasks for festival: ${festivalId}`);
    setLoading(true);
    setError(null);
    
    try {
      // First try to check if the tasks table exists
      console.log('Checking if tasks table exists...');
      const { error: checkError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      console.log('Check tasks table result:', checkError ? `Error: ${checkError.message}` : 'Table exists');
      
      // If tasks table doesn't exist, use mock data
      if (checkError && checkError.message.includes('relation "public.tasks" does not exist')) {
        console.log('Tasks table not found, using mock data');
        
        // Filter mock tasks by festival ID
        const filteredTasks = mockTasks.filter(task => task.festival_id === festivalId);
        console.log(`Found ${filteredTasks.length} mock tasks for festival ${festivalId}`);
        setTasks(filteredTasks);
        
        // Use mock categories
        setCategories(mockCategories);
        
        // Fetch volunteers (this should work)
        const { data: volunteersData, error: volunteersError } = await supabase
          .from('volunteers')
          .select(`
            id,
            profiles:profile_id (
              id,
              full_name,
              email
            )
          `)
          .eq('festival_id', festivalId)
          .eq('application_status', 'approved');
        
        if (volunteersError) {
          console.error('Failed to fetch volunteers:', volunteersError);
          // Still use mock volunteers to avoid breaking the UI
          setVolunteers(mockVolunteers);
        } else {
          // Process volunteers data to match the expected format
          const processedVolunteers = volunteersData.map(volunteer => ({
            id: volunteer.id,
            full_name: volunteer.profiles?.full_name || 'Unknown',
            email: volunteer.profiles?.email || ''
          }));
          
          setVolunteers(processedVolunteers);
        }
        
        setLoading(false);
        return;
      }
      
      // If we get here, the tasks table exists, so proceed with real data
      console.log('Fetching tasks from database...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          category,
          priority,
          status,
          start_time,
          end_time,
          created_at,
          festival_id
        `)
        .eq('festival_id', festivalId);
      
      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }
      
      console.log(`Found ${tasksData?.length || 0} tasks in database for festival ${festivalId}:`, tasksData);
      setTasks(tasksData || []);
      
      // Try to fetch categories, but use mock data if there's an issue
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('task_categories')
          .select('*')
          .eq('festival_id', festivalId);
        
        if (categoriesError) {
          console.error('Failed to fetch categories:', categoriesError);
          setCategories(mockCategories);
        } else {
          console.log(`Found ${categoriesData?.length || 0} categories in database`);
          setCategories(categoriesData || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(mockCategories);
      }
      
      // Fetch volunteers
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select(`
          id,
          profiles:profile_id (
            id,
            full_name,
            email
          )
        `)
        .eq('festival_id', festivalId)
        .eq('application_status', 'approved');
      
      if (volunteersError) {
        console.error('Failed to fetch volunteers:', volunteersError);
        setVolunteers(mockVolunteers);
      } else {
        // Process volunteers data to match the expected format
        const processedVolunteers = volunteersData.map(volunteer => ({
          id: volunteer.id,
          full_name: volunteer.profiles?.full_name || 'Unknown',
          email: volunteer.profiles?.email || ''
        }));
        
        console.log(`Found ${processedVolunteers.length} volunteers`);
        setVolunteers(processedVolunteers);
      }
      
    } catch (err: any) {
      console.error('Error fetching tasks data:', err);
      setError(err.message);
      
      // Fallback to mock data
      const filteredTasks = mockTasks.filter(task => task.festival_id === festivalId);
      console.log(`Falling back to ${filteredTasks.length} mock tasks`);
      setTasks(filteredTasks);
      setCategories(mockCategories);
      setVolunteers(mockVolunteers);
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchTasksForFestival(festival.id);
    }
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
        festival_id: task.festival_id,
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
        festival_id: '',
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
      festival_id: '',
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
    console.log('handleSubmit called with formData:', formData);
    
    // Validate form data first
    if (!formData.title) {
      alert('Please enter a title for the task');
      return;
    }
    
    // Set default festival ID if not provided but currentFestival exists
    if (!formData.festival_id && currentFestival) {
      console.log('Setting default festival_id from currentFestival:', currentFestival.id);
      formData.festival_id = currentFestival.id;
    }
    
    if (!formData.festival_id) {
      alert('Please select a festival for this task');
      return;
    }
    
    console.log('Creating/updating task with festival_id:', formData.festival_id);
    
    try {
      setLoading(true);
      
      // First try to use the actual Supabase API
      if (selectedTask) {
        console.log('Updating existing task with ID:', selectedTask.id);
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            start_time: formData.start_time,
            end_time: formData.end_time,
            festival_id: formData.festival_id
          })
          .eq('id', selectedTask.id);
        
        console.log('Update result:', error ? `Error: ${error.message}` : 'Success');
        
        if (error) {
          if (error.message.includes('relation "public.tasks" does not exist')) {
            console.log('Tasks table not found, using mock data instead');
            // Fall back to mock data approach
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === selectedTask.id ? { ...task, ...formData } : task
              )
            );
            console.log('Updated task in local state');
          } else {
            throw error;
          }
        } else {
          console.log('Task updated successfully in Supabase');
          // Refresh tasks after update
          await fetchTasksForFestival(formData.festival_id);
        }
      } else {
        console.log('Creating new task');
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            start_time: formData.start_time,
            end_time: formData.end_time,
            festival_id: formData.festival_id,
            status: 'pending',
            created_at: new Date().toISOString()
          }])
          .select();
        
        console.log('Insert result:', error ? `Error: ${error.message}` : `Success, inserted task:`, data);
        
        if (error) {
          if (error.message.includes('relation "public.tasks" does not exist')) {
            console.log('Tasks table not found, using mock data instead');
            // Fall back to mock data approach
            const newTask: Task = {
              id: Date.now().toString(),
              ...formData,
              status: 'pending',
              created_at: new Date().toISOString(),
              festival_id: formData.festival_id,
            };
            setTasks(prevTasks => [newTask, ...prevTasks]);
            console.log('Added new task to local state:', newTask);
          } else {
            throw error;
          }
        } else {
          console.log('Task created successfully in Supabase');
          // Refresh tasks after creation
          await fetchTasksForFestival(formData.festival_id);
        }
      }
    } catch (err: any) {
      console.error('Error saving task:', err);
      setError(err.message || 'Failed to save task');
      alert(`Error saving task: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
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
  if (error) return <Alert severity="error">{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Task Management
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {availableFestivals.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={currentFestival?.id || ''}
                  label="Festival"
                  onChange={(e) => handleFestivalChange(e.target.value)}
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Task
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
        )}

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
                  value={formData.start_time ? new Date(formData.start_time).toISOString().substring(0, 16) : ''}
                  onChange={(e) => {
                    console.log('Start time changed to:', e.target.value);
                    const dateValue = e.target.value ? new Date(e.target.value).toISOString() : '';
                    setFormData({ ...formData, start_time: dateValue });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_time ? new Date(formData.end_time).toISOString().substring(0, 16) : ''}
                  onChange={(e) => {
                    console.log('End time changed to:', e.target.value);
                    const dateValue = e.target.value ? new Date(e.target.value).toISOString() : '';
                    setFormData({ ...formData, end_time: dateValue });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Festival</InputLabel>
                  <Select
                    value={formData.festival_id}
                    label="Festival"
                    onChange={(e) => setFormData({ ...formData, festival_id: e.target.value })}
                  >
                    {availableFestivals.map((festival) => (
                      <MenuItem key={festival.id} value={festival.id}>
                        {festival.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={() => {
                console.log('Create/Update button clicked');
                handleSubmit();
              }} 
              variant="contained" 
              color="primary"
              disabled={!formData.title}
            >
              {selectedTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
          
          {/* Debugging info - only shown in development mode */}
          {import.meta.env.DEV && (
            <Box sx={{ p: 2, borderTop: '1px solid #eee', fontSize: '12px' }}>
              <details>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify({
                  formData,
                  selectedTask,
                  availableFestivals: availableFestivals.map(f => ({ id: f.id, name: f.name })),
                  currentFestival: currentFestival ? { id: currentFestival.id, name: currentFestival.name } : null,
                  tasksCount: tasks.length,
                }, null, 2)}</pre>
              </details>
            </Box>
          )}
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
    </Container>
  );
}; 
