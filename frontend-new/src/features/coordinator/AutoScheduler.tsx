import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { festivalService, crewService } from '../../lib/services';
import { Festival } from '../../lib/types/models';
import CheckTableSchema from '../../components/DevHelpers/CheckTableSchema';
import { supabase } from '../../lib/supabaseClient';

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
  festival_id: string;
  name: string;
  description?: string;
  crew_type: string;
  shift_start_time: string;
  shift_end_time: string;
  shift_length_hours: number;
  min_headcount: number;
  max_headcount: number;
  
  // Database field names
  required_skills?: string[] | string;
  
  // UI-specific fields
  operatingStartTime: string;
  operatingEndTime: string;
  minVolunteers: number;
  maxVolunteers: number;
  type?: string;
  shiftLengthHours?: number;
  requiredSkills: string[];
  assignedVolunteers: string[];
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
    operatingStartTime: '08:00',
    operatingEndTime: '20:00',
    shift_length_hours: 4,
    festival_id: '1',
    crew_type: 'Technical',
    shift_start_time: '08:00',
    shift_end_time: '20:00',
    min_headcount: 4,
    max_headcount: 8,
  },
  {
    id: '2',
    name: 'Security Team',
    requiredSkills: ['Security', 'First Aid', 'Communication'],
    minVolunteers: 6,
    maxVolunteers: 12,
    assignedVolunteers: [],
    operatingStartTime: '10:00',
    operatingEndTime: '22:00',
    shift_length_hours: 4,
    festival_id: '1',
    crew_type: 'Security',
    shift_start_time: '10:00',
    shift_end_time: '22:00',
    min_headcount: 6,
    max_headcount: 12,
  },
  {
    id: '3',
    name: 'Food & Beverage',
    requiredSkills: ['Food Service', 'Customer Service', 'Cash Handling'],
    minVolunteers: 8,
    maxVolunteers: 15,
    assignedVolunteers: [],
    operatingStartTime: '08:00',
    operatingEndTime: '20:00',
    shift_length_hours: 4,
    festival_id: '1',
    crew_type: 'Food Service',
    shift_start_time: '08:00',
    shift_end_time: '20:00',
    min_headcount: 8,
    max_headcount: 15,
  },
];

const AutoScheduler: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [crews, setCrews] = useState<Crew[]>([]);
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
  
  // New state for available festivals and the current festival
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Fetch festivals and crews on component mount
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found. Please create a festival first.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // If festivalId is in URL, use that, otherwise use the first festival
        const targetFestivalId = festivalId || data[0].id;
        const festival = data.find(f => f.id === targetFestivalId);
        
        if (festival) {
          setCurrentFestival(festival);
          
          // Parse dates as Date objects to ensure they work correctly
          const startDate = new Date(festival.start_date);
          const endDate = new Date(festival.end_date);
          
          console.log('Setting festival dates:', { 
            start: startDate.toISOString(),
            end: endDate.toISOString()
          });
          
          // Set festival dates for shift generation
          setFestivalDates({
            start: startDate,
            end: endDate
          });
          
          // Now fetch crews for this festival
          await fetchCrews(targetFestivalId);
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);
  
  // Function to fetch crews for a specific festival
  const fetchCrews = async (festivalId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the auth session for direct API call
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      // Use direct fetch API to get crews for this festival
      const apiUrl = `https://ysljpqtpbpugekhrdocq.supabase.co/rest/v1/crews?festival_id=eq.${festivalId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch crews: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        setCrews([]);
        return;
      }
      
      console.log('Raw crew data from DB:', data);
      
      // Map database fields to UI fields
      const mappedCrews = data.map((crew: any) => {
        // Handle required_skills which might be a string if it's stored as JSONB
        // Note the changed field name from requiredSkills to required_skills
        const skillsData = crew.required_skills;
        
        // Parse required_skills which might be a string if it's stored as JSONB
        let parsedRequiredSkills = [];
        try {
          parsedRequiredSkills = typeof skillsData === 'string' 
            ? JSON.parse(skillsData) 
            : (Array.isArray(skillsData) ? skillsData : []);
        } catch (e) {
          console.error('Error parsing required_skills:', e);
          parsedRequiredSkills = [];
        }
        
        // Handle assignedVolunteers which might also be a string if stored as JSONB
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
          // Ensure all required fields are present
          operatingStartTime: crew.shift_start_time,
          operatingEndTime: crew.shift_end_time,
          minVolunteers: crew.min_headcount,
          maxVolunteers: crew.max_headcount,
          // Use our safely parsed values
          requiredSkills: parsedRequiredSkills,
          assignedVolunteers: parsedAssignedVolunteers,
          // Ensure crew_type is set
          crew_type: crew.crew_type || 'General'
        };
      });
      
      console.log('Mapped crews:', mappedCrews);
      setCrews(mappedCrews);
    } catch (err: any) {
      console.error('Error fetching crews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle festival change
  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      // Parse dates as Date objects to ensure they work correctly
      const startDate = new Date(festival.start_date);
      const endDate = new Date(festival.end_date);
      setFestivalDates({
        start: startDate,
        end: endDate
      });
      await fetchCrews(festivalId);
    }
  };

  // Add a function to refresh crews
  const handleRefreshCrews = async () => {
    if (currentFestival) {
      await fetchCrews(currentFestival.id);
    }
  };

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
      const [startHours, startMinutes] = crew.operatingStartTime.split(':').map(Number);
      const [endHours, endMinutes] = crew.operatingEndTime.split(':').map(Number);
      
      // Validate time format
      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        errors.push({
          field: 'operatingTimes',
          message: 'Invalid time format. Please use HH:MM format.'
        });
        return errors;
      }

      // Validate time ranges
      if (startHours < 0 || startHours > 23 || endHours < 0 || endHours > 23) {
        errors.push({
          field: 'operatingTimes',
          message: 'Hours must be between 0 and 23.'
        });
      }

      if (startMinutes < 0 || startMinutes > 59 || endMinutes < 0 || endMinutes > 59) {
        errors.push({
          field: 'operatingTimes',
          message: 'Minutes must be between 0 and 59.'
        });
      }

      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;
      const totalOperatingMinutes = endTime - startTime;
      const shiftLengthMinutes = crew.shift_length_hours * 60;

      // Validate operating period
      if (totalOperatingMinutes <= 0) {
        errors.push({
          field: 'operatingTimes',
          message: 'End time must be after start time.'
        });
      }

      // Validate shift length is less than or equal to total operating time
      if (shiftLengthMinutes > totalOperatingMinutes) {
        errors.push({
          field: 'shiftLength',
          message: `Shift length (${crew.shift_length_hours} hours) cannot be longer than total operating time (${Math.floor(totalOperatingMinutes / 60)} hours and ${totalOperatingMinutes % 60} minutes).`
        });
      }

      // Validate minimum shift length
      if (shiftLengthMinutes < 60) {
        errors.push({
          field: 'shiftLength',
          message: 'Shift length must be at least 1 hour.'
        });
      }

      // Validate maximum shift length
      if (shiftLengthMinutes > 720) { // 12 hours
        errors.push({
          field: 'shiftLength',
          message: 'Shift length cannot exceed 12 hours.'
        });
      }

      // Check if shifts divide evenly into operating time
      if (totalOperatingMinutes % shiftLengthMinutes !== 0) {
        errors.push({
          field: 'shiftLength',
          message: `Warning: Shift length (${crew.shift_length_hours} hours) does not divide evenly into operating time. The last shift will be shorter.`
        });
      }

    } catch (error) {
      errors.push({
        field: 'operatingTimes',
        message: 'Error validating operating times. Please check the format.'
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

    console.log("Generating shifts for dates:", {
      start: festivalDates.start.toISOString(),
      end: festivalDates.end.toISOString()
    });

    const shifts: Shift[] = [];
    // Create a new date object to avoid modifying the original
    const currentDate = new Date(festivalDates.start.getTime());
    const endDate = new Date(festivalDates.end.getTime());

    // Parse crew operating hours
    const [startHours, startMinutes] = crew.operatingStartTime.split(':').map(Number);
    const [endHours, endMinutes] = crew.operatingEndTime.split(':').map(Number);
    
    // Calculate total operating minutes per day
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    const totalOperatingMinutes = endTimeMinutes - startTimeMinutes;
    
    // Calculate shift length in minutes
    const shiftLengthMinutes = crew.shift_length_hours * 60;
    
    // Calculate number of shifts per day
    const shiftsPerDay = Math.floor(totalOperatingMinutes / shiftLengthMinutes);

    console.log(`Generating ${shiftsPerDay} shifts per day from ${currentDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

    // Generate shifts for each day of the festival
    while (currentDate <= endDate) {
      console.log(`Generating shifts for date: ${currentDate.toLocaleDateString()}`);
      // For each day, create multiple shifts based on shift length
      for (let shiftIndex = 0; shiftIndex < shiftsPerDay; shiftIndex++) {
        // Calculate shift start time in minutes from the day start
        const shiftStartMinutes = startTimeMinutes + (shiftIndex * shiftLengthMinutes);
        
        // Calculate shift end time in minutes
        const shiftEndMinutes = Math.min(shiftStartMinutes + shiftLengthMinutes, endTimeMinutes);
        
        // Convert back to hours and minutes
        const shiftStartHours = Math.floor(shiftStartMinutes / 60);
        const shiftStartMins = shiftStartMinutes % 60;
        
        const shiftEndHours = Math.floor(shiftEndMinutes / 60);
        const shiftEndMins = shiftEndMinutes % 60;
        
        // Create Date objects for the shift times
        const shiftStart = new Date(currentDate);
        shiftStart.setHours(shiftStartHours, shiftStartMins, 0, 0);

        const shiftEnd = new Date(currentDate);
        shiftEnd.setHours(shiftEndHours, shiftEndMins, 0, 0);
        
        // Add the shift to our list
        shifts.push({
          id: Math.random().toString(36).substr(2, 9),
          crewId: crew.id,
          startTime: shiftStart,
          endTime: shiftEnd,
          requiredVolunteers: crew.minVolunteers,
          assignedVolunteers: [],
          status: 'open',
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${shifts.length} total shifts`);
    return shifts;
  };

  const handleGenerateShifts = () => {
    if (!currentFestival) {
      setErrorMessage('Please select a festival first');
      setErrorDialogOpen(true);
      return;
    }

    if (crews.length === 0) {
      setErrorMessage('No crews found. Please add crews before generating shifts.');
      setErrorDialogOpen(true);
      return;
    }

    console.log('Generating shifts for festival:', currentFestival.name);
    console.log('Festival dates:', festivalDates);
    console.log('Number of crews:', crews.length);
    
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

    try {
      const allShifts: Shift[] = [];
      crews.forEach(crew => {
        const crewShifts = generateShifts(crew, festivalDates);
        allShifts.push(...crewShifts);
      });
      
      console.log(`Total shifts generated: ${allShifts.length}`);
      setShifts(allShifts);
      
      if (allShifts.length > 0) {
        setSnackbarMessage(`Successfully generated ${allShifts.length} shifts across ${crews.length} crews.`);
        setSnackbarOpen(true);
      } else {
        setErrorMessage('No shifts could be generated. Please check crew operating hours and festival dates.');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error generating shifts:', error);
      setErrorMessage(`Failed to generate shifts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setErrorDialogOpen(true);
    }
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
        const newStatus = shift.assignedVolunteers.length + 1 >= shift.requiredVolunteers 
          ? 'filled' as const 
          : 'open' as const;
        
        return {
          ...shift,
          assignedVolunteers: [...shift.assignedVolunteers, volunteerId],
          status: newStatus
        };
      }
      return shift;
    }));
    setAssignDialogOpen(false);
  };

  const handleRemoveVolunteerFromShift = (shiftId: string, volunteerId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        return {
          ...shift,
          assignedVolunteers: shift.assignedVolunteers.filter(id => id !== volunteerId),
          status: 'open' as const
        };
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
          <Box>
            <Typography variant="h4" component="h1">
              Auto Scheduler
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {availableFestivals.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={currentFestival?.id || ''}
                  label="Festival"
                  onChange={(e) => handleFestivalChange(e.target.value)}
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateShifts}
              startIcon={<AutoAwesomeIcon />}
              disabled={crews.length === 0}
            >
              Generate Shifts
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAutoSchedule}
              startIcon={<AutoAwesomeIcon />}
              disabled={crews.length === 0 || shifts.length === 0}
            >
              Auto Schedule
            </Button>
            <Button
              variant="outlined"
              onClick={handleRefreshCrews}
              disabled={!currentFestival}
            >
              Refresh Crews
            </Button>
            {import.meta.env.MODE === 'development' && (
              <Button
                variant="outlined"
                color="info"
                onClick={() => console.log('Current crews:', crews)}
              >
                Debug: Log Crews
              </Button>
            )}
          </Box>
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
        ) : crews.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3, p: 2 }}>
            No crews found for this festival. Please create crews first in the Crew Management section.
          </Alert>
        ) : (
          <>
            {schedulingProgress > 0 && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress variant="determinate" value={schedulingProgress} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {schedulingStatus}
                </Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              {/* Crew Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Available Crews
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Crew Name</TableCell>
                          <TableCell>Required Skills</TableCell>
                          <TableCell>Operating Hours</TableCell>
                          <TableCell>Shift Length</TableCell>
                          <TableCell>Volunteers</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {crews.map((crew) => (
                          <TableRow key={crew.id}>
                            <TableCell>{crew.name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {crew.requiredSkills.map((skill) => (
                                  <Chip key={skill} label={skill} size="small" />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{crew.operatingStartTime} - {crew.operatingEndTime}</TableCell>
                            <TableCell>{crew.shift_length_hours} hours</TableCell>
                            <TableCell>
                              {crew.assignedVolunteers.length}/{crew.maxVolunteers}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Generated Shifts */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Generated Shifts {shifts.length > 0 ? `(${shifts.length})` : ''}
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
                          {shifts.length > 0 && [...new Set(shifts.map(shift => shift.startTime.toLocaleDateString()))].map(date => (
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
                  
                  {shifts.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No shifts generated yet. Click the "Generate Shifts" button to create shifts for all crews.
                      </Typography>
                    </Box>
                  ) : (
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
                  )}
                </Paper>
              </Grid>

              {/* Volunteer Assignments Section - Keep as is but we'll only show it if there are shifts */}
              {shifts.length > 0 && (
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
              )}
            </Grid>
          </>
        )}

        {/* Add table schema debugger in development mode */}
        {import.meta.env.MODE === 'development' && (
          <CheckTableSchema />
        )}
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

      {/* Success/error notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export { AutoScheduler }; 
