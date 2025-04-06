import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase, isAdmin, isCoordinator } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Festival, FestivalCreate, FestivalUpdate } from '../services/festivalService';
import FestivalList from '../components/festivals/FestivalList';
import FestivalForm from '../components/festivals/FestivalForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

interface Festival {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  status: string;
  map_url: string | null;
  created_at: string;
  updated_at: string;
}

interface FestivalFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
}

const STATUS_COLORS = {
  'planning': 'info',
  'active': 'success',
  'completed': 'secondary',
  'cancelled': 'error'
};

const Festivals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const isAdminResult = await isAdmin();
      const isCoordResult = await isCoordinator();
      if (!isAdminResult && !isCoordResult) {
        setError("You don't have permission to manage festivals.");
        setLoading(false);
      }
    };
    
    checkPermissions();
  }, []);

  // Fetch festivals data
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('festivals')
          .select('*')
          .order('start_date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setFestivals(data || []);
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, []);

  const handleCreateFestival = async (festival: FestivalCreate) => {
    try {
      const { data, error } = await supabase
        .from('festivals')
        .insert([festival])
        .select()
        .single();

      if (error) throw error;
      setFestivals([...festivals, data]);
      setShowForm(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create festival');
    }
  };

  const handleUpdateFestival = async (festival: FestivalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('festivals')
        .update(festival)
        .eq('id', festival.id)
        .select()
        .single();

      if (error) throw error;
      setFestivals(festivals.map(f => f.id === data.id ? data : f));
      setSelectedFestival(null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update festival');
    }
  };

  const handleDeleteFestival = async (id: string) => {
    try {
      const { error } = await supabase
        .from('festivals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFestivals(festivals.filter(f => f.id !== id));
      setSelectedFestival(null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete festival');
    }
  };

  const handleFestivalClick = (festival: Festival) => {
    setSelectedFestival(festival);
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  // Get status chip color
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    return (STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default') as any;
  };

  // Navigate to festival details
  const handleViewFestival = (festivalId: string) => {
    navigate(`/festivals/${festivalId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Festivals
        </Typography>
        
        {user?.role === 'admin' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Create Festival
          </Button>
        )}
      </Box>
      
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Festival</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FestivalForm
              onSubmit={handleCreateFestival}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {selectedFestival && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Festival</h3>
              <button
                onClick={() => setSelectedFestival(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FestivalForm
              festival={selectedFestival}
              onSubmit={handleUpdateFestival}
              onCancel={() => setSelectedFestival(null)}
            />
            {user?.role === 'admin' && (
              <button
                onClick={() => handleDeleteFestival(selectedFestival.id)}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Festival
              </button>
            )}
          </div>
        </div>
      )}

      <FestivalList
        festivals={festivals}
        onFestivalClick={handleFestivalClick}
        loading={loading}
        error={error}
      />
    </Container>
  );
};

export default Festivals; 