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
  Chip,
  Alert,
  Tabs,
  Tab,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
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

interface TaskAssignment {
  id: string;
  task_id: string;
  volunteer_id: string;
  status: 'assigned' | 'accepted' | 'completed' | 'rejected';
  notes: string;
  created_at: string;
  updated_at: string;
}

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VolunteerTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openComment, setOpenComment] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get volunteer ID
      const { data: volunteer } = await supabase
        .from('volunteers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!volunteer) throw new Error('No volunteer found');

      // Get task assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('volunteer_id', volunteer.id);

      if (assignmentsError) throw assignmentsError;

      // Get assigned tasks
      const taskIds = assignmentsData.map((a) => a.task_id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
      setAssignments(assignmentsData || []);

      // Get task comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusUpdate = async (taskId: string, status: TaskAssignment['status']) => {
    try {
      const assignment = assignments.find((a) => a.task_id === taskId);
      if (!assignment) throw new Error('No assignment found');

      const { error } = await supabase
        .from('task_assignments')
        .update({ status })
        .eq('id', assignment.id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  const handleOpenComment = (task: Task) => {
    setSelectedTask(task);
    setOpenComment(true);
  };

  const handleCloseComment = () => {
    setOpenComment(false);
    setSelectedTask(null);
    setCommentContent('');
  };

  const handleSubmitComment = async () => {
    try {
      if (!selectedTask) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('task_comments')
        .insert([
          {
            task_id: selectedTask.id,
            user_id: user.id,
            content: commentContent,
          },
        ]);

      if (error) throw error;
      fetchTasks();
      handleCloseComment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const getTaskStatus = (taskId: string) => {
    const assignment = assignments.find((a) => a.task_id === taskId);
    return assignment?.status || 'assigned';
  };

  const getTaskComments = (taskId: string) => {
    return comments.filter((c) => c.task_id === taskId);
  };

  const pendingTasks = tasks.filter((task) => getTaskStatus(task.id) === 'assigned');
  const inProgressTasks = tasks.filter((task) => getTaskStatus(task.id) === 'accepted');
  const completedTasks = tasks.filter((task) => getTaskStatus(task.id) === 'completed');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Tasks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          {pendingTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {task.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start: {format(parseISO(task.start_time), 'PPp')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {format(parseISO(task.end_time), 'PPp')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {task.required_skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      color="success"
                      onClick={() => handleStatusUpdate(task.id, 'accepted')}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleStatusUpdate(task.id, 'rejected')}
                    >
                      <CloseIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenComment(task)}
                    >
                      <CommentIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          {inProgressTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {task.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start: {format(parseISO(task.start_time), 'PPp')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {format(parseISO(task.end_time), 'PPp')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {task.required_skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusUpdate(task.id, 'completed')}
                      startIcon={<CheckIcon />}
                    >
                      Complete
                    </Button>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenComment(task)}
                    >
                      <CommentIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {completedTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {task.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start: {format(parseISO(task.start_time), 'PPp')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {format(parseISO(task.end_time), 'PPp')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {task.required_skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenComment(task)}
                  >
                    <CommentIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <Dialog open={openComment} onClose={handleCloseComment} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle1">
              Task: {selectedTask?.title}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            {selectedTask && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Previous Comments:
                </Typography>
                {getTaskComments(selectedTask.id).map((comment) => (
                  <Paper key={comment.id} sx={{ p: 1, mb: 1 }}>
                    <Typography variant="body2">
                      {comment.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(parseISO(comment.created_at), 'PPp')}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComment}>Cancel</Button>
          <Button onClick={handleSubmitComment} variant="contained">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolunteerTasks; 