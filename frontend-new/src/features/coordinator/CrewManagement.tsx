import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { festivalService, crewService } from '../../lib/services';
import { Festival, Crew as CrewModel } from '../../lib/types/models';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface Crew {
  id: string;
  name: string;
  description: string;
  crew_type: string;
  requiredSkills: string[];
  min_headcount: number;
  max_headcount: number;
  assignedVolunteers: string[];
  shift_start_time: string;
  shift_end_time: string;
  shift_length_hours: number;
  festival_id: string;

  // Additional database field name
  required_skills?: string[] | string;

  // UI fields
  operatingStartTime?: string;
  operatingEndTime?: string;
  minVolunteers?: number;
  maxVolunteers?: number;
  type?: string;
  shiftLengthHours?: number;
}

const CREW_TYPES = ['Technical', 'Security', 'Medical', 'Food Service', 'Cleaning', 'General'];
const AVAILABLE_SKILLS = ['Stage Setup', 'Sound Equipment', 'Lighting', 'Security', 'First Aid', 'Food Service', 'Cleaning'];

const CrewManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState<Partial<Crew>>({
    name: '',
    description: '',
    crew_type: '',
    requiredSkills: [],
    min_headcount: 1,
    max_headcount: 1,
    shift_start_time: '08:00',
    shift_end_time: '16:00',
    shift_length_hours: 4,
    festival_id: '',
  });
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const festivalsResponse = await festivalService.getActiveFestivals();
        if (festivalsResponse.error) {
          throw new Error(`Failed to fetch festivals: ${festivalsResponse.error.message}`);
        }
        
        setFestivals(festivalsResponse.data || []);
        
        let targetFestivalId = festivalId || '';
        
        if (!targetFestivalId && festivalsResponse.data && festivalsResponse.data.length > 0) {
          targetFestivalId = festivalsResponse.data[0].id;
        }
        
        setFormData(prev => ({
          ...prev,
          festival_id: targetFestivalId
        }));
        
        if (targetFestivalId) {
          const crewsResponse = await crewService.getCrews(targetFestivalId);
          if (crewsResponse.error) {
            throw new Error(`Failed to fetch crews: ${crewsResponse.error.message}`);
          }
          
          console.log('Raw crews data from database:', crewsResponse.data);
          
          const mappedCrews = (crewsResponse.data || []).map(crew => {
            // Handle both required_skills and requiredSkills field names
            const skillsData = crew.required_skills || crew.requiredSkills;
            
            // Parse requiredSkills/required_skills if it's a string
            let parsedSkills = [];
            try {
              parsedSkills = typeof skillsData === 'string' 
                ? JSON.parse(skillsData) 
                : (Array.isArray(skillsData) ? skillsData : []);
            } catch (e) {
              console.error('Error parsing required_skills:', e);
              parsedSkills = [];
            }
            
            // Handle assignedVolunteers
            let parsedAssignedVolunteers = [];
            try {
              parsedAssignedVolunteers = typeof crew.assignedVolunteers === 'string'
                ? JSON.parse(crew.assignedVolunteers)
                : (Array.isArray(crew.assignedVolunteers) ? crew.assignedVolunteers : []);
            } catch (e) {
              console.error('Error parsing assignedVolunteers:', e);
              parsedAssignedVolunteers = [];
            }
            
            return {
              ...crew,
              operatingStartTime: crew.shift_start_time,
              operatingEndTime: crew.shift_end_time,
              minVolunteers: crew.min_headcount,
              maxVolunteers: crew.max_headcount,
              type: crew.crew_type,
              shiftLengthHours: crew.shift_length_hours,
              requiredSkills: parsedSkills,
              assignedVolunteers: parsedAssignedVolunteers
            };
          });
          
          console.log('Mapped crews data for UI:', mappedCrews);
          setCrews(mappedCrews);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [festivalId]);

  const handleOpenDialog = (crew?: Crew) => {
    if (crew) {
      setEditingCrew(crew);
      setFormData({
        ...crew,
        operatingStartTime: crew.shift_start_time,
        operatingEndTime: crew.shift_end_time,
        minVolunteers: crew.min_headcount,
        maxVolunteers: crew.max_headcount,
        type: crew.crew_type,
        shiftLengthHours: crew.shift_length_hours,
      });
    } else {
      setEditingCrew(null);
      setFormData({
        name: '',
        description: '',
        crew_type: '',
        requiredSkills: [],
        min_headcount: 1,
        max_headcount: 1,
        shift_start_time: '08:00',
        shift_end_time: '16:00',
        shift_length_hours: 4,
        festival_id: festivals.length > 0 ? (festivalId || festivals[0].id) : '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCrew(null);
    setFormData({
      name: '',
      description: '',
      crew_type: '',
      requiredSkills: [],
      min_headcount: 1,
      max_headcount: 1,
      shift_start_time: '08:00',
      shift_end_time: '16:00',
      shift_length_hours: 4,
      festival_id: festivals.length > 0 ? (festivalId || festivals[0].id) : '',
    });
  };

  const handleFormChange = (field: string, value: any) => {
    if (field === 'operatingStartTime') {
      setFormData(prev => ({
        ...prev,
        shift_start_time: value,
        operatingStartTime: value
      }));
    } else if (field === 'operatingEndTime') {
      setFormData(prev => ({
        ...prev,
        shift_end_time: value,
        operatingEndTime: value
      }));
    } else if (field === 'minVolunteers') {
      setFormData(prev => ({
        ...prev,
        min_headcount: value,
        minVolunteers: value
      }));
    } else if (field === 'maxVolunteers') {
      setFormData(prev => ({
        ...prev,
        max_headcount: value,
        maxVolunteers: value
      }));
    } else if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        crew_type: value,
        type: value
      }));
    } else if (field === 'shiftLengthHours') {
      setFormData(prev => ({
        ...prev,
        shift_length_hours: value,
        shiftLengthHours: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...(prev.requiredSkills || []), skill],
    }));
  };

  // Map field names used in the UI to the ones used in the database
  const mapFormDataToDbModel = (formData: Partial<Crew>) => {
    console.log('Mapping UI form data to DB model:', formData);
    
    // Create a raw database object with exact column names
    return {
      name: formData.name,
      description: formData.description,
      crew_type: formData.type || formData.crew_type,
      required_skills: formData.requiredSkills || formData.required_skills || [],
      min_headcount: formData.minVolunteers || formData.min_headcount,
      max_headcount: formData.maxVolunteers || formData.max_headcount,
      shift_start_time: formData.operatingStartTime || formData.shift_start_time,
      shift_end_time: formData.operatingEndTime || formData.shift_end_time,
      shift_length_hours: formData.shiftLengthHours || formData.shift_length_hours,
      festival_id: formData.festival_id,
    };
  };

  const handleSubmit = async () => {
    if (!formData.festival_id) {
      setError('Please select a festival for this crew');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Map UI form data to database field names
      const crewData = mapFormDataToDbModel(formData);
      
      // Log exactly what we're sending to database to help debug
      console.log('Sending to database:', crewData);
      
      // Use direct fetch API to bypass schema cache issues
      const apiUrl = 'https://ysljpqtpbpugekhrdocq.supabase.co/rest/v1/crews';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      const fetchOptions = {
        method: editingCrew ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c',
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(crewData),
      };
      
      let url = apiUrl;
      if (editingCrew) {
        url = `${apiUrl}?id=eq.${editingCrew.id}`;
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to ${editingCrew ? 'update' : 'create'} crew: ${errorData.message || response.statusText}`);
      }
      
      const responseData = await response.json();
      const savedCrew = Array.isArray(responseData) ? responseData[0] : responseData;
      
      console.log('Successfully saved crew:', savedCrew);
      
      // Map the saved data back to UI format
      const uiMappedCrew = {
        ...savedCrew,
        operatingStartTime: savedCrew.shift_start_time,
        operatingEndTime: savedCrew.shift_end_time,
        minVolunteers: savedCrew.min_headcount,
        maxVolunteers: savedCrew.max_headcount,
        type: savedCrew.crew_type,
        shiftLengthHours: savedCrew.shift_length_hours,
        requiredSkills: typeof savedCrew.required_skills === 'string' 
          ? JSON.parse(savedCrew.required_skills) 
          : (savedCrew.required_skills || []),
        assignedVolunteers: []
      };
      
      // Update state based on whether we're editing or creating
      if (editingCrew) {
        setCrews(prev => prev.map(crew => 
          crew.id === savedCrew.id ? uiMappedCrew : crew
        ));
      } else {
        setCrews(prev => [...prev, uiMappedCrew]);
      }
      
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving crew:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (crewId: string) => {
    try {
      setLoading(true);
      
      // Get the auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      // Use direct fetch API to delete the crew
      const apiUrl = `https://ysljpqtpbpugekhrdocq.supabase.co/rest/v1/crews?id=eq.${crewId}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crew: ${errorData.message || response.statusText}`);
      }
      
      // Remove from local state
      setCrews(prev => prev.filter(crew => crew.id !== crewId));
    } catch (err: any) {
      console.error('Error deleting crew:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFestivalName = (festivalId: string) => {
    const festival = festivals.find(f => f.id === festivalId);
    return festival ? festival.name : 'Unknown Festival';
  };

  const calculateShiftCount = (startTime: string, endTime: string, shiftLength: number) => {
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const shiftLengthMinutes = shiftLength * 60;
      
      return Math.floor(totalMinutes / shiftLengthMinutes);
    } catch (e) {
      return 0;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Crew Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
            disabled={festivals.length === 0}
          >
            Create New Crew
          </Button>
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
        ) : festivals.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No active festivals found. Please create a festival first.
          </Alert>
        ) : crews.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No crews found. Click "Create New Crew" to add a crew.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {crews.map((crew) => (
              <Grid item xs={12} md={6} key={crew.id}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {crew.name}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(crew)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(crew.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {crew.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Festival: {getFestivalName(crew.festival_id)}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Type: {crew.type || crew.crew_type}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Operating Hours: {crew.operatingStartTime || crew.shift_start_time} - {crew.operatingEndTime || crew.shift_end_time}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Shift Length: {crew.shiftLengthHours || crew.shift_length_hours} hours 
                    ({calculateShiftCount(
                      crew.operatingStartTime || crew.shift_start_time, 
                      crew.operatingEndTime || crew.shift_end_time, 
                      crew.shiftLengthHours || crew.shift_length_hours
                    )} shifts per day)
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Volunteers: {(crew.assignedVolunteers || []).length} / {crew.maxVolunteers || crew.max_headcount}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Required Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(crew.requiredSkills || []).map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCrew ? 'Edit Crew' : 'Create New Crew'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={formData.festival_id}
                  onChange={(e) => handleFormChange('festival_id', e.target.value)}
                  label="Festival"
                  disabled={!!festivalId}
                >
                  {festivals.map((festival) => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Crew Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Crew Type</InputLabel>
                <Select
                  value={formData.type || formData.crew_type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label="Crew Type"
                >
                  {CREW_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Crew Operating Hours
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={formData.operatingStartTime || formData.shift_start_time}
                  onChange={(e) => handleFormChange('operatingStartTime', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="When crew starts working each day"
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={formData.operatingEndTime || formData.shift_end_time}
                  onChange={(e) => handleFormChange('operatingEndTime', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="When crew finishes each day"
                />
              </Box>
              <TextField
                label="Individual Shift Length (hours)"
                type="number"
                value={formData.shiftLengthHours || formData.shift_length_hours}
                onChange={(e) => handleFormChange('shiftLengthHours', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1, max: 12 }}
                helperText="How many hours volunteers work in one shift"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Minimum Volunteers"
                  type="number"
                  value={formData.minVolunteers || formData.min_headcount}
                  onChange={(e) => handleFormChange('minVolunteers', parseInt(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Maximum Volunteers"
                  type="number"
                  value={formData.maxVolunteers || formData.max_headcount}
                  onChange={(e) => handleFormChange('maxVolunteers', parseInt(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {AVAILABLE_SKILLS.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onClick={() => handleSkillToggle(skill)}
                      color={formData.requiredSkills?.includes(skill) ? 'primary' : 'default'}
                      variant={formData.requiredSkills?.includes(skill) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : (editingCrew ? 'Save Changes' : 'Create Crew')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export { CrewManagement }; 
