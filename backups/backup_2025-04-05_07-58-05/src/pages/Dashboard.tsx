import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';

const Dashboard = () => {
  const { user, status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && status !== 'loading') {
      navigate('/login');
    }
  }, [user, status, navigate]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return null; // Don't render anything until we're sure
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Sign Out
          </Button>
        </Box>
        <Typography variant="subtitle1">
          Welcome back, {user.email}!
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Volunteers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage festival volunteers, assignments, and schedules.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Volunteers</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Festival Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive map of the festival grounds and key locations.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Open Map</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Communicate with volunteers and staff.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Messages</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 