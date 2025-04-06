import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../../lib/supabase';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  assigned: number;
  open: number;
  byCategory: {
    category: string;
    count: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
  }[];
  completionRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TaskStats: React.FC = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      // Calculate statistics
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const assigned = tasks.filter(t => t.status === 'assigned').length;
      const open = tasks.filter(t => t.status === 'open').length;

      // Group by category
      const categoryCounts = tasks.reduce((acc: { [key: string]: number }, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {});

      const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      }));

      // Group by priority
      const priorityCounts = tasks.reduce((acc: { [key: string]: number }, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {});

      const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
      }));

      // Calculate completion rate
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      setStats({
        total,
        completed,
        inProgress,
        assigned,
        open,
        byCategory,
        byPriority,
        completionRate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Task Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Tasks</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Completed</Typography>
            <Typography variant="h4" color="success.main">
              {stats.completed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">In Progress</Typography>
            <Typography variant="h4" color="warning.main">
              {stats.inProgress}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Completion Rate</Typography>
            <Typography variant="h4" color="primary.main">
              {stats.completionRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: stats.completed },
                      { name: 'In Progress', value: stats.inProgress },
                      { name: 'Assigned', value: stats.assigned },
                      { name: 'Open', value: stats.open },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Priority Distribution Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Priority
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskStats; 