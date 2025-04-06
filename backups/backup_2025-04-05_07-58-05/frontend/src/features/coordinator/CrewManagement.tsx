import React, { useState } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Crew {
  id: string;
  name: string;
  description: string;
  type: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const CREW_TYPES = ['Technical', 'Security', 'Medical', 'Food Service', 'Cleaning', 'General'];
const AVAILABLE_SKILLS = ['Stage Setup', 'Sound Equipment', 'Lighting', 'Security', 'First Aid', 'Food Service', 'Cleaning'];

export const CrewManagement: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState<Partial<Crew>>({
    name: '',
    description: '',
    type: '',
    requiredSkills: [],
    minVolunteers: 1,
    maxVolunteers: 1,
  });

  const handleOpenDialog = (crew?: Crew) => {
    if (crew) {
      setEditingCrew(crew);
      setFormData(crew);
    } else {
      setEditingCrew(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        requiredSkills: [],
        minVolunteers: 1,
        maxVolunteers: 1,
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
      type: '',
      requiredSkills: [],
      minVolunteers: 1,
      maxVolunteers: 1,
    });
  };

  const handleFormChange = (field: keyof Crew, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...(prev.requiredSkills || []), skill],
    }));
  };

  const handleSubmit = () => {
    if (editingCrew) {
      setCrews(prev =>
        prev.map(crew =>
          crew.id === editingCrew.id
            ? { ...crew, ...formData }
            : crew
        )
      );
    } else {
      const newCrew: Crew = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Omit<Crew, 'id' | 'assignedVolunteers'>,
        assignedVolunteers: [],
      };
      setCrews(prev => [...prev, newCrew]);
    }
    handleCloseDialog();
  };

  const handleDelete = (crewId: string) => {
    setCrews(prev => prev.filter(crew => crew.id !== crewId));
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
          >
            Create New Crew
          </Button>
        </Box>

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
                  Type: {crew.type}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Volunteers: {crew.assignedVolunteers.length} / {crew.maxVolunteers}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {crew.requiredSkills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCrew ? 'Edit Crew' : 'Create New Crew'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  value={formData.type}
                  label="Crew Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {CREW_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Volunteers"
                    type="number"
                    value={formData.minVolunteers}
                    onChange={(e) => handleFormChange('minVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Volunteers"
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={(e) => handleFormChange('maxVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: formData.minVolunteers }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.type ||
                !formData.requiredSkills?.length ||
                formData.minVolunteers > formData.maxVolunteers
              }
            >
              {editingCrew ? 'Save Changes' : 'Create Crew'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}; 
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Crew {
  id: string;
  name: string;
  description: string;
  type: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const CREW_TYPES = ['Technical', 'Security', 'Medical', 'Food Service', 'Cleaning', 'General'];
const AVAILABLE_SKILLS = ['Stage Setup', 'Sound Equipment', 'Lighting', 'Security', 'First Aid', 'Food Service', 'Cleaning'];

export const CrewManagement: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState<Partial<Crew>>({
    name: '',
    description: '',
    type: '',
    requiredSkills: [],
    minVolunteers: 1,
    maxVolunteers: 1,
  });

  const handleOpenDialog = (crew?: Crew) => {
    if (crew) {
      setEditingCrew(crew);
      setFormData(crew);
    } else {
      setEditingCrew(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        requiredSkills: [],
        minVolunteers: 1,
        maxVolunteers: 1,
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
      type: '',
      requiredSkills: [],
      minVolunteers: 1,
      maxVolunteers: 1,
    });
  };

  const handleFormChange = (field: keyof Crew, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...(prev.requiredSkills || []), skill],
    }));
  };

  const handleSubmit = () => {
    if (editingCrew) {
      setCrews(prev =>
        prev.map(crew =>
          crew.id === editingCrew.id
            ? { ...crew, ...formData }
            : crew
        )
      );
    } else {
      const newCrew: Crew = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Omit<Crew, 'id' | 'assignedVolunteers'>,
        assignedVolunteers: [],
      };
      setCrews(prev => [...prev, newCrew]);
    }
    handleCloseDialog();
  };

  const handleDelete = (crewId: string) => {
    setCrews(prev => prev.filter(crew => crew.id !== crewId));
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
          >
            Create New Crew
          </Button>
        </Box>

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
                  Type: {crew.type}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Volunteers: {crew.assignedVolunteers.length} / {crew.maxVolunteers}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {crew.requiredSkills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCrew ? 'Edit Crew' : 'Create New Crew'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  value={formData.type}
                  label="Crew Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {CREW_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Volunteers"
                    type="number"
                    value={formData.minVolunteers}
                    onChange={(e) => handleFormChange('minVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Volunteers"
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={(e) => handleFormChange('maxVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: formData.minVolunteers }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.type ||
                !formData.requiredSkills?.length ||
                formData.minVolunteers > formData.maxVolunteers
              }
            >
              {editingCrew ? 'Save Changes' : 'Create Crew'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}; 
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Crew {
  id: string;
  name: string;
  description: string;
  type: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const CREW_TYPES = ['Technical', 'Security', 'Medical', 'Food Service', 'Cleaning', 'General'];
const AVAILABLE_SKILLS = ['Stage Setup', 'Sound Equipment', 'Lighting', 'Security', 'First Aid', 'Food Service', 'Cleaning'];

export const CrewManagement: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [formData, setFormData] = useState<Partial<Crew>>({
    name: '',
    description: '',
    type: '',
    requiredSkills: [],
    minVolunteers: 1,
    maxVolunteers: 1,
  });

  const handleOpenDialog = (crew?: Crew) => {
    if (crew) {
      setEditingCrew(crew);
      setFormData(crew);
    } else {
      setEditingCrew(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        requiredSkills: [],
        minVolunteers: 1,
        maxVolunteers: 1,
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
      type: '',
      requiredSkills: [],
      minVolunteers: 1,
      maxVolunteers: 1,
    });
  };

  const handleFormChange = (field: keyof Crew, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...(prev.requiredSkills || []), skill],
    }));
  };

  const handleSubmit = () => {
    if (editingCrew) {
      setCrews(prev =>
        prev.map(crew =>
          crew.id === editingCrew.id
            ? { ...crew, ...formData }
            : crew
        )
      );
    } else {
      const newCrew: Crew = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Omit<Crew, 'id' | 'assignedVolunteers'>,
        assignedVolunteers: [],
      };
      setCrews(prev => [...prev, newCrew]);
    }
    handleCloseDialog();
  };

  const handleDelete = (crewId: string) => {
    setCrews(prev => prev.filter(crew => crew.id !== crewId));
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
          >
            Create New Crew
          </Button>
        </Box>

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
                  Type: {crew.type}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Volunteers: {crew.assignedVolunteers.length} / {crew.maxVolunteers}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {crew.requiredSkills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCrew ? 'Edit Crew' : 'Create New Crew'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  value={formData.type}
                  label="Crew Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {CREW_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Volunteers"
                    type="number"
                    value={formData.minVolunteers}
                    onChange={(e) => handleFormChange('minVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Volunteers"
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={(e) => handleFormChange('maxVolunteers', parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ min: formData.minVolunteers }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.type ||
                !formData.requiredSkills?.length ||
                formData.minVolunteers > formData.maxVolunteers
              }
            >
              {editingCrew ? 'Save Changes' : 'Create Crew'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}; 