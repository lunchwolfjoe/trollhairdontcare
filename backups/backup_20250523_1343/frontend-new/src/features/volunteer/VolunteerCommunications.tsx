import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';

// Announcement interface (consistent with coordinator version)
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  important: boolean;
  audience: string[];
  festival_id: string;
}

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
      id={`comm-tabpanel-${index}`}
      aria-labelledby={`comm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VolunteerCommunications: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Festival state
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // Use the first festival by default
        const firstFestival = data[0];
        setCurrentFestival(firstFestival);
        
        // Once we have the festival, fetch announcements for it
        fetchAnnouncementsForFestival(firstFestival.id);
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, []);

  const fetchAnnouncementsForFestival = async (festivalId: string) => {
    try {
      setLoading(true);
      
      // Fetch announcements from Supabase
      // RLS policies will automatically filter to only show announcements
      // this volunteer is authorized to see
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('festival_id', festivalId)
        .eq('message_type', 'announcement')
        .order('created_at', { ascending: false });
      
      if (messageError) {
        console.error('Error fetching announcements:', messageError);
        setError('Error loading announcements. Please try again later.');
        return;
      }
      
      // Transform database data to match our Announcement type
      if (messageData && messageData.length > 0) {
        const formattedAnnouncements: Announcement[] = messageData.map(message => ({
          id: message.id,
          title: message.title || 'Announcement',
          content: message.content,
          createdBy: message.sender_name || 'Coordinator',
          createdAt: message.created_at,
          important: message.important || false,
          audience: message.audience || ['all'],
          festival_id: message.festival_id
        }));
        
        setAnnouncements(formattedAnnouncements);
      } else {
        // No announcements found
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error in fetchAnnouncementsForFestival:', err);
      setError('Failed to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      fetchAnnouncementsForFestival(festivalId);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    if (currentFestival) {
      // Load messages for this volunteer
      fetchVolunteerMessages();
    }
  }, [currentFestival, tabValue]);

  const fetchVolunteerMessages = async () => {
    try {
      setMessageLoading(true);
      
      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // First, get the volunteer's info including their crew
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteers')
        .select('id, crew_id')
        .eq('profile_id', userId)
        .eq('festival_id', currentFestival?.id)
        .maybeSingle();
      
      if (volunteerError) {
        console.error('Error fetching volunteer data:', volunteerError);
        // Continue anyway - we'll try to get messages without crew info
      }
      
      console.log('Volunteer data:', volunteerData, 'User ID:', userId);
      
      // Get messages where the current user is either sender or recipient
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      console.log('Fetched messages:', data);
      
      // Transform the data to match our UI format
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_id === userId ? 'You' : 'Coordinator',
        content: msg.content,
        timestamp: msg.created_at,
        isOutgoing: msg.sender_id === userId
      }));
      
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
      } else {
        // If no messages exist, create a welcome message
        setMessages([
          { 
            id: 'welcome',
            sender: 'Coordinator', 
            content: 'Welcome to the Kerrville Folk Festival! How can I help you?', 
            timestamp: new Date().toISOString(), 
            isOutgoing: false 
          }
        ]);
      }
    } catch (err) {
      console.error('Error in fetchVolunteerMessages:', err);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    try {
      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // Get the volunteer's crew_id
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteers')
        .select('id, crew_id')
        .eq('profile_id', userId)
        .eq('festival_id', currentFestival?.id)
        .maybeSingle();
      
      if (volunteerError) {
        console.error('Error fetching volunteer data:', volunteerError);
        // Continue anyway - we'll try to find a coordinator without crew info
      }
      
      const crewId = volunteerData?.crew_id || null;
      const volunteerId = volunteerData?.id || null;
      
      // Find coordinators for this crew
      let coordinatorId = null;
      
      if (crewId) {
        // Get coordinators assigned to this crew
        const { data: crewCoordinatorData, error: crewCoordinatorError } = await supabase
          .from('crew_coordinators')
          .select('coordinator_id')
          .eq('crew_id', crewId)
          .limit(1);
        
        if (!crewCoordinatorError && crewCoordinatorData && crewCoordinatorData.length > 0) {
          coordinatorId = crewCoordinatorData[0].coordinator_id;
        }
      }
      
      // If no specific coordinator found, get the first coordinator
      if (!coordinatorId) {
        const { data: coordinatorData, error: coordinatorError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role_name', 'coordinator')
          .limit(1);
        
        if (!coordinatorError && coordinatorData && coordinatorData.length > 0) {
          coordinatorId = coordinatorData[0].user_id;
        } else {
          // Fallback to a default value if no coordinator is found
          coordinatorId = 'coordinator-placeholder';
        }
      }
      
      console.log('Message will be sent from:', userId, 'to coordinator:', coordinatorId);
      console.log('Volunteer ID:', volunteerId, 'Crew ID:', crewId);
      
      // Create message object for UI update
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isOutgoing: true
      };
      
      // Optimistically update the UI
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Prepare message data for database
      const messageData = {
        sender_id: userId,
        recipient_id: coordinatorId,
        content: newMessage,
        festival_id: currentFestival?.id,
        crew_id: crewId,
        volunteer_id: volunteerId,
        profile_id: userId, // Store the profile ID to ensure we can find the message later
        created_at: message.timestamp,
        is_read: false
      };
      
      console.log('Saving message to database:', messageData);
      
      // Insert the message into the database
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(messageData)
        .select();
      
      if (error) {
        console.error('Error saving message to database:', error);
      } else {
        console.log('Message saved successfully:', data);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Communications
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
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
        ) : (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Announcements & Messages
              </Typography>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="communication tabs">
                  <Tab label="Announcements" />
                  <Tab label="Messages" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">Festival Announcements</Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {announcements.length > 0 ? (
                    announcements.map(announcement => (
                      <Grid item xs={12} key={announcement.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            borderLeft: announcement.important ? '4px solid #f44336' : undefined,
                            backgroundColor: announcement.important ? '#fff8f8' : undefined
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="h6">{announcement.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(announcement.createdAt)}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body1" paragraph>
                              {announcement.content}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Posted by: {announcement.createdBy}
                              </Typography>
                              
                              <Box>
                                {announcement.important && (
                                  <Chip 
                                    label="Important" 
                                    color="error" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    icon={<NotificationsIcon />}
                                  />
                                )}
                                
                                {announcement.audience.includes('all') ? (
                                  <Chip label="All Volunteers" size="small" />
                                ) : (
                                  announcement.audience.map(audience => (
                                    <Chip 
                                      key={audience} 
                                      label={audience.replace('_', ' ')} 
                                      size="small" 
                                      sx={{ mr: 0.5 }} 
                                    />
                                  ))
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1">No announcements available</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Direct Messages
                    </Typography>
                    <IconButton 
                      onClick={fetchVolunteerMessages} 
                      disabled={messageLoading}
                      size="small"
                      color="primary"
                      title="Refresh Messages"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  
                  <Paper variant="outlined" sx={{ flexGrow: 1, mb: 2, p: 2, overflowY: 'auto' }}>
                    {messageLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={30} />
                      </Box>
                    ) : (
                      <List>
                        {messages.map((message, index) => (
                          <React.Fragment key={message.id}>
                            <ListItem alignItems="flex-start" sx={{ 
                              flexDirection: message.isOutgoing ? 'row-reverse' : 'row',
                              mb: 1
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: message.isOutgoing ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 24, 
                                      height: 24, 
                                      mr: message.isOutgoing ? 0 : 1,
                                      ml: message.isOutgoing ? 1 : 0,
                                      bgcolor: message.isOutgoing ? 'primary.main' : 'secondary.main',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    {message.sender.charAt(0)}
                                  </Avatar>
                                  <Typography variant="caption" color="text.secondary">
                                    {message.sender}
                                  </Typography>
                                </Box>
                                
                                <Paper 
                                  elevation={0} 
                                  sx={{ 
                                    p: 1.5, 
                                    borderRadius: 2,
                                    bgcolor: message.isOutgoing ? 'primary.light' : 'grey.100',
                                    color: message.isOutgoing ? 'white' : 'inherit'
                                  }}
                                >
                                  <Typography variant="body2">{message.content}</Typography>
                                </Paper>
                                
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {formatDate(message.timestamp)}
                                </Typography>
                              </Box>
                            </ListItem>
                            {index < messages.length - 1 && (
                              <Box sx={{ my: 1 }}>
                                <Divider variant="middle" />
                              </Box>
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Paper>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={4}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      sx={{ ml: 1, height: 40 }}
                      disabled={newMessage.trim() === '' || messageLoading}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export { VolunteerCommunications }; 