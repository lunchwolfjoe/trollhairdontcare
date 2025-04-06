import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Chip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// Mock data for skills - replace with actual data from backend
const availableSkills = [
  'Stage Setup',
  'Sound Equipment',
  'Security',
  'First Aid',
  'Food Service',
  'Customer Service',
  'Technical Support',
  'Event Planning',
];

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface AvailabilityPeriod {
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  recurringDays: string[];
}

interface VolunteerPreferences {
  skills: string[];
  availabilityPeriods: AvailabilityPeriod[];
}

const VolunteerAvailability: React.FC = () => {
  const [preferences, setPreferences] = useState<VolunteerPreferences>({
    skills: [],
    availabilityPeriods: [
      {
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        recurringDays: [],
      },
    ],
  });

  const handleSkillToggle = (skill: string) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleDateChange = (periodIndex: number, field: keyof AvailabilityPeriod, value: Date | null) => {
    setPreferences(prev => ({
      ...prev,
      availabilityPeriods: prev.availabilityPeriods.map((period, index) =>
        index === periodIndex ? { ...period, [field]: value } : period
      ),
    }));
  };

  const handleDayToggle = (periodIndex: number, day: string) => {
    setPreferences(prev => ({
      ...prev,
      availabilityPeriods: prev.availabilityPeriods.map((period, index) =>
        index === periodIndex
          ? {
              ...period,
              recurringDays: period.recurringDays.includes(day)
                ? period.recurringDays.filter(d => d !== day)
                : [...period.recurringDays, day],
            }
          : period
      ),
    }));
  };

  const addPeriod = () => {
    setPreferences(prev => ({
      ...prev,
      availabilityPeriods: [
        ...prev.availabilityPeriods,
        {
          startDate: null,
          endDate: null,
          startTime: null,
          endTime: null,
          recurringDays: [],
        },
      ],
    }));
  };

  const removePeriod = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      availabilityPeriods: prev.availabilityPeriods.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement API call to save preferences
      console.log('Saving preferences:', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Set Your Availability
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {availableSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onClick={() => handleSkillToggle(skill)}
                  color={preferences.skills.includes(skill) ? 'primary' : 'default'}
                  variant={preferences.skills.includes(skill) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Availability Periods
            </Typography>

            {preferences.availabilityPeriods.map((period, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={period.startDate}
                      onChange={(date) => handleDateChange(index, 'startDate', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={period.endDate}
                      onChange={(date) => handleDateChange(index, 'endDate', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Start Time"
                      value={period.startTime}
                      onChange={(time) => handleDateChange(index, 'startTime', time)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="End Time"
                      value={period.endTime}
                      onChange={(time) => handleDateChange(index, 'endTime', time)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Recurring Days
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {weekDays.map((day) => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              checked={period.recurringDays.includes(day)}
                              onChange={() => handleDayToggle(index, day)}
                            />
                          }
                          label={day}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
                {preferences.availabilityPeriods.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removePeriod(index)}
                    >
                      Remove Period
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={addPeriod}>
                Add Another Period
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Save Availability
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default VolunteerAvailability; 