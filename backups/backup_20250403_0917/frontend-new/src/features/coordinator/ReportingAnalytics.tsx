import React, { useState, useEffect } from 'react';
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
  date: string;
  totalVolunteers: number;
  totalHours: number;
  completedShifts: number;
  missedShifts: number;
  tasks: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
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
    date: '2025-06-15',
    totalVolunteers: 45,
    totalHours: 348,
    completedShifts: 42,
    missedShifts: 3,
    tasks: {
      completed: 86,
      inProgress: 12,
      notStarted: 2,
    },
  },
  {
    date: '2025-06-16',
    totalVolunteers: 48,
    totalHours: 368,
    completedShifts: 40,
    missedShifts: 8,
    tasks: {
      completed: 78,
      inProgress: 18,
      notStarted: 4,
    },
  },
  {
    date: '2025-06-17',
    totalVolunteers: 50,
    totalHours: 392,
    completedShifts: 46,
    missedShifts: 4,
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
  const [tabValue, setTabValue] = useState(0);
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>(mockVolunteerHours);
  const [crewPerformance, setCrewPerformance] = useState<CrewPerformance[]>(mockCrewPerformance);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(mockDailySummaries);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [crewFilter, setCrewFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Effect to mimic data fetching from Supabase
  useEffect(() => {
    // This would be replaced with:
    // const fetchReportData = async () => {
    //   const { data: hoursData, error: hoursError } = await supabase
    //     .from('volunteer_hours')
    //     .select('*, volunteers(*)')
    //     .order('date', { ascending: false });
    //   
    //   if (hoursError) {
    //     console.error('Error fetching volunteer hours:', hoursError);
    //     return;
    //   }
    //   
    //   setVolunteerHours(hoursData);
    //   
    //   // Additional queries for other data...
    // };
    // fetchReportData();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs>
            <Typography variant="h4">Reporting & Analytics</Typography>
            <Typography variant="body1" color="text.secondary">
              Track volunteer hours, crew performance, and festival metrics
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
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
          <Grid container spacing={3}>
            {dailySummaries.map((summary) => (
              <Grid item xs={12} md={4} key={summary.date}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {formatDate(summary.date)}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Volunteers:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {summary.totalVolunteers}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hours Logged:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {summary.totalHours}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Shifts Completed:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {summary.completedShifts}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Shifts Missed:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {summary.missedShifts}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Task Completion:
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Tooltip title="Completed Tasks">
                          <Chip 
                            label={summary.tasks.completed} 
                            color="success" 
                            size="small" 
                            sx={{ width: '100%' }}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={4}>
                        <Tooltip title="In Progress Tasks">
                          <Chip 
                            label={summary.tasks.inProgress} 
                            color="warning" 
                            size="small" 
                            sx={{ width: '100%' }}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={4}>
                        <Tooltip title="Not Started Tasks">
                          <Chip 
                            label={summary.tasks.notStarted} 
                            color="error" 
                            size="small" 
                            sx={{ width: '100%' }}
                          />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Note: This reporting tool currently shows mock data. Integration with Supabase will provide real-time volunteer hours and performance metrics.
        </Typography>
      </Box>
    </Container>
  );
};

export default ReportingAnalytics; 