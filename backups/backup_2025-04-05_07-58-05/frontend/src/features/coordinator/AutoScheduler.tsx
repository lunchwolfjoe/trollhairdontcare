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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from backend
interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: {
    startDate: string;
    endDate: string;
    days: string[];
    startTime: string;
    endTime: string;
  };
  assignedCrew?: string;
}

interface Crew {
  id: string;
  name: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'John Doe',
    skills: ['Stage Setup', 'Technical', 'Heavy Lifting'],
    availability: {
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      days: ['Monday', 'Tuesday', 'Wednesday'],
      startTime: '09:00',
      endTime: '17:00',
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    skills: ['Security', 'First Aid', 'Communication'],
    availability: {
      startDate: '2024-06-02',
      endDate: '2024-06-04',
      days: ['Tuesday', 'Wednesday', 'Thursday'],
      startTime: '10:00',
      endTime: '18:00',
    },
  },
];

const mockCrews: Crew[] = [
  {
    id: '1',
    name: 'Stage Setup Crew',
    requiredSkills: ['Stage Setup', 'Heavy Lifting', 'Technical'],
    minVolunteers: 4,
    maxVolunteers: 8,
    assignedVolunteers: [],
  },
  {
    id: '2',
    name: 'Security Team',
    requiredSkills: ['Security', 'First Aid', 'Communication'],
    minVolunteers: 6,
    maxVolunteers: 12,
    assignedVolunteers: [],
  },
];

const AutoScheduler: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [crews, setCrews] = useState<Crew[]>(mockCrews);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState(0);
  const [schedulingStatus, setSchedulingStatus] = useState<string>('');

  useEffect(() => {
    // Fetch volunteers and crews from the backend
    const fetchData = async () => {
      try {
        // Replace with actual API calls
        // const volunteersData = await volunteerService.getVolunteers();
        // const crewsData = await volunteerService.getCrews();
        // setVolunteers(volunteersData);
        // setCrews(crewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const calculateSkillMatch = (volunteer: Volunteer, crew: Crew): number => {
    const matchingSkills = volunteer.skills.filter(skill =>
      crew.requiredSkills.includes(skill)
    );
    return (matchingSkills.length / crew.requiredSkills.length) * 100;
  };

  const handleAutoSchedule = async () => {
    setSchedulingProgress(0);
    setSchedulingStatus('Starting auto-scheduling process...');

    // Reset assignments
    const updatedVolunteers = volunteers.map(v => ({ ...v, assignedCrew: undefined }));
    const updatedCrews = crews.map(c => ({ ...c, assignedVolunteers: [] }));
    setVolunteers(updatedVolunteers);
    setCrews(updatedCrews);

    // Sort volunteers by skill match percentage for each crew
    const sortedVolunteers = [...updatedVolunteers].sort((a, b) => {
      const aMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(a, crew)));
      const bMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(b, crew)));
      return bMatch - aMatch;
    });

    // Assign volunteers to crews
    for (let i = 0; i < sortedVolunteers.length; i++) {
      const volunteer = sortedVolunteers[i];
      let bestCrew = null;
      let bestMatch = 0;

      // Find the best matching crew
      for (const crew of updatedCrews) {
        if (crew.assignedVolunteers.length < crew.maxVolunteers) {
          const match = calculateSkillMatch(volunteer, crew);
          if (match > bestMatch) {
            bestMatch = match;
            bestCrew = crew;
          }
        }
      }

      // Assign to best matching crew if found
      if (bestCrew) {
        const updatedVolunteer = { ...volunteer, assignedCrew: bestCrew.id };
        const updatedCrew = {
          ...bestCrew,
          assignedVolunteers: [...bestCrew.assignedVolunteers, volunteer.id],
        };

        setVolunteers(prev =>
          prev.map(v => (v.id === volunteer.id ? updatedVolunteer : v))
        );
        setCrews(prev =>
          prev.map(c => (c.id === bestCrew.id ? updatedCrew : c))
        );
      }

      setSchedulingProgress(((i + 1) / sortedVolunteers.length) * 100);
      setSchedulingStatus(`Processing volunteer ${i + 1} of ${sortedVolunteers.length}...`);
    }

    setSchedulingStatus('Auto-scheduling completed!');
  };

  const handleManualAssign = (volunteerId: string, crewId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    const crew = crews.find(c => c.id === crewId);

    if (volunteer && crew && crew.assignedVolunteers.length < crew.maxVolunteers) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: crewId } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === crewId
            ? { ...c, assignedVolunteers: [...c.assignedVolunteers, volunteerId] }
            : c
        )
      );
    }
  };

  const handleRemoveAssignment = (volunteerId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (volunteer?.assignedCrew) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: undefined } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === volunteer.assignedCrew
            ? {
                ...c,
                assignedVolunteers: c.assignedVolunteers.filter(id => id !== volunteerId),
              }
            : c
        )
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Auto Scheduler
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAutoSchedule}
        >
          Run Auto Scheduler
        </Button>
      </Box>

      {schedulingProgress > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {schedulingStatus}
          </Typography>
          <LinearProgress variant="determinate" value={schedulingProgress} />
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Volunteer Assignments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Volunteer</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Availability</TableCell>
                    <TableCell>Assigned Crew</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {volunteer.skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {volunteer.availability.days.join(', ')}
                        <br />
                        {volunteer.availability.startTime} - {volunteer.availability.endTime}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew ? (
                          crews.find(c => c.id === volunteer.assignedCrew)?.name
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Assign to Crew</InputLabel>
                            <Select
                              value=""
                              label="Assign to Crew"
                              onChange={(e) => handleManualAssign(volunteer.id, e.target.value as string)}
                            >
                              {crews.map((crew) => (
                                <MenuItem
                                  key={crew.id}
                                  value={crew.id}
                                  disabled={crew.assignedVolunteers.length >= crew.maxVolunteers}
                                >
                                  {crew.name} ({crew.assignedVolunteers.length}/{crew.maxVolunteers})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew && (
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAssignment(volunteer.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Crew Status
            </Typography>
            <Grid container spacing={2}>
              {crews.map((crew) => (
                <Grid item xs={12} md={6} key={crew.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {crew.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Required Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {crew.requiredSkills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      Volunteers: {crew.assignedVolunteers.length}/{crew.maxVolunteers}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(crew.assignedVolunteers.length / crew.maxVolunteers) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AutoScheduler; 
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from backend
interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: {
    startDate: string;
    endDate: string;
    days: string[];
    startTime: string;
    endTime: string;
  };
  assignedCrew?: string;
}

interface Crew {
  id: string;
  name: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'John Doe',
    skills: ['Stage Setup', 'Technical', 'Heavy Lifting'],
    availability: {
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      days: ['Monday', 'Tuesday', 'Wednesday'],
      startTime: '09:00',
      endTime: '17:00',
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    skills: ['Security', 'First Aid', 'Communication'],
    availability: {
      startDate: '2024-06-02',
      endDate: '2024-06-04',
      days: ['Tuesday', 'Wednesday', 'Thursday'],
      startTime: '10:00',
      endTime: '18:00',
    },
  },
];

const mockCrews: Crew[] = [
  {
    id: '1',
    name: 'Stage Setup Crew',
    requiredSkills: ['Stage Setup', 'Heavy Lifting', 'Technical'],
    minVolunteers: 4,
    maxVolunteers: 8,
    assignedVolunteers: [],
  },
  {
    id: '2',
    name: 'Security Team',
    requiredSkills: ['Security', 'First Aid', 'Communication'],
    minVolunteers: 6,
    maxVolunteers: 12,
    assignedVolunteers: [],
  },
];

const AutoScheduler: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [crews, setCrews] = useState<Crew[]>(mockCrews);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState(0);
  const [schedulingStatus, setSchedulingStatus] = useState<string>('');

  useEffect(() => {
    // Fetch volunteers and crews from the backend
    const fetchData = async () => {
      try {
        // Replace with actual API calls
        // const volunteersData = await volunteerService.getVolunteers();
        // const crewsData = await volunteerService.getCrews();
        // setVolunteers(volunteersData);
        // setCrews(crewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const calculateSkillMatch = (volunteer: Volunteer, crew: Crew): number => {
    const matchingSkills = volunteer.skills.filter(skill =>
      crew.requiredSkills.includes(skill)
    );
    return (matchingSkills.length / crew.requiredSkills.length) * 100;
  };

  const handleAutoSchedule = async () => {
    setSchedulingProgress(0);
    setSchedulingStatus('Starting auto-scheduling process...');

    // Reset assignments
    const updatedVolunteers = volunteers.map(v => ({ ...v, assignedCrew: undefined }));
    const updatedCrews = crews.map(c => ({ ...c, assignedVolunteers: [] }));
    setVolunteers(updatedVolunteers);
    setCrews(updatedCrews);

    // Sort volunteers by skill match percentage for each crew
    const sortedVolunteers = [...updatedVolunteers].sort((a, b) => {
      const aMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(a, crew)));
      const bMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(b, crew)));
      return bMatch - aMatch;
    });

    // Assign volunteers to crews
    for (let i = 0; i < sortedVolunteers.length; i++) {
      const volunteer = sortedVolunteers[i];
      let bestCrew = null;
      let bestMatch = 0;

      // Find the best matching crew
      for (const crew of updatedCrews) {
        if (crew.assignedVolunteers.length < crew.maxVolunteers) {
          const match = calculateSkillMatch(volunteer, crew);
          if (match > bestMatch) {
            bestMatch = match;
            bestCrew = crew;
          }
        }
      }

      // Assign to best matching crew if found
      if (bestCrew) {
        const updatedVolunteer = { ...volunteer, assignedCrew: bestCrew.id };
        const updatedCrew = {
          ...bestCrew,
          assignedVolunteers: [...bestCrew.assignedVolunteers, volunteer.id],
        };

        setVolunteers(prev =>
          prev.map(v => (v.id === volunteer.id ? updatedVolunteer : v))
        );
        setCrews(prev =>
          prev.map(c => (c.id === bestCrew.id ? updatedCrew : c))
        );
      }

      setSchedulingProgress(((i + 1) / sortedVolunteers.length) * 100);
      setSchedulingStatus(`Processing volunteer ${i + 1} of ${sortedVolunteers.length}...`);
    }

    setSchedulingStatus('Auto-scheduling completed!');
  };

  const handleManualAssign = (volunteerId: string, crewId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    const crew = crews.find(c => c.id === crewId);

    if (volunteer && crew && crew.assignedVolunteers.length < crew.maxVolunteers) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: crewId } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === crewId
            ? { ...c, assignedVolunteers: [...c.assignedVolunteers, volunteerId] }
            : c
        )
      );
    }
  };

  const handleRemoveAssignment = (volunteerId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (volunteer?.assignedCrew) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: undefined } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === volunteer.assignedCrew
            ? {
                ...c,
                assignedVolunteers: c.assignedVolunteers.filter(id => id !== volunteerId),
              }
            : c
        )
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Auto Scheduler
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAutoSchedule}
        >
          Run Auto Scheduler
        </Button>
      </Box>

      {schedulingProgress > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {schedulingStatus}
          </Typography>
          <LinearProgress variant="determinate" value={schedulingProgress} />
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Volunteer Assignments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Volunteer</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Availability</TableCell>
                    <TableCell>Assigned Crew</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {volunteer.skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {volunteer.availability.days.join(', ')}
                        <br />
                        {volunteer.availability.startTime} - {volunteer.availability.endTime}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew ? (
                          crews.find(c => c.id === volunteer.assignedCrew)?.name
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Assign to Crew</InputLabel>
                            <Select
                              value=""
                              label="Assign to Crew"
                              onChange={(e) => handleManualAssign(volunteer.id, e.target.value as string)}
                            >
                              {crews.map((crew) => (
                                <MenuItem
                                  key={crew.id}
                                  value={crew.id}
                                  disabled={crew.assignedVolunteers.length >= crew.maxVolunteers}
                                >
                                  {crew.name} ({crew.assignedVolunteers.length}/{crew.maxVolunteers})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew && (
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAssignment(volunteer.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Crew Status
            </Typography>
            <Grid container spacing={2}>
              {crews.map((crew) => (
                <Grid item xs={12} md={6} key={crew.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {crew.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Required Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {crew.requiredSkills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      Volunteers: {crew.assignedVolunteers.length}/{crew.maxVolunteers}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(crew.assignedVolunteers.length / crew.maxVolunteers) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AutoScheduler; 
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data from backend
interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: {
    startDate: string;
    endDate: string;
    days: string[];
    startTime: string;
    endTime: string;
  };
  assignedCrew?: string;
}

interface Crew {
  id: string;
  name: string;
  requiredSkills: string[];
  minVolunteers: number;
  maxVolunteers: number;
  assignedVolunteers: string[];
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'John Doe',
    skills: ['Stage Setup', 'Technical', 'Heavy Lifting'],
    availability: {
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      days: ['Monday', 'Tuesday', 'Wednesday'],
      startTime: '09:00',
      endTime: '17:00',
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    skills: ['Security', 'First Aid', 'Communication'],
    availability: {
      startDate: '2024-06-02',
      endDate: '2024-06-04',
      days: ['Tuesday', 'Wednesday', 'Thursday'],
      startTime: '10:00',
      endTime: '18:00',
    },
  },
];

const mockCrews: Crew[] = [
  {
    id: '1',
    name: 'Stage Setup Crew',
    requiredSkills: ['Stage Setup', 'Heavy Lifting', 'Technical'],
    minVolunteers: 4,
    maxVolunteers: 8,
    assignedVolunteers: [],
  },
  {
    id: '2',
    name: 'Security Team',
    requiredSkills: ['Security', 'First Aid', 'Communication'],
    minVolunteers: 6,
    maxVolunteers: 12,
    assignedVolunteers: [],
  },
];

const AutoScheduler: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [crews, setCrews] = useState<Crew[]>(mockCrews);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState(0);
  const [schedulingStatus, setSchedulingStatus] = useState<string>('');

  useEffect(() => {
    // Fetch volunteers and crews from the backend
    const fetchData = async () => {
      try {
        // Replace with actual API calls
        // const volunteersData = await volunteerService.getVolunteers();
        // const crewsData = await volunteerService.getCrews();
        // setVolunteers(volunteersData);
        // setCrews(crewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const calculateSkillMatch = (volunteer: Volunteer, crew: Crew): number => {
    const matchingSkills = volunteer.skills.filter(skill =>
      crew.requiredSkills.includes(skill)
    );
    return (matchingSkills.length / crew.requiredSkills.length) * 100;
  };

  const handleAutoSchedule = async () => {
    setSchedulingProgress(0);
    setSchedulingStatus('Starting auto-scheduling process...');

    // Reset assignments
    const updatedVolunteers = volunteers.map(v => ({ ...v, assignedCrew: undefined }));
    const updatedCrews = crews.map(c => ({ ...c, assignedVolunteers: [] }));
    setVolunteers(updatedVolunteers);
    setCrews(updatedCrews);

    // Sort volunteers by skill match percentage for each crew
    const sortedVolunteers = [...updatedVolunteers].sort((a, b) => {
      const aMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(a, crew)));
      const bMatch = Math.max(...updatedCrews.map(crew => calculateSkillMatch(b, crew)));
      return bMatch - aMatch;
    });

    // Assign volunteers to crews
    for (let i = 0; i < sortedVolunteers.length; i++) {
      const volunteer = sortedVolunteers[i];
      let bestCrew = null;
      let bestMatch = 0;

      // Find the best matching crew
      for (const crew of updatedCrews) {
        if (crew.assignedVolunteers.length < crew.maxVolunteers) {
          const match = calculateSkillMatch(volunteer, crew);
          if (match > bestMatch) {
            bestMatch = match;
            bestCrew = crew;
          }
        }
      }

      // Assign to best matching crew if found
      if (bestCrew) {
        const updatedVolunteer = { ...volunteer, assignedCrew: bestCrew.id };
        const updatedCrew = {
          ...bestCrew,
          assignedVolunteers: [...bestCrew.assignedVolunteers, volunteer.id],
        };

        setVolunteers(prev =>
          prev.map(v => (v.id === volunteer.id ? updatedVolunteer : v))
        );
        setCrews(prev =>
          prev.map(c => (c.id === bestCrew.id ? updatedCrew : c))
        );
      }

      setSchedulingProgress(((i + 1) / sortedVolunteers.length) * 100);
      setSchedulingStatus(`Processing volunteer ${i + 1} of ${sortedVolunteers.length}...`);
    }

    setSchedulingStatus('Auto-scheduling completed!');
  };

  const handleManualAssign = (volunteerId: string, crewId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    const crew = crews.find(c => c.id === crewId);

    if (volunteer && crew && crew.assignedVolunteers.length < crew.maxVolunteers) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: crewId } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === crewId
            ? { ...c, assignedVolunteers: [...c.assignedVolunteers, volunteerId] }
            : c
        )
      );
    }
  };

  const handleRemoveAssignment = (volunteerId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (volunteer?.assignedCrew) {
      setVolunteers(prev =>
        prev.map(v => (v.id === volunteerId ? { ...v, assignedCrew: undefined } : v))
      );
      setCrews(prev =>
        prev.map(c =>
          c.id === volunteer.assignedCrew
            ? {
                ...c,
                assignedVolunteers: c.assignedVolunteers.filter(id => id !== volunteerId),
              }
            : c
        )
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Auto Scheduler
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAutoSchedule}
        >
          Run Auto Scheduler
        </Button>
      </Box>

      {schedulingProgress > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {schedulingStatus}
          </Typography>
          <LinearProgress variant="determinate" value={schedulingProgress} />
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Volunteer Assignments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Volunteer</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Availability</TableCell>
                    <TableCell>Assigned Crew</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {volunteer.skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {volunteer.availability.days.join(', ')}
                        <br />
                        {volunteer.availability.startTime} - {volunteer.availability.endTime}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew ? (
                          crews.find(c => c.id === volunteer.assignedCrew)?.name
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Assign to Crew</InputLabel>
                            <Select
                              value=""
                              label="Assign to Crew"
                              onChange={(e) => handleManualAssign(volunteer.id, e.target.value as string)}
                            >
                              {crews.map((crew) => (
                                <MenuItem
                                  key={crew.id}
                                  value={crew.id}
                                  disabled={crew.assignedVolunteers.length >= crew.maxVolunteers}
                                >
                                  {crew.name} ({crew.assignedVolunteers.length}/{crew.maxVolunteers})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        {volunteer.assignedCrew && (
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAssignment(volunteer.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Crew Status
            </Typography>
            <Grid container spacing={2}>
              {crews.map((crew) => (
                <Grid item xs={12} md={6} key={crew.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {crew.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Required Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {crew.requiredSkills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      Volunteers: {crew.assignedVolunteers.length}/{crew.maxVolunteers}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(crew.assignedVolunteers.length / crew.maxVolunteers) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AutoScheduler; 