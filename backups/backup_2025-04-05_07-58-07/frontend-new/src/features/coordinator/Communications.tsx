import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tab,
  Tabs,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonSearch as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';

// Mock data - will be replaced with Supabase integration
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  important: boolean;
  audience: string[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to Summer Festival 2025',
    content: 'Thank you for volunteering! Please check in at the volunteer tent when you arrive.',
    createdBy: 'Festival Coordinator',
    createdAt: '2025-04-01T09:00:00Z',
    important: true,
    audience: ['all'],
  },
  {
    id: '2',
    title: 'Schedule Changes',
    content: 'Due to weather concerns, some shifts have been adjusted. Please check your schedules.',
    createdBy: 'Stage Manager',
    createdAt: '2025-04-02T14:30:00Z',
    important: true,
    audience: ['stage_crew', 'security'],
  },
  {
    id: '3',
    title: 'Food Service Update',
    content: 'Volunteer meals will be served from 11:00 AM to 8:00 PM at the catering tent.',
    createdBy: 'Food Service Coordinator',
    createdAt: '2025-04-03T10:15:00Z',
    important: false,
    audience: ['all'],
  }
];

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Volunteer',
    avatar: undefined,
    lastMessage: 'What time should I arrive tomorrow?',
    lastMessageTime: '2025-04-03T18:30:00Z',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Security Lead',
    avatar: undefined,
    lastMessage: 'I need two more volunteers for the main stage.',
    lastMessageTime: '2025-04-03T15:45:00Z',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Medical Staff',
    avatar: undefined,
    lastMessage: 'First aid kit inventory is complete.',
    lastMessageTime: '2025-04-02T14:20:00Z',
    unreadCount: 0,
  }
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '101',
      senderId: '1',
      senderName: 'John Doe',
      recipientId: 'current-user',
      recipientName: 'Coordinator',
      content: 'Hi, I had a question about tomorrow\'s shift.',
      timestamp: '2025-04-03T18:20:00Z',
      read: true,
    },
    {
      id: '102',
      senderId: 'current-user',
      senderName: 'Coordinator',
      recipientId: '1',
      recipientName: 'John Doe',
      content: 'Sure, what would you like to know?',
      timestamp: '2025-04-03T18:25:00Z',
      read: true,
    },
    {
      id: '103',
      senderId: '1',
      senderName: 'John Doe',
      recipientId: 'current-user',
      recipientName: 'Coordinator',
      content: 'What time should I arrive tomorrow?',
      timestamp: '2025-04-03T18:30:00Z',
      read: false,
    },
    {
      id: '104',
      senderId: '1',
      senderName: 'John Doe',
      recipientId: 'current-user',
      recipientName: 'Coordinator',
      content: 'Also, is there parking available?',
      timestamp: '2025-04-03T18:31:00Z',
      read: false,
    }
  ],
  '2': [
    {
      id: '201',
      senderId: '2',
      senderName: 'Jane Smith',
      recipientId: 'current-user',
      recipientName: 'Coordinator',
      content: 'Hello, we have a situation at the main stage.',
      timestamp: '2025-04-03T15:40:00Z',
      read: true,
    },
    {
      id: '202',
      senderId: 'current-user',
      senderName: 'Coordinator',
      recipientId: '2',
      recipientName: 'Jane Smith',
      content: 'What\'s happening?',
      timestamp: '2025-04-03T15:42:00Z',
      read: true,
    },
    {
      id: '203',
      senderId: '2',
      senderName: 'Jane Smith',
      recipientId: 'current-user',
      recipientName: 'Coordinator',
      content: 'I need two more volunteers for the main stage.',
      timestamp: '2025-04-03T15:45:00Z',
      read: true,
    }
  ]
};

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

const Communications: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    important: false,
    audience: ['all']
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
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
          // Once we have the festival, fetch announcements and other data for it
          fetchAnnouncementsForFestival(targetFestivalId);
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

  const fetchAnnouncementsForFestival = async (festivalId: string) => {
    // In a real app, this would fetch announcements from Supabase for the specific festival
    // For now, we'll just use the mock data but log that we're fetching for a specific festival
    console.log(`Fetching announcements for festival: ${festivalId}`);
    
    // This would be the actual implementation:
    // const { data, error } = await supabase
    //   .from('announcements')
    //   .select('*')
    //   .eq('festival_id', festivalId)
    //   .order('created_at', { ascending: false });
    // 
    // if (error) {
    //   console.error('Error fetching announcements:', error);
    //   return;
    // }
    // 
    // setAnnouncements(data);
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

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Mark messages as read
    if (messages[contact.id]) {
      const updatedMessages = {
        ...messages,
        [contact.id]: messages[contact.id].map(msg => 
          msg.senderId === contact.id && !msg.read 
            ? { ...msg, read: true } 
            : msg
        )
      };
      setMessages(updatedMessages);
      
      // Update unread count
      setContacts(prevContacts => 
        prevContacts.map(c => 
          c.id === contact.id 
            ? { ...c, unreadCount: 0 } 
            : c
        )
      );
      
      // This would include Supabase update:
      // const markAsRead = async () => {
      //   const { error } = await supabase
      //     .from('messages')
      //     .update({ read: true })
      //     .eq('recipient_id', 'current-user')
      //     .eq('sender_id', contact.id)
      //     .eq('read', false);
      //   if (error) {
      //     console.error('Error marking messages as read:', error);
      //   }
      // };
      // markAsRead();
    }
  };

  const handleSendMessage = () => {
    if (!selectedContact || !newMessage.trim()) return;
    
    const timestamp = new Date().toISOString();
    const newMsg: Message = {
      id: `new-${timestamp}`,
      senderId: 'current-user',
      senderName: 'Coordinator',
      recipientId: selectedContact.id,
      recipientName: selectedContact.name,
      content: newMessage,
      timestamp,
      read: false
    };
    
    // Update local state
    const contactMessages = messages[selectedContact.id] || [];
    setMessages({
      ...messages,
      [selectedContact.id]: [...contactMessages, newMsg]
    });
    
    // Update contact's last message
    setContacts(prevContacts => 
      prevContacts.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastMessage: newMessage, lastMessageTime: timestamp } 
          : c
      )
    );
    
    setNewMessage('');
    
    // This would include Supabase insert:
    // const sendMessage = async () => {
    //   const { error } = await supabase
    //     .from('messages')
    //     .insert([{
    //       sender_id: 'current-user',
    //       recipient_id: selectedContact.id,
    //       content: newMessage,
    //       read: false
    //     }]);
    //   if (error) {
    //     console.error('Error sending message:', error);
    //   }
    // };
    // sendMessage();
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    
    const timestamp = new Date().toISOString();
    const newAnnouncementObj: Announcement = {
      id: `new-${timestamp}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      createdBy: 'Coordinator',
      createdAt: timestamp,
      important: newAnnouncement.important,
      audience: newAnnouncement.audience
    };
    
    setAnnouncements([newAnnouncementObj, ...announcements]);
    setDialogOpen(false);
    setNewAnnouncement({
      title: '',
      content: '',
      important: false,
      audience: ['all']
    });
    
    setSnackbarMessage('Announcement created successfully');
    setSnackbarOpen(true);
    
    // This would include Supabase insert:
    // const createAnnouncement = async () => {
    //   const { error } = await supabase
    //     .from('announcements')
    //     .insert([{
    //       title: newAnnouncement.title,
    //       content: newAnnouncement.content,
    //       important: newAnnouncement.important,
    //       audience: newAnnouncement.audience,
    //       created_by: 'current-user'
    //     }]);
    //   if (error) {
    //     console.error('Error creating announcement:', error);
    //   }
    // };
    // createAnnouncement();
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
        ) : (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                Communications
              </Typography>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="communication tabs">
                  <Tab label="Announcements" />
                  <Tab label="Messages" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">Festival Announcements</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setDialogOpen(true)}
                  >
                    New Announcement
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {announcements.map(announcement => (
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
                  ))}
                  
                  {announcements.length === 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1">No announcements available</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ height: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Contacts</Typography>
                        <IconButton size="small">
                          <RefreshIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ p: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Search contacts..."
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      
                      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                        {contacts.map((contact) => (
                          <React.Fragment key={contact.id}>
                            <ListItem 
                              button 
                              selected={selectedContact?.id === contact.id}
                              onClick={() => handleContactSelect(contact)}
                            >
                              <ListItemAvatar>
                                <Badge
                                  badgeContent={contact.unreadCount}
                                  color="primary"
                                  invisible={contact.unreadCount === 0}
                                >
                                  <Avatar src={contact.avatar}>
                                    {contact.name.charAt(0)}
                                  </Avatar>
                                </Badge>
                              </ListItemAvatar>
                              <ListItemText
                                primary={contact.name}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: '180px' }}
                                  >
                                    {contact.lastMessage || `${contact.role}`}
                                  </Typography>
                                }
                              />
                              {contact.lastMessageTime && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(contact.lastMessageTime)}
                                </Typography>
                              )}
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Paper variant="outlined" sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                      {selectedContact ? (
                        <>
                          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={selectedContact.avatar} sx={{ mr: 1 }}>
                                {selectedContact.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6">{selectedContact.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedContact.role}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box>
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <PhoneIcon />
                              </IconButton>
                              <IconButton size="small">
                                <EmailIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {messages[selectedContact.id]?.map((message) => (
                              <Box
                                key={message.id}
                                sx={{
                                  display: 'flex',
                                  justifyContent: message.senderId === 'current-user' ? 'flex-end' : 'flex-start',
                                  mb: 2
                                }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: '70%',
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: message.senderId === 'current-user' ? 'primary.light' : 'grey.100',
                                    color: message.senderId === 'current-user' ? 'white' : 'inherit'
                                  }}
                                >
                                  <Typography variant="body1">{message.content}</Typography>
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                                    {formatDate(message.timestamp)}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                            
                            {!messages[selectedContact.id] || messages[selectedContact.id].length === 0 ? (
                              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  No messages yet. Start a conversation!
                                </Typography>
                              </Box>
                            ) : null}
                          </Box>
                          
                          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                            <TextField
                              fullWidth
                              placeholder="Type a message..."
                              variant="outlined"
                              size="small"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              endIcon={<SendIcon />}
                              onClick={handleSendMessage}
                              sx={{ ml: 1 }}
                              disabled={!newMessage.trim()}
                            >
                              Send
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="body1" color="text.secondary">
                            Select a contact to start messaging
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>
            
            {/* Dialog for creating new announcement */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    variant="outlined"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Content"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    sx={{ mb: 3 }}
                  />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Target Audience</InputLabel>
                        <Select
                          multiple
                          value={newAnnouncement.audience}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value as string[] })}
                          label="Target Audience"
                        >
                          <MenuItem value="all">All Volunteers</MenuItem>
                          <MenuItem value="stage_crew">Stage Crew</MenuItem>
                          <MenuItem value="security">Security</MenuItem>
                          <MenuItem value="medical">Medical Staff</MenuItem>
                          <MenuItem value="food_service">Food Service</MenuItem>
                          <MenuItem value="ticketing">Ticketing</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl>
                        <Chip
                          label="Mark as Important"
                          color={newAnnouncement.important ? 'error' : 'default'}
                          onClick={() => setNewAnnouncement({ ...newAnnouncement, important: !newAnnouncement.important })}
                          icon={<NotificationsIcon />}
                          sx={{ height: 40 }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={handleCreateAnnouncement}
                  disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                >
                  Post Announcement
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Snackbar notification */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity="success">
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export { Communications }; 
