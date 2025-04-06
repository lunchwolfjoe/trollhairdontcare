import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
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
  shiftStartTime: string;
  shiftEndTime: string;
  shiftLengthHours: number;
}

interface Shift {
  id: string;
  crewId: string;
  startTime: Date;
  endTime: Date;
  requiredVolunteers: number;
  assignedVolunteers: string[];
  status: 'open' | 'filled' | 'completed' | 'cancelled';
}

interface ValidationError {
  field: string;
  message: string;
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
  {
    id: '3',
    name: 'Mike Johnson',
    skills: ['Food Service', 'Customer Service', 'Cash Handling'],
    availability: {
      startDate: '2024-06-01',
      endDate: '2024-06-05',
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '08:00',
      endTime: '16:00',
    },
  },
  {
    id: '4',
    name: 'Sarah Williams',
    skills: ['First Aid', 'Technical', 'Communication'],
    availability: {
      startDate: '2024-06-01',
      endDate: '2024-06-04',
      days: ['Monday', 'Tuesday', 'Thursday'],
      startTime: '12:00',
      endTime: '20:00',
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
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    shiftLengthHours: 8,
  },
  {
    id: '2',
    name: 'Security Team',
    requiredSkills: ['Security', 'First Aid', 'Communication'],
    minVolunteers: 6,
    maxVolunteers: 12,
    assignedVolunteers: [],
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    shiftLengthHours: 8,
  },
  {
    id: '3',
    name: 'Food & Beverage',
    requiredSkills: ['Food Service', 'Customer Service', 'Cash Handling'],
    minVolunteers: 8,
    maxVolunteers: 15,
    assignedVolunteers: [],
    shiftStartTime: '08:00',
    shiftEndTime: '16:00',
    shiftLengthHours: 8,
  },
];

const AutoScheduler: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [crews, setCrews] = useState<Crew[]>(mockCrews);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState(0);
  const [schedulingStatus, setSchedulingStatus] = useState<string>('');
  const [festivalDates, setFestivalDates] = useState({
    start: new Date('2024-06-01'),
    end: new Date('2024-06-03'),
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filters, setFilters] = useState({
    crew: '',
    date: '',
    status: '',
  });
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
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

  const validateShiftTimes = (crew: Crew): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    try {
      const [startHours, startMinutes] = crew.shiftStartTime.split(':').map(Number);
      const [endHours, endMinutes] = crew.shiftEndTime.split(':').map(Number);
      
      // Validate time format
      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        errors.push({
          field: 'shiftTimes',
          message: 'Invalid time format. Please use HH:MM format.'
        });
        return errors;
      }

      // Validate time ranges
      if (startHours < 0 || startHours > 23 || endHours < 0 || endHours > 23) {
        errors.push({
          field: 'shiftTimes',
          message: 'Hours must be between 0 and 23.'
        });
      }

      if (startMinutes < 0 || startMinutes > 59 || endMinutes < 0 || endMinutes > 59) {
        errors.push({
          field: 'shiftTimes',
          message: 'Minutes must be between 0 and 59.'
        });
      }

      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;
      const shiftLength = endTime - startTime;

      // Validate shift duration
      if (shiftLength <= 0) {
        errors.push({
          field: 'shiftTimes',
          message: 'End time must be after start time.'
        });
      }

      // Validate shift length matches specified hours
      if (shiftLength !== crew.shiftLengthHours * 60) {
        errors.push({
          field: 'shiftLength',
          message: `Shift length (${shiftLength / 60} hours) does not match specified length (${crew.shiftLengthHours} hours).`
        });
      }

      // Validate minimum shift length
      if (shiftLength < 60) {
        errors.push({
          field: 'shiftLength',
          message: 'Shift length must be at least 1 hour.'
        });
      }

      // Validate maximum shift length
      if (shiftLength > 480) { // 8 hours
        errors.push({
          field: 'shiftLength',
          message: 'Shift length cannot exceed 8 hours.'
        });
      }

    } catch (error) {
      errors.push({
        field: 'shiftTimes',
        message: 'Error validating shift times. Please check the format.'
      });
    }

    return errors;
  };

  const generateShifts = (crew: Crew, festivalDates: { start: Date; end: Date }) => {
    const errors = validateShiftTimes(crew);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage(errors.map(error => error.message).join('\n'));
      setErrorDialogOpen(true);
      return [];
    }

    const shifts: Shift[] = [];
    const currentDate = new Date(festivalDates.start);
    const endDate = new Date(festivalDates.end);

    while (currentDate <= endDate) {
      const [startHours, startMinutes] = crew.shiftStartTime.split(':').map(Number);
      const [endHours, endMinutes] = crew.shiftEndTime.split(':').map(Number);

      const shiftStart = new Date(currentDate);
      shiftStart.setHours(startHours, startMinutes, 0, 0);

      const shiftEnd = new Date(currentDate);
      shiftEnd.setHours(endHours, endMinutes, 0, 0);

      shifts.push({
        id: Math.random().toString(36).substr(2, 9),
        crewId: crew.id,
        startTime: shiftStart,
        endTime: shiftEnd,
        requiredVolunteers: crew.minVolunteers,
        assignedVolunteers: [],
        status: 'open',
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return shifts;
  };

  const handleGenerateShifts = () => {
    const errors: ValidationError[] = [];
    
    // Validate all crews before generating shifts
    crews.forEach(crew => {
      const crewErrors = validateShiftTimes(crew);
      if (crewErrors.length > 0) {
        errors.push(...crewErrors.map(error => ({
          ...error,
          message: `${crew.name}: ${error.message}`
        })));
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage(errors.map(error => error.message).join('\n'));
      setErrorDialogOpen(true);
      return;
    }

    const allShifts: Shift[] = [];
    crews.forEach(crew => {
      const crewShifts = generateShifts(crew, festivalDates);
      allShifts.push(...crewShifts);
    });
    setShifts(allShifts);
  };

  const checkVolunteerAvailability = (volunteer: Volunteer, shift: Shift): boolean => {
    const shiftDate = shift.startTime.toLocaleDateString('en-US', { weekday: 'long' });
    const [shiftStartHours, shiftStartMinutes] = shift.startTime.toLocaleTimeString('en-US', { hour12: false }).split(':').map(Number);
    const [shiftEndHours, shiftEndMinutes] = shift.endTime.toLocaleTimeString('en-US', { hour12: false }).split(':').map(Number);
    const [volunteerStartHours, volunteerStartMinutes] = volunteer.availability.startTime.split(':').map(Number);
    const [volunteerEndHours, volunteerEndMinutes] = volunteer.availability.endTime.split(':').map(Number);

    const shiftStart = shiftStartHours * 60 + shiftStartMinutes;
    const shiftEnd = shiftEndHours * 60 + shiftEndMinutes;
    const volunteerStart = volunteerStartHours * 60 + volunteerStartMinutes;
    const volunteerEnd = volunteerEndHours * 60 + volunteerEndMinutes;

    return (
      volunteer.availability.days.includes(shiftDate) &&
      shiftStart >= volunteerStart &&
      shiftEnd <= volunteerEnd
    );
  };

  const checkShiftConflicts = (volunteer: Volunteer, shift: Shift): boolean => {
    return shifts.some(existingShift => {
      if (existingShift.id === shift.id) return false;
      if (!existingShift.assignedVolunteers.includes(volunteer.id)) return false;

      const existingStart = new Date(existingShift.startTime);
      const existingEnd = new Date(existingShift.endTime);
      const newStart = new Date(shift.startTime);
      const newEnd = new Date(shift.endTime);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const handleAssignVolunteer = (shiftId: string, volunteerId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    const volunteer = volunteers.find(v => v.id === volunteerId);

    if (!shift || !volunteer) return;

    const errors: ValidationError[] = [];

    // Check volunteer availability
    if (!checkVolunteerAvailability(volunteer, shift)) {
      errors.push({
        field: 'availability',
        message: `${volunteer.name} is not available during this shift time.`
      });
    }

    // Check for shift conflicts
    if (checkShiftConflicts(volunteer, shift)) {
      errors.push({
        field: 'conflicts',
        message: `${volunteer.name} has conflicting shifts.`
      });
    }

    // Check if shift is already filled
    if (shift.assignedVolunteers.length >= shift.requiredVolunteers) {
      errors.push({
        field: 'capacity',
        message: 'This shift is already filled.'
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage(errors.map(error => error.message).join('\n'));
      setErrorDialogOpen(true);
      return;
    }

    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        const updatedShift = {
          ...shift,
          assignedVolunteers: [...shift.assignedVolunteers, volunteerId],
          status: shift.assignedVolunteers.length + 1 >= shift.requiredVolunteers ? 'filled' : 'open'
        };
        return updatedShift;
      }
      return shift;
    }));
    setAssignDialogOpen(false);
  };

  const handleRemoveVolunteerFromShift = (shiftId: string, volunteerId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        const updatedShift = {
          ...shift,
          assignedVolunteers: shift.assignedVolunteers.filter(id => id !== volunteerId),
          status: 'open'
        };
        return updatedShift;
      }
      return shift;
    }));
  };

  const handleOpenAssignDialog = (shift: Shift) => {
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  const filteredShifts = shifts.filter(shift => {
    const crew = crews.find(c => c.id === shift.crewId);
    const shiftDate = shift.startTime.toLocaleDateString();
    
    return (
      (!filters.crew || crew?.id === filters.crew) &&
      (!filters.date || shiftDate === filters.date) &&
      (!filters.status || shift.status === filters.status)
    );
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Auto Scheduler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateShifts}
              startIcon={<AutoAwesomeIcon />}
            >
              Generate Shifts
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAutoSchedule}
              startIcon={<AutoAwesomeIcon />}
            >
              Auto Schedule
            </Button>
          </Box>
        </Box>

        {schedulingProgress > 0 && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={schedulingProgress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {schedulingStatus}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Generated Shifts
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Crew</InputLabel>
                    <Select
                      value={filters.crew}
                      label="Crew"
                      onChange={(e) => setFilters(prev => ({ ...prev, crew: e.target.value }))}
                    >
                      <MenuItem value="">All</MenuItem>
                      {crews.map(crew => (
                        <MenuItem key={crew.id} value={crew.id}>{crew.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Date</InputLabel>
                    <Select
                      value={filters.date}
                      label="Date"
                      onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    >
                      <MenuItem value="">All</MenuItem>
                      {[...new Set(shifts.map(shift => shift.startTime.toLocaleDateString()))].map(date => (
                        <MenuItem key={date} value={date}>{date}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="filled">Filled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Crew</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Required Volunteers</TableCell>
                      <TableCell>Assigned Volunteers</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredShifts.map((shift) => {
                      const crew = crews.find(c => c.id === shift.crewId);
                      return (
                        <TableRow key={shift.id}>
                          <TableCell>{crew?.name}</TableCell>
                          <TableCell>{shift.startTime.toLocaleDateString()}</TableCell>
                          <TableCell>{shift.startTime.toLocaleTimeString()}</TableCell>
                          <TableCell>{shift.endTime.toLocaleTimeString()}</TableCell>
                          <TableCell>{shift.requiredVolunteers}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {shift.assignedVolunteers.map(volunteerId => {
                                const volunteer = volunteers.find(v => v.id === volunteerId);
                                return (
                                  <Box key={volunteerId} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{volunteer?.name}</Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveVolunteerFromShift(shift.id, volunteerId)}
                                      color="error"
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={shift.status}
                              color={
                                shift.status === 'filled'
                                  ? 'success'
                                  : shift.status === 'open'
                                  ? 'primary'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenAssignDialog(shift)}
                              disabled={shift.status === 'filled'}
                            >
                              Assign Volunteer
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

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
      </Box>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Volunteer to Shift
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedShift && crews.find(c => c.id === selectedShift.crewId)?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedShift && `${selectedShift.startTime.toLocaleDateString()} ${selectedShift.startTime.toLocaleTimeString()} - ${selectedShift.endTime.toLocaleTimeString()}`}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Volunteer</InputLabel>
              <Select
                label="Select Volunteer"
                onChange={(e) => selectedShift && handleAssignVolunteer(selectedShift.id, e.target.value as string)}
              >
                {volunteers
                  .filter(volunteer => {
                    // Filter out volunteers already assigned to this shift
                    if (selectedShift?.assignedVolunteers.includes(volunteer.id)) return false;
                    
                    // Check if volunteer has required skills
                    const crew = crews.find(c => c.id === selectedShift?.crewId);
                    if (!crew) return false;
                    
                    return crew.requiredSkills.some(skill => volunteer.skills.includes(skill));
                  })
                  .map((volunteer) => (
                    <MenuItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.name} - {volunteer.skills.join(', ')}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)}>
        <DialogTitle>Assignment Conflict</DialogTitle>
        <DialogContent>
          <Typography>{conflictMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Validation Error</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography color="error" gutterBottom>
              Please correct the following issues:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              {validationErrors.map((error, index) => (
                <Typography component="li" key={index} color="error">
                  {error.message}
                </Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AutoScheduler; 