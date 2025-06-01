import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Switch,
  Chip,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { festivalService } from '../../lib/services';
import { Festival, Task, TaskCategory, Volunteer, Profile, Crew } from '../../lib/types/models';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle as CheckCircleIcon, Person as PersonIcon, Group as GroupIcon } from '@mui/icons-material';
import { useSorting } from '../../hooks/useSorting';
import { usePagination } from '../../hooks/usePagination';
import { Database } from '../../lib/types/supabase';

// Interface combining Volunteer and Profile
interface VolunteerOption extends Volunteer {
  profiles?: Profile | null;
  // Add crew_name if needed after joining
  crew_name?: string;
}

// Add crew_name to Task interface if needed for display, but note it's not in DB table
interface UITask extends Task {
  assignee_name?: string;
  // crew_id?: string | null;
  // crew_name?: string;
  completed_at?: string | null;
  completed_by?: string | null;
}

export const TaskManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UITask | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [formData, setFormData] = useState<Partial<UITask>>({});
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const { user } = useAuth();

  const taskSorting = useSorting<UITask>('created_at', 'desc');
  const taskPagination = usePagination();

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
        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select(`
              *,
              assignee: volunteers!assignee_id ( id, profiles!inner(id, full_name) ),
              creator: profiles!creator_id ( id, full_name )
            `)
            .eq('festival_id', festivalId);

        if (tasksError) throw tasksError;
        
        const uiTasks = tasksData?.map((task: any) => ({
          ...task,
          assignee_name: task.assignee?.profiles?.full_name,
          // Remove crew_name mapping if crew_id isn't on task
          // crew_name: crews.find(c => c.id === task.crew_id)?.name,
        })) || [];
        setTasks(uiTasks as UITask[]);

    } catch (err: any) {
        console.error('Error fetching tasks data:', err);
        setError(err.message);
        // Don't fallback to mock data
    } finally {
        setLoading(false);
    }
  };

  const fetchCategories = useCallback(async (currentFestivalId: string) => {
    if (!currentFestivalId) return;
    try {
       const { data: categoriesData, error } = await supabase
         .from('task_categories') 
         .select('*')
         .eq('festival_id', currentFestivalId);
       if (error) throw error;
       setCategories((categoriesData as TaskCategory[]) || []); 
    } catch (err: any) {
       console.error("Error fetching categories:", err);
       setCategories([]); // Set empty array on error
    }
  }, []);
  
  const fetchVolunteersForFestival = useCallback(async (currentFestivalId: string) => {
    if (!currentFestivalId) return;
    try {
        // Fetch volunteers AND their crew assignment via crew_members
        const { data: volunteersData, error: volunteersError } = await supabase
            .from('volunteers')
            .select(`
                *,
                profiles!inner(*),
                crew_members!inner( crew_id )
            `)
            .eq('festival_id', currentFestivalId)
            .eq('application_status', 'approved');
            
        if (volunteersError) throw volunteersError;
        
        const volunteerOptions: VolunteerOption[] = volunteersData?.map((v: any) => ({
            ...(v as Volunteer),
            profiles: v.profiles as Profile,
            // Do not map crew_id/name here, it comes from the separate crew state
            // crew_id: v.crew_members?.[0]?.crew_id, 
            // crew_name: crews.find(c => c.id === v.crew_members?.[0]?.crew_id)?.name
        })) || [];
        setVolunteers(volunteerOptions);
    } catch (err: any) {
        console.error("Error fetching volunteers:", err);
        setVolunteers([]); // Set empty array on error
    }
  }, [crews]);

  const fetchCrewsForFestival = useCallback(async (currentFestivalId: string) => {
    if (!currentFestivalId) return;
    try {
      // ... implementation ...
      setCrews(data || []);
    } catch (err) {
      console.error("Error fetching crews:", err);
      setCrews([]); // Set empty array on error
    }
  }, []);

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchTasksForFestival(festival.id);
    }
  };

  const handleOpenDialog = (task?: UITask) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        start_time: task.start_time,
        end_time: task.end_time,
        due_date: task.due_date,
        festival_id: task.festival_id,
        assignee_id: task.assignee_id,
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'pending',
        start_time: '',
        end_time: '',
        due_date: '',
        festival_id: currentFestival?.id || '',
        assignee_id: '',
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
      status: 'pending',
      start_time: '',
      end_time: '',
      due_date: '',
      festival_id: '',
      assignee_id: '',
    });
  };

  const handleOpenAssignDialog = (task: UITask) => {
    setSelectedTask(task);
    setSelectedAssignee(task.assignee_id || '');
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
      
      // Get assignee name if assignee_id is provided
      let assigneeName = '';
      let crewName = '';
      
      if (formData.assignee_id) {
        const assignee = volunteers.find(v => v.id === formData.assignee_id);
        assigneeName = assignee?.full_name || '';
        
        // If no crew_id is specified but assignee has a crew, use that
        if (!formData.crew_id && assignee?.crew_id) {
          formData.crew_id = assignee.crew_id;
          crewName = assignee.crew_name || '';
        }
      }
      
      if (formData.crew_id && !crewName) {
        const crew = crews.find(c => c.id === formData.crew_id);
        crewName = crew?.name || '';
      }
      
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
            festival_id: formData.festival_id,
            assignee_id: formData.assignee_id || null,
            assignee_name: assigneeName || null,
            crew_id: formData.crew_id || null,
            crew_name: crewName || null,
          })
          .eq('id', selectedTask.id);
        
        console.log('Update result:', error ? `Error: ${error.message}` : 'Success');
        
        if (error) {
          throw error;
        } else {
          console.log('Task updated successfully in Supabase');
          // Refresh tasks after update
          await fetchTasksForFestival(formData.festival_id);
        }
      } else {
        console.log('Creating new task');
        
        // Get current user info for created_by
        const currentUser = user?.id || 'unknown';
        
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
            assignee_id: formData.assignee_id || null,
            assignee_name: assigneeName || null,
            crew_id: formData.crew_id || null,
            crew_name: crewName || null,
            status: 'pending',
            created_at: new Date().toISOString(),
            created_by: currentUser,
          }])
          .select();
        
        console.log('Insert result:', error ? `Error: ${error.message}` : `Success, inserted task:`, data);
        
        if (error) {
          throw error;
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
    // Remove mock data fallback
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    // Add actual delete call to Supabase
    try {
        setLoading(true);
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw error;
        // Optionally re-fetch tasks or rely on local state update
    } catch (err: any) {
        setError('Failed to delete task: ' + err.message);
        console.error('Error deleting task:', err);
        // Consider reverting local state if DB delete fails
    } finally {
        setLoading(false);
    }
  };

  const handleAssign = async (volunteerId: string) => {
    if (!selectedTask) return;
    
    setLoading(true);
    try {
      const assignee = volunteers.find(v => v.id === volunteerId);
      
      // Update the task with the new assignee
      const { error } = await supabase
        .from('tasks')
        .update({
          assignee_id: volunteerId,
          assignee_name: assignee?.full_name || '',
          crew_id: assignee?.crew_id || selectedTask.crew_id,
          crew_name: assignee?.crew_name || selectedTask.crew_name,
        })
        .eq('id', selectedTask.id);
      
      if (error) {
        throw error;
      } else {
        // Refresh tasks after update
        if (currentFestival) {
          await fetchTasksForFestival(currentFestival.id);
        }
      }
    } catch (err: any) {
      console.error('Error assigning task:', err);
      setError(err.message || 'Failed to assign task');
    } finally {
      setLoading(false);
      handleCloseAssignDialog();
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Update the task status
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id || 'unknown',
        })
        .eq('id', taskId);
      
      if (error) {
        throw error;
      } else {
        // Refresh tasks after update
        if (currentFestival) {
          await fetchTasksForFestival(currentFestival.id);
        }
      }
    } catch (err: any) {
      console.error('Error marking task as completed:', err);
      setError(err.message || 'Failed to mark task as completed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>, field: keyof UITask) => {
    if (field === 'crew_id') {
       console.warn("Attempting to set crew_id directly on task form data.");
       // Decide how to handle this - perhaps set a different state?
       // For now, let's prevent setting it directly on Task formData if it's not a direct field
       return; 
    }
    const value = (e.target as HTMLInputElement).value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAssigneeChange = (event: any, newValue: VolunteerOption | null) => {
    setFormData(prev => ({
      ...prev,
      assignee_id: newValue ? newValue.id : undefined,
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>;

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
            <FormControlLabel
              control={
                <Switch
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                />
              }
              label="Show Completed"
            />
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
            {tasks
              .filter(task => showCompleted || task.status !== 'completed') // Filter out completed tasks if not showing
              .map((task) => (
                <Grid item xs={12} key={task.id}>
                  <Paper sx={{ 
                    p: 2,
                    borderLeft: 6,
                    borderColor: task.priority === 'high' 
                      ? 'error.main' 
                      : task.priority === 'medium' 
                        ? 'warning.main' 
                        : 'success.main',
                    opacity: task.status === 'completed' ? 0.7 : 1,
                  }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" sx={{
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </Typography>
                          {task.status === 'completed' && (
                            <Chip 
                              label="Completed" 
                              color="success" 
                              size="small"
                              icon={<CheckCircleIcon />} 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                        
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          <Chip 
                            label={`Priority: ${task.priority}`} 
                            size="small"
                            color={task.priority === 'high' 
                              ? 'error' 
                              : task.priority === 'medium' 
                                ? 'warning' 
                                : 'success'} 
                          />
                          <Chip 
                            label={`Status: ${task.status}`} 
                            size="small"
                            color={task.status === 'completed' 
                              ? 'success' 
                              : task.status === 'in_progress' 
                                ? 'info' 
                                : 'default'} 
                          />
                          {task.category && (
                            <Chip label={`Category: ${task.category}`} size="small" />
                          )}
                        </Box>
                        
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          {task.assignee_name && (
                            <Chip 
                              icon={<PersonIcon />}
                              label={`Assigned to: ${task.assignee_name}`} 
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {task.crew_name && (
                            <Chip 
                              icon={<GroupIcon />}
                              label={`Crew: ${task.crew_name}`} 
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        {task.completed_at && task.completed_by && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Completed on {new Date(task.completed_at).toLocaleString()} by {task.completed_by}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          {task.status !== 'completed' && (
                            <Tooltip title="Mark as Complete">
                              <IconButton color="success" onClick={() => handleMarkComplete(task.id)}>
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
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
            
            {tasks.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No tasks found for this festival. Create a new task to get started.
                </Alert>
              </Grid>
            )}
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
                  onChange={(e) => handleFormChange(e, 'title')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange(e, 'description')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => handleFormChange(e, 'category')}
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
                    onChange={(e) => handleFormChange(e, 'priority')}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Autocomplete
                    options={volunteers}
                    getOptionLabel={(option) => option.profiles?.full_name || 'Unknown'}
                    value={volunteers.find(v => v.id === formData.assignee_id) || null}
                    onChange={handleAssigneeChange}
                    renderInput={(params) => <TextField {...params} label="Assignee" margin="normal" fullWidth />}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Crew</InputLabel>
                  <Select
                    value={formData.crew_id || ''}
                    label="Crew"
                    onChange={(e) => handleFormChange(e as SelectChangeEvent<string>, 'crew_id' as keyof UITask)}
                  >
                    <MenuItem value="">No Crew</MenuItem>
                    {crews.map((crew) => (
                      <MenuItem key={crew.id} value={crew.id}>
                        {crew.name}
                      </MenuItem>
                    ))}
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
                    handleFormChange(e, 'start_time');
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
                    handleFormChange(e, 'end_time');
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Festival</InputLabel>
                  <Select
                    value={formData.festival_id}
                    label="Festival"
                    onChange={(e) => handleFormChange(e, 'festival_id')}
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
        </Dialog>

        {/* Assign Task Dialog */}
        <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {selectedTask && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedTask.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedTask.description}
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Assign To</InputLabel>
                    <Autocomplete
                      options={volunteers}
                      getOptionLabel={(option) => option.profiles?.full_name || 'Unknown'}
                      value={volunteers.find(v => v.id === selectedAssignee) || null}
                      onChange={(event, newValue) => setSelectedAssignee(newValue?.id || '')}
                      renderInput={(params) => <TextField {...params} label="Assign To" margin="normal" fullWidth />}
                    />
                  </FormControl>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog}>Cancel</Button>
            <Button onClick={() => handleAssign(selectedAssignee)} color="primary" variant="contained">
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}; 
