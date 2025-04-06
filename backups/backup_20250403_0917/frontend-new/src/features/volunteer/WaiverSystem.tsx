import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Create as SignIcon,
} from '@mui/icons-material';

// Mock data - to be replaced with Supabase integration
interface Waiver {
  id: string;
  title: string;
  content: string;
  required: boolean;
  version: string;
  createdAt: string;
  signed: boolean;
  signedAt?: string;
}

const mockWaivers: Waiver[] = [
  {
    id: '1',
    title: 'General Volunteer Waiver',
    content: `## VOLUNTEER AGREEMENT AND LIABILITY WAIVER

By signing this Volunteer Agreement and Liability Waiver ("Waiver"), I acknowledge that I am voluntarily participating in activities related to the Summer Music Festival 2025 (the "Festival").

### ASSUMPTION OF RISK
I understand that volunteering at the Festival involves certain risks, including but not limited to: physical exertion, exposure to crowds, loud music, potential weather conditions, and other unforeseen hazards. I willingly accept and assume all such risks, both known and unknown.

### LIABILITY RELEASE
I hereby release, waive, discharge, and covenant not to sue Festival organizers, staff, sponsors, vendors, and their respective agents, representatives, officers, directors, employees, volunteers, successors, and assigns (collectively "Releasees") from any and all liability, claims, demands, actions, and causes of action arising out of or related to any loss, damage, or injury that may be sustained by me while participating as a volunteer.

### INDEMNIFICATION
I agree to indemnify and hold harmless the Releasees from any loss, liability, damage, or costs they may incur due to my participation as a volunteer.

### MEDICAL TREATMENT AUTHORIZATION
I authorize Festival organizers to arrange for medical treatment in the event of an injury or illness during my volunteer service.

### PHOTO RELEASE
I grant permission for photographs, videos, and recordings of me taken during the Festival to be used for promotional purposes.

### TERM OF AGREEMENT
This Waiver is valid for the duration of my volunteer service for the Festival, including any related activities before or after the event.

### GOVERNING LAW
This Waiver shall be governed by the laws of the State where the Festival is held.

I HAVE READ THIS WAIVER, FULLY UNDERSTAND ITS TERMS, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.`,
    required: true,
    version: '1.0',
    createdAt: '2025-01-15T10:00:00Z',
    signed: false,
  },
  {
    id: '2',
    title: 'COVID-19 Health Acknowledgment',
    content: `## COVID-19 HEALTH ACKNOWLEDGMENT

By signing this acknowledgment, I understand and agree to the following terms regarding COVID-19 health and safety protocols for the Summer Music Festival 2025:

1. I will follow all health and safety guidelines established by the Festival, including mask requirements, vaccination requirements, testing protocols, and social distancing measures as applicable.

2. I acknowledge that, despite preventative measures, there is a risk of exposure to COVID-19 and other communicable diseases in any public gathering.

3. I will not attend the Festival if I have tested positive for COVID-19 within 5 days prior to my shift, am experiencing symptoms of COVID-19, or have had close contact with someone who has tested positive for COVID-19 within 5 days prior to my shift.

4. I understand that health and safety protocols may change prior to or during the Festival based on public health guidelines, and I agree to comply with updated protocols.

5. I acknowledge that failure to comply with health and safety protocols may result in my removal from volunteer service and the Festival grounds.

I HAVE READ THIS COVID-19 HEALTH ACKNOWLEDGMENT, FULLY UNDERSTAND ITS TERMS, AND SIGN IT FREELY AND VOLUNTARILY.`,
    required: true,
    version: '2.1',
    createdAt: '2025-01-20T14:30:00Z',
    signed: false,
  },
  {
    id: '3',
    title: 'Emergency Medical Information',
    content: `## EMERGENCY MEDICAL INFORMATION CONSENT

This form allows Festival medical staff to access important health information in case of emergency during your volunteer service.

Please provide the following information:

1. Emergency contact name and phone number
2. Any medical conditions that emergency personnel should be aware of
3. Current medications
4. Allergies (medications, food, environmental)
5. Date of last tetanus shot (if known)
6. Health insurance information (optional)

By signing this form, you authorize:

1. Festival medical staff to access this information in case of emergency
2. Festival organizers to share this information with medical professionals if necessary for your care
3. Medical professionals to provide necessary treatment

This information will be kept confidential and will only be used in case of medical emergency.

I UNDERSTAND AND AGREE TO THE TERMS OF THIS EMERGENCY MEDICAL INFORMATION CONSENT.`,
    required: false,
    version: '1.2',
    createdAt: '2025-01-18T09:15:00Z',
    signed: false,
  }
];

const WaiverSystem: React.FC = () => {
  const [waivers, setWaivers] = useState<Waiver[]>(mockWaivers);
  const [activeWaiver, setActiveWaiver] = useState<Waiver | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signature, setSignature] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to fetch waivers from Supabase would be here
  // useEffect(() => {
  //   const fetchWaivers = async () => {
  //     const { data, error } = await supabase
  //       .from('waivers')
  //       .select('*')
  //       .eq('festival_id', currentFestivalId);
  //     
  //     if (error) {
  //       console.error('Error fetching waivers:', error);
  //       return;
  //     }
  //     
  //     setWaivers(data);
  //   };
  //   
  //   fetchWaivers();
  // }, []);

  const handleViewWaiver = (waiver: Waiver) => {
    setActiveWaiver(waiver);
    setDialogOpen(true);
  };

  const handleSignWaiver = (waiver: Waiver) => {
    setActiveWaiver(waiver);
    setSignature('');
    setAcknowledged(false);
    setErrorMessage('');
    setSignDialogOpen(true);
  };

  const handleSignatureSubmit = () => {
    if (!activeWaiver) return;
    
    if (!signature.trim()) {
      setErrorMessage('Please enter your signature');
      return;
    }
    
    if (!acknowledged) {
      setErrorMessage('Please acknowledge that you have read and understand the waiver');
      return;
    }
    
    // Update local state
    const signedAt = new Date().toISOString();
    setWaivers(prev => 
      prev.map(waiver => 
        waiver.id === activeWaiver.id 
          ? { ...waiver, signed: true, signedAt } 
          : waiver
      )
    );
    
    // This would include Supabase update:
    // const submitSignature = async () => {
    //   const { error } = await supabase
    //     .from('waiver_signatures')
    //     .insert([{
    //       waiver_id: activeWaiver.id,
    //       volunteer_id: currentUserId,
    //       signature: signature,
    //       signed_at: signedAt,
    //       ip_address: '127.0.0.1' // Would be captured server-side in production
    //     }]);
    //   
    //   if (error) {
    //     console.error('Error submitting signature:', error);
    //     setErrorMessage('Error submitting signature. Please try again.');
    //     return;
    //   }
    // };
    // 
    // submitSignature();
    
    setSuccessMessage(`Successfully signed ${activeWaiver.title}`);
    setSignDialogOpen(false);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const requiredWaivers = waivers.filter(waiver => waiver.required);
  const optionalWaivers = waivers.filter(waiver => !waiver.required);
  const allRequiredSigned = requiredWaivers.every(waiver => waiver.signed);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Waiver & Consent Forms
        </Typography>
        
        <Typography variant="body1" paragraph>
          Please review and sign all required waivers before your volunteer shift. Your digital signature 
          constitutes legal acknowledgment of these documents.
        </Typography>
        
        {!allRequiredSigned && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You have unsigned required waivers. Please sign all required waivers to complete your volunteer registration.
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Required Waivers
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {requiredWaivers.map(waiver => (
            <Grid item xs={12} md={6} key={waiver.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{waiver.title}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Version {waiver.version} • {formatDate(waiver.createdAt)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label="Required" 
                      color="error" 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                    {waiver.signed ? (
                      <Chip 
                        label="Signed" 
                        color="success" 
                        size="small" 
                        icon={<CheckIcon />} 
                      />
                    ) : (
                      <Chip 
                        label="Unsigned" 
                        color="warning" 
                        size="small" 
                        icon={<CloseIcon />} 
                      />
                    )}
                  </Box>
                  
                  {waiver.signed && waiver.signedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Signed on: {formatDate(waiver.signedAt)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewWaiver(waiver)}>
                    View
                  </Button>
                  {!waiver.signed && (
                    <Button 
                      size="small" 
                      color="primary" 
                      variant="contained" 
                      onClick={() => handleSignWaiver(waiver)}
                    >
                      Sign Now
                    </Button>
                  )}
                  <Button size="small" startIcon={<DownloadIcon />}>
                    Download PDF
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {optionalWaivers.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Optional Forms
            </Typography>
            
            <Grid container spacing={3}>
              {optionalWaivers.map(waiver => (
                <Grid item xs={12} md={6} key={waiver.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="h6">{waiver.title}</Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Version {waiver.version} • {formatDate(waiver.createdAt)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label="Optional" 
                          color="info" 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        {waiver.signed ? (
                          <Chip 
                            label="Completed" 
                            color="success" 
                            size="small" 
                            icon={<CheckIcon />} 
                          />
                        ) : (
                          <Chip 
                            label="Not Completed" 
                            variant="outlined" 
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      {waiver.signed && waiver.signedAt && (
                        <Typography variant="body2" color="text.secondary">
                          Completed on: {formatDate(waiver.signedAt)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleViewWaiver(waiver)}>
                        View
                      </Button>
                      {!waiver.signed && (
                        <Button 
                          size="small" 
                          color="primary" 
                          onClick={() => handleSignWaiver(waiver)}
                        >
                          Complete
                        </Button>
                      )}
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download PDF
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
      
      {/* View Waiver Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeWaiver?.title}
          <Typography variant="subtitle2" color="text.secondary">
            Version {activeWaiver?.version} • {activeWaiver?.createdAt && formatDate(activeWaiver.createdAt)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: 'pre-line' }}>
            {activeWaiver?.content}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {activeWaiver && !activeWaiver.signed && (
            <Button 
              color="primary" 
              variant="contained" 
              onClick={() => {
                setDialogOpen(false);
                handleSignWaiver(activeWaiver);
              }}
            >
              Sign Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Sign Waiver Dialog */}
      <Dialog open={signDialogOpen} onClose={() => setSignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Sign: {activeWaiver?.title}
        </DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Typography variant="subtitle2" gutterBottom>
            Please read the full document before signing:
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 3, 
              maxHeight: '250px', 
              overflow: 'auto',
              whiteSpace: 'pre-line'
            }}
          >
            {activeWaiver?.content}
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            By typing your full legal name below, you acknowledge that:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="You have read and understand the document above" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Your digital signature constitutes a legal signature" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="This signature will be recorded with a timestamp and IP address" />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Signature:
          </Typography>
          
          <TextField
            fullWidth
            label="Type your full legal name"
            variant="outlined"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: <SignIcon color="action" />,
            }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
            }
            label="I confirm that I have read and understand this document and am signing it voluntarily."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialogOpen(false)}>Cancel</Button>
          <Button 
            color="primary" 
            variant="contained" 
            onClick={handleSignatureSubmit}
            disabled={!signature.trim() || !acknowledged}
          >
            Submit Signature
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WaiverSystem; 