import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Paper, Box, Typography, Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  assigned_to: string | null;
}

interface CalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      return (
        format(eventStart, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ||
        format(eventEnd, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ||
        (eventStart < date && eventEnd > date)
      );
    });
  };

  const renderDay = (date: Date) => {
    const dayEvents = getEventsForDate(date);

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
        }}
      >
        <Typography variant="body2">{format(date, 'd')}</Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {dayEvents.map((event) => (
            <Chip
              key={event.id}
              label={event.title}
              size="small"
              color={
                event.status === 'completed'
                  ? 'success'
                  : event.status === 'filled'
                  ? 'info'
                  : 'warning'
              }
              onClick={() => onEventClick(event)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2 }}>
        <DateCalendar
          sx={{ width: '100%' }}
          slots={{
            day: renderDay,
          }}
          slotProps={{
            day: {
              sx: {
                height: '100px',
                width: '100px',
              },
            },
          }}
        />
      </Paper>
    </LocalizationProvider>
  );
};

export default Calendar; 