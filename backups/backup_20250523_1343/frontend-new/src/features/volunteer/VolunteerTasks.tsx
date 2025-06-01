import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
}

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
  assignee_id?: string;
  assignee_name?: string;
  crew_id?: string;
  crew_name?: string;
  created_by?: string;
  completed_at?: string;
  completed_by?: string;
}

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Check-in Volunteers',
    description: 'Welcome volunteers and provide them with badges and information packets',
    category: 'management',
    priority: 'high',
    status: 'pending',
    start_time: new Date(Date.now() + 3600000).toISOString(),
    end_time: new Date(Date.now() + 7200000).toISOString(),
    created_at: new Date().toISOString(),
    festival_id: '1',
    crew_id: '1',
    crew_name: 'Registration Team',
  },
  {
    id: '2',
    title: 'Setup Information Booth',
    description: 'Arrange tables, chairs, and promotional materials at the information booth',
    category: 'setup',
    priority: 'medium',
    status: 'in_progress',
    start_time: new Date(Date.now() + 10800000).toISOString(),
    end_time: new Date(Date.now() + 18000000).toISOString(),
    created_at: new Date().toISOString(),
    festival_id: '1',
    crew_id: '2',
    crew_name: 'Information Services',
  },
  {
    id: '3',
    title: 'Distribute T-shirts',
    description: 'Hand out t-shirts to participants at the registration area',
    category: 'distribution',
    priority: 'low',
    status: 'completed',
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() - 82800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    festival_id: '1',
    crew_id: '1',
    crew_name: 'Registration Team',
    completed_at: new Date(Date.now() - 83000000).toISOString(),
  }
];

export const VolunteerTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tasks assigned to the current volunteer
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching tasks for user:', user.id);
        
        // Check if tasks table exists
        const { error: checkError } = await supabase
          .from('tasks')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        // If tasks table doesn't exist or there's an error, use mock data
        if (checkError) {
          console.log('Using mock data for tasks');
          // Set the assignee_id to match the current user
          const modifiedMockTasks = mockTasks.map(task => ({
            ...task,
            assignee_id: user.id,
            assignee_name: user.full_name || 'You',
          }));
          setTasks(modifiedMockTasks);
          setLoading(false);
          return;
        }
        
        // Get volunteer profile for the current user
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteers')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle();
        
        if (volunteerError) {
          console.error(`Failed to fetch volunteer profile: ${volunteerError.message}`);
          // Continue with mock tasks using the user's ID
          const modifiedMockTasks = mockTasks.map(task => ({
            ...task,
            assignee_id: user.id,
            assignee_name: user.full_name || 'You',
          }));
          setTasks(modifiedMockTasks);
          setLoading(false);
          return;
        }
        
        if (!volunteerData) {
          setError('No volunteer profile found. Please contact an administrator.');
          setLoading(false);
          return;
        }
        
        const volunteerId = volunteerData.id;
        
        // Fetch tasks assigned to this volunteer
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee_id', volunteerId);
        
        if (tasksError) {
          throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
        }
        
        setTasks(tasksData || []);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to fetch tasks');
        
        // Fallback to mock data
        const modifiedMockTasks = mockTasks.map(task => ({
          ...task,
          assignee_id: user.id,
          assignee_name: user.full_name || 'You',
        }));
        setTasks(modifiedMockTasks);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAcceptTask = async (taskId: string) => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setLoading(true);
    
    try {
      // Update the task status
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
        })
        .eq('id', taskId);
      
      if (error) {
        // Fallback to local state update
        setTasks(prev => 
          prev.map(t => 
            t.id === taskId ? { ...t, status: 'in_progress' } : t
          )
        );
      } else {
        // Refresh tasks
        // In a real implementation, you would refetch the tasks
        setTasks(prev => 
          prev.map(t => 
            t.id === taskId ? { ...t, status: 'in_progress' } : t
          )
        );
      }
    } catch (err: any) {
      console.error('Error accepting task:', err);
      setError(err.message || 'Failed to accept task');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompleteDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setConfirmDialogOpen(true);
  };

  const handleCloseCompleteDialog = () => {
    setSelectedTaskId(null);
    setConfirmDialogOpen(false);
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId || !user) {
      handleCloseCompleteDialog();
      return;
    }
    
    setLoading(true);
    
    try {
      // Update the task status
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        })
        .eq('id', selectedTaskId);
      
      if (error) {
        // Fallback to local state update
        setTasks(prev => 
          prev.map(t => 
            t.id === selectedTaskId ? { 
              ...t, 
              status: 'completed',
              completed_at: new Date().toISOString(),
              completed_by: user.id,
            } : t
          )
        );
      } else {
        // Refresh tasks
        // In a real implementation, you would refetch the tasks
        setTasks(prev => 
          prev.map(t => 
            t.id === selectedTaskId ? { 
              ...t, 
              status: 'completed',
              completed_at: new Date().toISOString(),
              completed_by: user.id,
            } : t
          )
        );
      }
    } catch (err: any) {
      console.error('Error completing task:', err);
      setError(err.message || 'Failed to complete task');
    } finally {
      setLoading(false);
      handleCloseCompleteDialog();
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  const renderTaskCard = (task: Task) => (
    <Paper 
      key={task.id} 
      sx={{ 
        p: 2, 
        borderLeft: 6, 
        borderColor: getPriorityColor(task.priority),
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              size="small" 
              label={`Priority: ${task.priority}`} 
              color={getPriorityColor(task.priority)} 
            />
            
            {task.status === 'completed' && (
              <Chip 
                size="small" 
                label="Completed" 
                color="success" 
                icon={<CheckCircleIcon />} 
              />
            )}
            
            {task.status === 'in_progress' && (
              <Chip 
                size="small" 
                label="In Progress" 
                color="info" 
              />
            )}
            
            {task.category && (
              <Chip 
                size="small" 
                label={task.category} 
                variant="outlined" 
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {task.crew_name && (
              <Chip 
                size="small" 
                icon={<GroupIcon />} 
                label={task.crew_name} 
                variant="outlined" 
              />
            )}
            
            <Chip 
              size="small" 
              icon={<TimeIcon />} 
              label={formatDate(task.start_time)} 
              variant="outlined" 
            />
          </Box>
          
          {task.completed_at && (
            <Typography variant="caption" color="text.secondary">
              Completed on {new Date(task.completed_at).toLocaleString()}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {task.status === 'pending' && (
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => handleAcceptTask(task.id)}
            >
              Accept
            </Button>
          )}
          
          {task.status === 'in_progress' && (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<CheckCircleIcon />}
              onClick={() => handleOpenCompleteDialog(task.id)}
            >
              Complete
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );

  if (loading && tasks.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tasks
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab 
            label={`Pending (${pendingTasks.length})`} 
          />
          <Tab 
            label={`In Progress (${inProgressTasks.length})`} 
          />
          <Tab 
            label={`Completed (${completedTasks.length})`} 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pendingTasks.map(renderTaskCard)}
            {pendingTasks.length === 0 && (
              <Alert severity="info">
                No pending tasks assigned to you.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {inProgressTasks.map(renderTaskCard)}
            {inProgressTasks.length === 0 && (
              <Alert severity="info">
                No tasks in progress.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {completedTasks.map(renderTaskCard)}
            {completedTasks.length === 0 && (
              <Alert severity="info">
                No completed tasks.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Box>
      
      {/* Confirmation Dialog for task completion */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseCompleteDialog}
      >
        <DialogTitle>Mark Task as Complete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this task as complete? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog}>Cancel</Button>
          <Button onClick={handleCompleteTask} color="success" variant="contained">
            Complete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 