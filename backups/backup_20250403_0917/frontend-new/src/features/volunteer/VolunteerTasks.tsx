import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

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
  }
];

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VolunteerTasks: React.FC = () => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Tasks
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending" />
        <Tab label="In Progress" />
        <Tab label="Completed" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pendingTasks.map((task) => (
            <Paper key={task.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatDate(task.start_time)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {formatDate(task.end_time)}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={task.priority} 
                    color={getPriorityColor(task.priority)} 
                    icon={<AssignmentIcon />} 
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="primary">
                    Accept
                  </Button>
                  <Button variant="outlined" color="error">
                    Decline
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
          {pendingTasks.length === 0 && (
            <Typography color="text.secondary" align="center">
              No pending tasks
            </Typography>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inProgressTasks.map((task) => (
            <Paper key={task.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatDate(task.start_time)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {formatDate(task.end_time)}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={task.priority} 
                    color={getPriorityColor(task.priority)} 
                    icon={<AssignmentIcon />} 
                  />
                </Box>
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircleIcon />}
                >
                  Complete
                </Button>
              </Box>
            </Paper>
          ))}
          {inProgressTasks.length === 0 && (
            <Typography color="text.secondary" align="center">
              No tasks in progress
            </Typography>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {completedTasks.map((task) => (
            <Paper key={task.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatDate(task.start_time)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {formatDate(task.end_time)}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label="Completed" 
                    color="success" 
                    icon={<CheckCircleIcon />} 
                  />
                </Box>
              </Box>
            </Paper>
          ))}
          {completedTasks.length === 0 && (
            <Typography color="text.secondary" align="center">
              No completed tasks
            </Typography>
          )}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default VolunteerTasks; 