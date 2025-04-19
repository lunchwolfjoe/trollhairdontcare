import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Chip,
  Tooltip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PieChart as ChartIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Group as VolunteersIcon,
  AccessTime as TimeIcon,
  AssignmentTurnedIn as CompletionIcon,
  FindInPage as SearchIcon,
} from '@mui/icons-material';
import { festivalService } from '../../lib/services';
import { Festival, Task, TaskCategory, Volunteer, Profile, Crew, ShiftAssignment, Assignment } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';

// Mock data - will be replaced with Supabase integration
interface VolunteerHours {
  volunteerId: string;
  volunteerName: string;
  crew: string;
  date: string;
  hoursWorked: number;
  shiftsCompleted: number;
  status: 'completed' | 'partial' | 'missed';
}

interface CrewPerformance {
  crewId: string;
  crewName: string;
  totalVolunteers: number;
  shiftsCompleted: number;
  shiftsScheduled: number;
  hoursLogged: number;
  completionRate: number;
}

interface DailySummary {
  totalVolunteers: number;
  totalHours: number;
  completedShifts: number;
  pendingShifts: number;
  tasks: Record<string, number>;
}

const mockVolunteerHours: VolunteerHours[] = [
  {
    volunteerId: '1',
    volunteerName: 'John Doe',
    crew: 'Stage Crew',
    date: '2025-06-15',
    hoursWorked: 8,
    shiftsCompleted: 1,
    status: 'completed',
  },
  {
    volunteerId: '2',
    volunteerName: 'Jane Smith',
    crew: 'Security',
    date: '2025-06-15',
    hoursWorked: 6,
    shiftsCompleted: 1,
    status: 'completed',
  },
  {
    volunteerId: '3',
    volunteerName: 'Mike Johnson',
    crew: 'Food Service',
    date: '2025-06-15',
    hoursWorked: 4,
    shiftsCompleted: 0,
    status: 'partial',
  },
  {
    volunteerId: '4',
    volunteerName: 'Sarah Wilson',
    crew: 'Ticketing',
    date: '2025-06-16',
    hoursWorked: 8,
    shiftsCompleted: 1,
    status: 'completed',
  },
  {
    volunteerId: '5',
    volunteerName: 'David Brown',
    crew: 'Medical',
    date: '2025-06-16',
    hoursWorked: 0,
    shiftsCompleted: 0,
    status: 'missed',
  },
  {
    volunteerId: '1',
    volunteerName: 'John Doe',
    crew: 'Stage Crew',
    date: '2025-06-16',
    hoursWorked: 8,
    shiftsCompleted: 1,
    status: 'completed',
  },
  {
    volunteerId: '2',
    volunteerName: 'Jane Smith',
    crew: 'Security',
    date: '2025-06-16',
    hoursWorked: 8,
    shiftsCompleted: 1,
    status: 'completed',
  },
  {
    volunteerId: '3',
    volunteerName: 'Mike Johnson',
    crew: 'Food Service',
    date: '2025-06-16',
    hoursWorked: 0,
    shiftsCompleted: 0,
    status: 'missed',
  },
];

const mockCrewPerformance: CrewPerformance[] = [
  {
    crewId: '1',
    crewName: 'Stage Crew',
    totalVolunteers: 12,
    shiftsCompleted: 22,
    shiftsScheduled: 24,
    hoursLogged: 176,
    completionRate: 0.92,
  },
  {
    crewId: '2',
    crewName: 'Security',
    totalVolunteers: 18,
    shiftsCompleted: 33,
    shiftsScheduled: 36,
    hoursLogged: 264,
    completionRate: 0.92,
  },
  {
    crewId: '3',
    crewName: 'Food Service',
    totalVolunteers: 15,
    shiftsCompleted: 24,
    shiftsScheduled: 30,
    hoursLogged: 192,
    completionRate: 0.80,
  },
  {
    crewId: '4',
    crewName: 'Ticketing',
    totalVolunteers: 8,
    shiftsCompleted: 14,
    shiftsScheduled: 16,
    hoursLogged: 112,
    completionRate: 0.88,
  },
  {
    crewId: '5',
    crewName: 'Medical',
    totalVolunteers: 6,
    shiftsCompleted: 10,
    shiftsScheduled: 12,
    hoursLogged: 80,
    completionRate: 0.83,
  },
];

const mockDailySummaries: DailySummary[] = [
  {
    totalVolunteers: 45,
    totalHours: 348,
    completedShifts: 42,
    pendingShifts: 3,
    tasks: {
      completed: 86,
      inProgress: 12,
      notStarted: 2,
    },
  },
  {
    totalVolunteers: 48,
    totalHours: 368,
    completedShifts: 40,
    pendingShifts: 8,
    tasks: {
      completed: 78,
      inProgress: 18,
      notStarted: 4,
    },
  },
  {
    totalVolunteers: 50,
    totalHours: 392,
    completedShifts: 46,
    pendingShifts: 4,
    tasks: {
      completed: 92,
      inProgress: 6,
      notStarted: 2,
    },
  },
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportingAnalytics: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>([]);
  const [crewPerformance, setCrewPerformance] = useState<CrewPerformance[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [crewFilter, setCrewFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Fetch report data for this festival 
          fetchReportDataForFestival(festival.id);
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

  const fetchReportDataForFestival = async (festivalId: string) => {
    console.log(`Fetching report data for festival: ${festivalId}`);
    setLoading(true);
    setError(null);
    
    // Reset data to ensure we don't see old data
    setVolunteerHours([]);
    setCrewPerformance([]);
    setDailySummaries([]);
    
    try {
      // Fetch volunteers with profiles
      const { data: festivalVolunteers, error: volError } = await supabase
        .from('volunteers')
        .select('id, profiles!inner(*)') 
        .eq('festival_id', festivalId);
      if (volError) throw new Error(`Volunteers: ${volError.message}`);
      const festivalVolunteerIds = festivalVolunteers?.map(v => v.id) || [];
      if (festivalVolunteerIds.length === 0) {
        setError("No volunteers found for this festival");
        setLoading(false);
        return;
      }

      // Fetch crew memberships
      const { data: crewMembersData, error: cmError } = await supabase
        .from('crew_members') 
        .select('volunteer_id, crew_id') 
        .in('volunteer_id', festivalVolunteerIds);
      if (cmError) console.error('Crew Members Error:', cmError);

      // Fetch crews
      const { data: crewsData, error: crewError } = await supabase
        .from('crews')
        .select('id, name')
        .eq('festival_id', festivalId);
      if (crewError) console.error('Crews Error:', crewError);

      // Fetch assignments
      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignments') 
        .select('volunteer_id, crew_id, start_time, end_time, status') 
        .in('volunteer_id', festivalVolunteerIds);
      if (assignError) console.error('Assignments Error:', assignError);
      
      // Cast assignments data safely
      const typedAssignments: Assignment[] = (assignmentsData || []) as Assignment[];

      // Process volunteer hours - ensure data exists and types match
      const processedVolunteerHours = festivalVolunteers?.map(volunteer => {
        const profile = volunteer.profiles as Profile | null;
        const volunteerName = profile?.full_name || 'Unknown';
        const volunteerCrewMember = crewMembersData?.find(cm => cm?.volunteer_id === volunteer.id);
        let crewName = 'Unassigned';
        if (volunteerCrewMember) {
          const crew = crewsData?.find(c => c.id === volunteerCrewMember.crew_id);
          crewName = crew?.name || 'Unassigned';
        }
        const volunteerAssignments = typedAssignments.filter(a => a?.volunteer_id === volunteer.id);
        const completedAssignments = volunteerAssignments.filter(a => a?.status === 'completed');
        
        let status: VolunteerHours['status'] = 'missed'; 
        if (completedAssignments.length > 0 && completedAssignments.length === volunteerAssignments.length) {
            status = 'completed';
        } else if (completedAssignments.length > 0) {
            status = 'partial';
        }

        return {
          volunteerId: volunteer.id,
          volunteerName: volunteerName,
          crew: crewName,
          date: new Date().toISOString().split('T')[0], // Use current date as placeholder
          hoursWorked: completedAssignments.reduce((total, assignment) => { 
            if (!assignment || !assignment.start_time || !assignment.end_time) return total;
            const start = new Date(assignment.start_time).getTime();
            const end = new Date(assignment.end_time).getTime();
            if (isNaN(start) || isNaN(end)) return total; 
            const hours = (end - start) / (1000 * 60 * 60);
            return total + hours;
          }, 0),
          shiftsCompleted: completedAssignments.length,
          status: status,
        };
      }) || [];
      // Ensure the final array matches VolunteerHours[] type
      setVolunteerHours(processedVolunteerHours as VolunteerHours[]); 
      
      // Process crew performance - ensure data exists and types match
      const processedCrewPerformance = crewsData?.map(crew => {
        // Check if typedAssignments exists before filtering
        const crewAssignments = typedAssignments?.filter(a => a?.crew_id === crew.id) || [];
        const completedCrewAssignments = crewAssignments.filter(a => a?.status === 'completed');
        const crewMembers = crewMembersData?.filter(cm => cm?.crew_id === crew.id) || [];
        const totalVolunteers = crewMembers.length;

        return {
          crewId: crew.id,
          crewName: crew.name,
          totalVolunteers: totalVolunteers,
          shiftsCompleted: completedCrewAssignments.length,
          shiftsScheduled: crewAssignments.length,
          hoursLogged: completedCrewAssignments.reduce((total, assignment) => {
             if (!assignment || !assignment.start_time || !assignment.end_time) return total;
             const start = new Date(assignment.start_time).getTime();
             const end = new Date(assignment.end_time).getTime();
             if (isNaN(start) || isNaN(end)) return total;
             const hours = (end - start) / (1000 * 60 * 60);
             return total + hours;
          }, 0),
          completionRate: crewAssignments.length > 0 
            ? completedCrewAssignments.length / crewAssignments.length
            : 0
        };
      }) || [];
      // Ensure final array matches CrewPerformance[]
      setCrewPerformance(processedCrewPerformance as CrewPerformance[]); 

      // Process daily summaries - ensure data exists
      const today = new Date().toISOString().split('T')[0];
      // Check if typedAssignments exists before filtering
      const todayAssignments = typedAssignments?.filter(a => a?.start_time?.startsWith(today)) || [];
      const dailySummary: DailySummary = {
        totalVolunteers: new Set(todayAssignments.map(a => a?.volunteer_id)).size,
        totalHours: Math.round(todayAssignments.reduce((acc, a) => {
          if (!a || !a.start_time || !a.end_time) return acc;
          const start = new Date(a.start_time).getTime();
          const end = new Date(a.end_time).getTime();
          if (isNaN(start) || isNaN(end)) return acc;
          const hours = (end - start) / (1000 * 60 * 60);
          return acc + hours;
        }, 0)),
        completedShifts: todayAssignments.filter(a => a?.status === 'completed').length,
        pendingShifts: todayAssignments.filter(a => a?.status === 'scheduled' || a?.status === 'in_progress').length,
        tasks: { completed: 0, inProgress: 0, notStarted: 0 }, // Placeholder Task data
      };
      setDailySummaries([dailySummary]);

    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchReportDataForFestival(festival.id);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    // This would generate and download a CSV file
    alert('CSV export functionality would be implemented here');
    
    // Example implementation:
    // const csvContent = generateCSV();
    // const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.setAttribute('download', `volunteer-report-${new Date().toISOString().split('T')[0]}.csv`);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    // This would open a print dialog with formatted report
    alert('Print report functionality would be implemented here');
    
    // Example implementation:
    // window.print();
  };

  const handleShareReport = () => {
    // This would generate a shareable link or email the report
    alert('Share report functionality would be implemented here');
  };

  const getFilteredVolunteerHours = () => {
    return volunteerHours.filter(record => {
      let includeRecord = true;
      
      if (dateFilter && record.date !== dateFilter) {
        includeRecord = false;
      }
      
      if (crewFilter && record.crew !== crewFilter) {
        includeRecord = false;
      }
      
      if (statusFilter && record.status !== statusFilter) {
        includeRecord = false;
      }
      
      return includeRecord;
    });
  };

  const filteredHours = getFilteredVolunteerHours();
  
  // Calculate summary statistics
  const totalHours = filteredHours.reduce((sum, record) => sum + record.hoursWorked, 0);
  const totalShifts = filteredHours.reduce((sum, record) => sum + record.shiftsCompleted, 0);
  const completionRate = crewPerformance.reduce(
    (sum, crew) => sum + crew.completionRate, 
    0
  ) / crewPerformance.length;
  
  const uniqueVolunteers = [...new Set(filteredHours.map(record => record.volunteerId))].length;
  const uniqueDates = [...new Set(volunteerHours.map(record => record.date))];
  const uniqueCrews = [...new Set(volunteerHours.map(record => record.crew))];

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs>
              <Typography variant="h4">Reporting & Analytics</Typography>
              {currentFestival && (
                <Typography variant="subtitle1" color="text.secondary">
                  Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary">
                Track volunteer hours, crew performance, and festival metrics
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1} alignItems="center">
                {availableFestivals.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 200, mr: 1 }}>
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
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReport}
                >
                  Print
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ShareIcon />}
                  onClick={handleShareReport}
                >
                  Share
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline" gutterBottom>
                    Total Hours
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4">{totalHours}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {uniqueDates.length} festival days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline" gutterBottom>
                    Active Volunteers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VolunteersIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4">{uniqueVolunteers}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Across {uniqueCrews.length} crews
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline" gutterBottom>
                    Shifts Completed
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CompletionIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4">{totalShifts}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(totalShifts / uniqueVolunteers * 10) / 10} shifts per volunteer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4">{(completionRate * 100).toFixed(1)}%</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(totalHours / uniqueVolunteers * 10) / 10} hours per volunteer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
              <Tab label="Volunteer Hours" />
              <Tab label="Crew Performance" />
              <Tab label="Daily Summaries" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Date</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date"
                  onChange={(e) => setDateFilter(e.target.value as string)}
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Dates</MenuItem>
                  {uniqueDates.map(date => (
                    <MenuItem key={date} value={date}>{formatDate(date)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Crew</InputLabel>
                <Select
                  value={crewFilter}
                  label="Crew"
                  onChange={(e) => setCrewFilter(e.target.value as string)}
                >
                  <MenuItem value="">All Crews</MenuItem>
                  {uniqueCrews.map(crew => (
                    <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as string)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setDateFilter('');
                  setCrewFilter('');
                  setStatusFilter('');
                }}
                sx={{ ml: 'auto' }}
              >
                Reset Filters
              </Button>
            </Box>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="volunteer hours table">
                <TableHead>
                  <TableRow>
                    <TableCell>Volunteer</TableCell>
                    <TableCell>Crew</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Shifts</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHours
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record, index) => (
                      <TableRow key={`${record.volunteerId}-${record.date}-${index}`} hover>
                        <TableCell>{record.volunteerName}</TableCell>
                        <TableCell>{record.crew}</TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell align="right">{record.hoursWorked}</TableCell>
                        <TableCell align="right">{record.shiftsCompleted}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)} 
                            color={
                              record.status === 'completed' 
                                ? 'success' 
                                : record.status === 'partial' 
                                  ? 'warning' 
                                  : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredHours.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">No records found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredHours.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="crew performance table">
                <TableHead>
                  <TableRow>
                    <TableCell>Crew</TableCell>
                    <TableCell align="right">Volunteers</TableCell>
                    <TableCell align="right">Shifts Completed</TableCell>
                    <TableCell align="right">Shifts Scheduled</TableCell>
                    <TableCell align="right">Hours Logged</TableCell>
                    <TableCell align="right">Completion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {crewPerformance.map((crew) => (
                    <TableRow key={crew.crewId} hover>
                      <TableCell component="th" scope="row">
                        {crew.crewName}
                      </TableCell>
                      <TableCell align="right">{crew.totalVolunteers}</TableCell>
                      <TableCell align="right">{crew.shiftsCompleted}</TableCell>
                      <TableCell align="right">{crew.shiftsScheduled}</TableCell>
                      <TableCell align="right">{crew.hoursLogged}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${(crew.completionRate * 100).toFixed(1)}%`} 
                          color={
                            crew.completionRate >= 0.9 
                              ? 'success' 
                              : crew.completionRate >= 0.75 
                                ? 'warning' 
                                : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {dailySummaries.length > 0 ? (
              <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Today's Summary</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4">{dailySummaries[0].totalVolunteers}</Typography>
                      <Typography variant="body2">Active Volunteers</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4">{dailySummaries[0].totalHours}</Typography>
                      <Typography variant="body2">Hours Logged</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4">{dailySummaries[0].completedShifts}</Typography>
                      <Typography variant="body2">Completed Shifts</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4">{dailySummaries[0].pendingShifts}</Typography>
                      <Typography variant="body2">Pending Shifts</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Task Breakdown</Typography>
                    <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                      <Grid container spacing={1}>
                        {Object.entries(dailySummaries[0].tasks).length > 0 ? (
                          Object.entries(dailySummaries[0].tasks).map(([task, count]) => (
                            <React.Fragment key={task}>
                              <Grid item xs={6}>
                                <Typography variant="body1">{task}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body1" align="right">{count}</Typography>
                              </Grid>
                            </React.Fragment>
                          ))
                        ) : (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">No tasks recorded</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ) : (
              <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
                <Typography variant="body1">No data available for today</Typography>
              </Paper>
            )}
          </TabPanel>
        </Paper>
      )}
      
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Reporting analytics show real-time data based on the selected festival.
        </Typography>
      </Box>
    </Container>
  );
};

export { ReportingAnalytics }; 
