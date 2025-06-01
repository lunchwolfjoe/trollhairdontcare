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
  DialogContentText,
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
  Chat as ChatIcon,
} from '@mui/icons-material';
import { festivalService } from '../../lib/services';
import { Festival } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

// Mock data - will be replaced with Supabase integration
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
  profileId?: string;
  crewId?: string;
  crewName?: string;
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
    festival_id: '1',
  },
  {
    id: '2',
    title: 'Schedule Changes',
    content: 'Due to weather concerns, some shifts have been adjusted. Please check your schedules.',
    createdBy: 'Stage Manager',
    createdAt: '2025-04-02T14:30:00Z',
    important: true,
    audience: ['stage_crew', 'security'],
    festival_id: '1',
  },
  {
    id: '3',
    title: 'Food Service Update',
    content: 'Volunteer meals will be served from 11:00 AM to 8:00 PM at the catering tent.',
    createdBy: 'Food Service Coordinator',
    createdAt: '2025-04-03T10:15:00Z',
    important: false,
    audience: ['all'],
    festival_id: '1',
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
    audience: ['all'],
    festival_id: ''  // Will be set when currentFestival is available
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add new state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const { user } = useAuth();
  const [directMessages, setDirectMessages] = useState<Record<string, Message[]>>({});
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  
  // New state for crews and filtering
  const [crews, setCrews] = useState<any[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string | 'all'>('all');

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

  // Update newAnnouncement.festival_id when currentFestival changes
  useEffect(() => {
    if (currentFestival) {
      setNewAnnouncement(prev => ({
        ...prev,
        festival_id: currentFestival.id
      }));
    }
  }, [currentFestival]);

  const fetchAnnouncementsForFestival = async (festivalId: string) => {
    // In a real app, this would fetch announcements from Supabase for the specific festival
    console.log(`Fetching announcements for festival: ${festivalId}`);
    
    try {
      setLoading(true);
      
      // Check if we should use real database or mock data
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('festival_id', festivalId)
        .eq('message_type', 'announcement')
        .order('created_at', { ascending: false });
      
      if (messageError) {
        console.error('Error fetching announcements:', messageError);
        // Fall back to mock data for development
        const filteredAnnouncements = mockAnnouncements.filter(announcement => 
          announcement.festival_id === festivalId
        );
        
        setAnnouncements(filteredAnnouncements);
        return;
      }
      
      // If we have real data, transform it to match our Announcement type
      if (messageData && messageData.length > 0) {
        const formattedAnnouncements: Announcement[] = messageData.map(message => ({
          id: message.id,
          title: message.title || 'Announcement', // Title might be stored in content
          content: message.content,
          createdBy: message.sender_name || 'Coordinator',
          createdAt: message.created_at,
          important: message.important || false,
          audience: message.audience || ['all'],
          festival_id: message.festival_id
        }));
        
        setAnnouncements(formattedAnnouncements);
      } else {
        // If no data, use mock data but filter for the current festival
        const filteredAnnouncements = mockAnnouncements.filter(announcement => 
          announcement.festival_id === festivalId
        );
        
        setAnnouncements(filteredAnnouncements);
      }
    } catch (err) {
      console.error('Error in fetchAnnouncementsForFestival:', err);
      // Fall back to mock data for development
      const filteredAnnouncements = mockAnnouncements.filter(announcement => 
        announcement.festival_id === festivalId
      );
      
      setAnnouncements(filteredAnnouncements);
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

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    
    // Mark messages as read
    if (directMessages[contact.id]) {
      const unreadMessages = directMessages[contact.id]
        .filter(msg => msg.recipientId === user?.id && !msg.read)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        // Update in database
        const { error } = await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in('id', unreadMessages);
        
        if (error) {
          console.error('Error marking messages as read:', error);
        }
        
        // Update in local state
        const updatedMessages = {
          ...directMessages,
          [contact.id]: directMessages[contact.id].map(msg => 
            unreadMessages.includes(msg.id) ? { ...msg, read: true } : msg
          )
        };
        
        setDirectMessages(updatedMessages);
        
        // Reset unread counter
        setVolunteers(prevVolunteers => 
          prevVolunteers.map(v => 
            v.id === contact.id ? { ...v, unreadCount: 0 } : v
          )
        );
      }
    }
  };

  const fetchCrews = async () => {
    if (!currentFestival) return;
    
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .eq('festival_id', currentFestival.id);
      
      if (error) {
        console.error('Error fetching crews:', error);
        return;
      }
      
      setCrews(data || []);
    } catch (err) {
      console.error('Error in fetchCrews:', err);
    }
  };

  const fetchDirectMessages = async () => {
    if (!user || !currentFestival) return;
    
    try {
      setFetchingMessages(true);
      console.log('Fetching direct messages for coordinator:', user.id);
      
      // First, fetch all crews for this festival
      await fetchCrews();
      
      // Then, get all volunteers for the current festival
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select(`
          id,
          crew_id,
          profile_id,
          profiles:profile_id (
            id,
            full_name,
            email
          )
        `)
        .eq('festival_id', currentFestival.id);
      
      if (volunteersError) {
        console.error('Error fetching volunteers:', volunteersError);
        return;
      }
      
      console.log('Found volunteers:', volunteersData);
      
      // Transform volunteer data
      const formattedVolunteers = volunteersData.map((volunteer: any) => {
        const profileData = Array.isArray(volunteer.profiles) 
          ? volunteer.profiles[0] 
          : volunteer.profiles;
          
        return {
          id: volunteer.id,
          name: profileData?.full_name || 'Unknown Volunteer',
          role: 'Volunteer',
          avatar: undefined,
          crewId: volunteer.crew_id,
          unreadCount: 0,
          profileId: volunteer.profile_id || profileData?.id
        };
      });
      
      // Filter the volunteers if a specific crew is selected
      const filteredVolunteers = selectedCrew === 'all' 
        ? formattedVolunteers 
        : formattedVolunteers.filter(v => v.crewId === selectedCrew);
      
      setVolunteers(filteredVolunteers);
      
      // Fetch crew names to add to volunteer info
      if (crews.length > 0) {
        for (const volunteer of filteredVolunteers) {
          if (volunteer.crewId) {
            const crew = crews.find(c => c.id === volunteer.crewId);
            if (crew) {
              volunteer.crewName = crew.name;
              volunteer.role = `${crew.name} Crew`;
            }
          }
        }
      }
      
      console.log('Processing volunteers for messages:', filteredVolunteers);
      
      // Then, fetch direct messages for each volunteer
      for (const volunteer of filteredVolunteers) {
        if (!volunteer.profileId) {
          console.log('Skipping volunteer with no profile ID:', volunteer);
          continue;
        }
        
        console.log('Fetching messages for volunteer:', volunteer.name, 'profile ID:', volunteer.profileId);
        
        // First try with profile_id as the volunteer ID reference
        let { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`(sender_id.eq.${volunteer.profileId},recipient_id.eq.${user.id}),(sender_id.eq.${user.id},recipient_id.eq.${volunteer.profileId})`)
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error(`Error fetching messages for volunteer ${volunteer.id}:`, messagesError);
          continue;
        }
        
        // If we didn't find any messages but have a volunteer ID, try with that
        if ((!messagesData || messagesData.length === 0) && volunteer.id) {
          console.log('No messages found using profile ID, trying volunteer ID:', volunteer.id);
          
          const { data: volumeMessages, error: volError } = await supabase
            .from('direct_messages')
            .select('*')
            .eq('volunteer_id', volunteer.id)
            .order('created_at', { ascending: true });
          
          if (!volError && volumeMessages && volumeMessages.length > 0) {
            messagesData = volumeMessages;
          }
        }
        
        console.log(`Found ${messagesData?.length || 0} messages for volunteer ${volunteer.name}`);
        
        if (messagesData && messagesData.length > 0) {
          // Count unread messages
          const unreadCount = messagesData.filter(
            msg => msg.recipient_id === user.id && !msg.is_read
          ).length;
          
          // Update volunteer with last message
          const lastMessage = messagesData[messagesData.length - 1];
          
          // Update the volunteer in the list
          setVolunteers(prev => 
            prev.map(v => 
              v.id === volunteer.id 
                ? { 
                    ...v, 
                    lastMessage: lastMessage.content,
                    lastMessageTime: lastMessage.created_at,
                    unreadCount
                  } 
                : v
            )
          );
          
          // Format messages for the UI
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.sender_id === user.id ? 'You' : volunteer.name,
            recipientId: msg.recipient_id,
            recipientName: msg.recipient_id === user.id ? 'You' : volunteer.name,
            content: msg.content,
            timestamp: msg.created_at,
            read: msg.is_read
          }));
          
          // Update messages state
          setDirectMessages(prev => ({
            ...prev,
            [volunteer.id]: formattedMessages
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching direct messages:', err);
    } finally {
      setFetchingMessages(false);
    }
  };

  // Add this useEffect to fetch crews when festival changes
  useEffect(() => {
    if (currentFestival) {
      fetchCrews();
    }
  }, [currentFestival]);

  // Add this useEffect to fetch direct messages when the festival changes
  useEffect(() => {
    if (currentFestival && user) {
      fetchDirectMessages();
    }
  }, [currentFestival, user]);

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim() || !user) return;
    
    try {
      const timestamp = new Date().toISOString();
      console.log('Sending message to volunteer:', selectedContact.name, 'profile ID:', selectedContact.profileId);
      
      // Create the message for UI update
      const newMsg: Message = {
        id: `new-${timestamp}`,
        senderId: user.id,
        senderName: 'You',
        recipientId: selectedContact.profileId || '',
        recipientName: selectedContact.name,
        content: newMessage,
        timestamp,
        read: false
      };
      
      // Update local state
      const contactMessages = directMessages[selectedContact.id] || [];
      setDirectMessages({
        ...directMessages,
        [selectedContact.id]: [...contactMessages, newMsg]
      });
      
      // Update contact's last message
      setVolunteers(prevVolunteers => 
        prevVolunteers.map(v => 
          v.id === selectedContact.id 
            ? { ...v, lastMessage: newMessage, lastMessageTime: timestamp } 
            : v
        )
      );
      
      setNewMessage('');
      
      // Prepare message data
      const messageData = {
        sender_id: user.id,
        recipient_id: selectedContact.profileId || '',
        content: newMessage,
        created_at: timestamp,
        is_read: false,
        festival_id: currentFestival?.id || '',
        volunteer_id: selectedContact.id,
        crew_id: selectedContact.crewId
      };
      
      console.log('Saving message to database:', messageData);
      
      // Save message to database
      const { data, error } = await supabase
        .from('direct_messages')
        .insert([messageData])
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

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    
    try {
      const timestamp = new Date().toISOString();
      
      // Create the announcement object for local state
      const newAnnouncementObj: Announcement = {
        id: `new-${timestamp}`,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        createdBy: 'Coordinator',
        createdAt: timestamp,
        important: newAnnouncement.important,
        audience: newAnnouncement.audience,
        festival_id: currentFestival?.id || newAnnouncement.festival_id
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          festival_id: currentFestival?.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          important: newAnnouncement.important,
          audience: newAnnouncement.audience, // This will be stored in a JSONB column
          message_type: 'announcement',
          sender_id: 'current-user',
          created_at: timestamp
        }])
        .select();
      
      if (error) {
        console.error('Error creating announcement:', error);
        throw new Error(error.message);
      }
      
      // Use the actual ID from the database if available
      if (data && data.length > 0) {
        newAnnouncementObj.id = data[0].id;
      }
      
      // Insert the new announcement at the beginning of the array
      setAnnouncements([newAnnouncementObj, ...announcements]);
      setDialogOpen(false);
      
      // Reset form after submission
      setNewAnnouncement({
        title: '',
        content: '',
        important: false,
        audience: ['all'],
        festival_id: currentFestival?.id || ''
      });
      
      setSnackbarMessage('Announcement created successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error in handleCreateAnnouncement:', err);
      setSnackbarMessage('Failed to create announcement');
      setSnackbarOpen(true);
    }
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

  // Add function to handle delete dialog open
  const handleDeleteDialogOpen = (announcement: Announcement, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  // Add function to handle announcement deletion
  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return;

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', announcementToDelete.id);

      if (error) {
        console.error('Error deleting announcement:', error);
        throw new Error(error.message);
      }

      // Update local state to remove the announcement
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.filter(a => a.id !== announcementToDelete.id)
      );

      setSnackbarMessage('Announcement deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setSnackbarMessage('Failed to delete announcement');
      setSnackbarOpen(true);
    } finally {
      // Close the dialog whether successful or not
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
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
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                {formatDate(announcement.createdAt)}
                              </Typography>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => handleDeleteDialogOpen(announcement, e)}
                                aria-label="delete announcement"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
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
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Messages</Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Filter by Crew</InputLabel>
                      <Select
                        value={selectedCrew}
                        label="Filter by Crew"
                        onChange={(e) => {
                          setSelectedCrew(e.target.value as string);
                          setSelectedContact(null);
                        }}
                      >
                        <MenuItem value="all">All Crews</MenuItem>
                        {crews.map(crew => (
                          <MenuItem key={crew.id} value={crew.id}>{crew.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<RefreshIcon />} 
                      onClick={fetchDirectMessages}
                      disabled={fetchingMessages}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>
                
                <Grid container spacing={2} sx={{ height: '600px' }}>
                  <Grid item xs={12} md={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        height: '100%', 
                        overflowY: 'auto',
                        borderRight: { md: '1px solid rgba(0, 0, 0, 0.12)' },
                        borderBottom: { xs: '1px solid rgba(0, 0, 0, 0.12)', md: 'none' },
                      }}
                    >
                      <Box sx={{ position: 'relative', minHeight: 100 }}>
                        {fetchingMessages && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                          }}>
                            <CircularProgress size={30} />
                          </Box>
                        )}
                        
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                          {volunteers.length > 0 ? (
                            volunteers.map((contact) => (
                              <ListItem 
                                key={contact.id}
                                alignItems="flex-start"
                                button
                                selected={selectedContact?.id === contact.id}
                                onClick={() => handleContactSelect(contact)}
                                sx={{ 
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                  transition: 'background-color 0.2s',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  },
                                }}
                              >
                                <ListItemAvatar>
                                  <Badge 
                                    color="error" 
                                    badgeContent={contact.unreadCount} 
                                    invisible={contact.unreadCount === 0}
                                  >
                                    <Avatar alt={contact.name}>
                                      {contact.name.charAt(0)}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography
                                        component="span"
                                        variant="subtitle2"
                                        color="text.primary"
                                        sx={{ fontWeight: contact.unreadCount > 0 ? 700 : 400 }}
                                      >
                                        {contact.name}
                                      </Typography>
                                      {contact.crewName && (
                                        <Chip 
                                          label={contact.crewName} 
                                          size="small" 
                                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  secondary={
                                    <>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ 
                                          display: 'inline',
                                          fontWeight: contact.unreadCount > 0 ? 600 : 400,
                                          color: contact.unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                        }}
                                      >
                                        {contact.lastMessage || 'No messages yet'}
                                      </Typography>
                                      {' — '}
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {contact.lastMessageTime ? formatDate(contact.lastMessageTime) : ''}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText 
                                primary={selectedCrew === 'all' ? "No volunteers found" : "No volunteers in this crew"}
                                secondary={selectedCrew === 'all' ? "Add volunteers to the festival first" : "Try selecting a different crew"}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: 2,
                      }}
                    >
                      {selectedContact ? (
                        <>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1, 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                            mb: 2
                          }}>
                            <Avatar sx={{ mr: 2 }}>
                              {selectedContact.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">{selectedContact.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedContact.role}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                            {directMessages[selectedContact.id]?.length > 0 ? (
                              <List>
                                {directMessages[selectedContact.id].map((message) => (
                                  <ListItem
                                    key={message.id}
                                    sx={{ 
                                      flexDirection: message.senderId === user?.id ? 'row-reverse' : 'row',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    <ListItemAvatar sx={{ 
                                      minWidth: 40,
                                      m: message.senderId === user?.id ? '0 0 0 8px' : '0 8px 0 0',
                                    }}>
                                      <Avatar sx={{ width: 32, height: 32 }}>
                                        {message.senderName.charAt(0)}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <Box
                                      sx={{
                                        maxWidth: '70%',
                                        backgroundColor: message.senderId === user?.id ? 'primary.light' : 'grey.100',
                                        color: message.senderId === user?.id ? 'white' : 'inherit',
                                        borderRadius: 2,
                                        p: 1.5,
                                        mb: 0.5,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {message.content}
                                      </Typography>
                                      <Typography variant="caption" color={message.senderId === user?.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                                        {formatDate(message.timestamp)}
                                      </Typography>
                                    </Box>
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                                <Typography>No messages yet</Typography>
                                <Typography variant="body2">
                                  Send a message to start the conversation
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', mt: 'auto' }}>
                            <TextField
                              fullWidth
                              variant="outlined"
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleSendMessage}
                                      color="primary"
                                      disabled={!newMessage.trim()}
                                    >
                                      <SendIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </>
                      ) : (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            height: '100%',
                            color: 'text.secondary'
                          }}
                        >
                          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.light' }}>
                            <ChatIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6">Select a Contact</Typography>
                          <Typography variant="body2">
                            Choose a volunteer from the list to start messaging
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
            
            {/* Delete confirmation dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Announcement</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the announcement "{announcementToDelete?.title}"? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleDeleteAnnouncement} color="error" variant="contained">
                  Delete
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
