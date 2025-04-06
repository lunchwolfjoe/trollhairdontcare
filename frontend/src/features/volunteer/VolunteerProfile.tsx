import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  experience: string;
  preferredShifts: string;
  dietaryRestrictions: string;
  tshirtSize: string;
  photoUrl?: string;
}

// Mock data - replace with actual data from backend
const mockProfile: VolunteerProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '(555) 987-6543',
    relationship: 'Spouse',
  },
  skills: ['Stage Setup', 'Sound Equipment', 'First Aid'],
  experience: '3 years of experience in event management and stage setup',
  preferredShifts: 'Evenings and weekends',
  dietaryRestrictions: 'Vegetarian',
  tshirtSize: 'L',
  photoUrl: 'https://via.placeholder.com/150',
};

export const VolunteerProfile: React.FC = () => {
  const [profile, setProfile] = useState<VolunteerProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<VolunteerProfile>(mockProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedProfile(profile);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleInputChange = (field: keyof VolunteerProfile | 'emergencyContactName' | 'emergencyContactPhone' | 'emergencyContactRelationship', value: string) => {
    setEditedProfile(prev => {
      if (field === 'emergencyContactName') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, name: value },
        };
      }
      if (field === 'emergencyContactPhone') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, phone: value },
        };
      }
      if (field === 'emergencyContactRelationship') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, relationship: value },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile
      setProfile(editedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (error) {
      setSaveError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Volunteer Profile
            </Typography>
            <Button
              variant="contained"
              color={isEditing ? 'error' : 'primary'}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profile.photoUrl}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {isEditing && (
                <Button variant="outlined" size="small">
                  Change Photo
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={isEditing ? editedProfile.firstName : profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={isEditing ? editedProfile.lastName : profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editedProfile.email : profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={isEditing ? editedProfile.emergencyContact.name : profile.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.emergencyContact.phone : profile.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={isEditing ? editedProfile.emergencyContact.relationship : profile.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Skills & Experience
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {profile.skills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Stack>
              </Box>
              <TextField
                fullWidth
                label="Experience"
                multiline
                rows={3}
                value={isEditing ? editedProfile.experience : profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Shifts"
                    value={isEditing ? editedProfile.preferredShifts : profile.preferredShifts}
                    onChange={(e) => handleInputChange('preferredShifts', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="T-Shirt Size"
                    value={isEditing ? editedProfile.tshirtSize : profile.tshirtSize}
                    onChange={(e) => handleInputChange('tshirtSize', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dietary Restrictions"
                    value={isEditing ? editedProfile.dietaryRestrictions : profile.dietaryRestrictions}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  experience: string;
  preferredShifts: string;
  dietaryRestrictions: string;
  tshirtSize: string;
  photoUrl?: string;
}

// Mock data - replace with actual data from backend
const mockProfile: VolunteerProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '(555) 987-6543',
    relationship: 'Spouse',
  },
  skills: ['Stage Setup', 'Sound Equipment', 'First Aid'],
  experience: '3 years of experience in event management and stage setup',
  preferredShifts: 'Evenings and weekends',
  dietaryRestrictions: 'Vegetarian',
  tshirtSize: 'L',
  photoUrl: 'https://via.placeholder.com/150',
};

export const VolunteerProfile: React.FC = () => {
  const [profile, setProfile] = useState<VolunteerProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<VolunteerProfile>(mockProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedProfile(profile);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleInputChange = (field: keyof VolunteerProfile | 'emergencyContactName' | 'emergencyContactPhone' | 'emergencyContactRelationship', value: string) => {
    setEditedProfile(prev => {
      if (field === 'emergencyContactName') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, name: value },
        };
      }
      if (field === 'emergencyContactPhone') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, phone: value },
        };
      }
      if (field === 'emergencyContactRelationship') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, relationship: value },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile
      setProfile(editedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (error) {
      setSaveError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Volunteer Profile
            </Typography>
            <Button
              variant="contained"
              color={isEditing ? 'error' : 'primary'}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profile.photoUrl}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {isEditing && (
                <Button variant="outlined" size="small">
                  Change Photo
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={isEditing ? editedProfile.firstName : profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={isEditing ? editedProfile.lastName : profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editedProfile.email : profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={isEditing ? editedProfile.emergencyContact.name : profile.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.emergencyContact.phone : profile.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={isEditing ? editedProfile.emergencyContact.relationship : profile.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Skills & Experience
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {profile.skills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Stack>
              </Box>
              <TextField
                fullWidth
                label="Experience"
                multiline
                rows={3}
                value={isEditing ? editedProfile.experience : profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Shifts"
                    value={isEditing ? editedProfile.preferredShifts : profile.preferredShifts}
                    onChange={(e) => handleInputChange('preferredShifts', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="T-Shirt Size"
                    value={isEditing ? editedProfile.tshirtSize : profile.tshirtSize}
                    onChange={(e) => handleInputChange('tshirtSize', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dietary Restrictions"
                    value={isEditing ? editedProfile.dietaryRestrictions : profile.dietaryRestrictions}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  experience: string;
  preferredShifts: string;
  dietaryRestrictions: string;
  tshirtSize: string;
  photoUrl?: string;
}

// Mock data - replace with actual data from backend
const mockProfile: VolunteerProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '(555) 987-6543',
    relationship: 'Spouse',
  },
  skills: ['Stage Setup', 'Sound Equipment', 'First Aid'],
  experience: '3 years of experience in event management and stage setup',
  preferredShifts: 'Evenings and weekends',
  dietaryRestrictions: 'Vegetarian',
  tshirtSize: 'L',
  photoUrl: 'https://via.placeholder.com/150',
};

export const VolunteerProfile: React.FC = () => {
  const [profile, setProfile] = useState<VolunteerProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<VolunteerProfile>(mockProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedProfile(profile);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleInputChange = (field: keyof VolunteerProfile | 'emergencyContactName' | 'emergencyContactPhone' | 'emergencyContactRelationship', value: string) => {
    setEditedProfile(prev => {
      if (field === 'emergencyContactName') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, name: value },
        };
      }
      if (field === 'emergencyContactPhone') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, phone: value },
        };
      }
      if (field === 'emergencyContactRelationship') {
        return {
          ...prev,
          emergencyContact: { ...prev.emergencyContact, relationship: value },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile
      setProfile(editedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (error) {
      setSaveError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Volunteer Profile
            </Typography>
            <Button
              variant="contained"
              color={isEditing ? 'error' : 'primary'}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profile.photoUrl}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {isEditing && (
                <Button variant="outlined" size="small">
                  Change Photo
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={isEditing ? editedProfile.firstName : profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={isEditing ? editedProfile.lastName : profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editedProfile.email : profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={isEditing ? editedProfile.emergencyContact.name : profile.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.emergencyContact.phone : profile.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={isEditing ? editedProfile.emergencyContact.relationship : profile.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Skills & Experience
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {profile.skills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Stack>
              </Box>
              <TextField
                fullWidth
                label="Experience"
                multiline
                rows={3}
                value={isEditing ? editedProfile.experience : profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Shifts"
                    value={isEditing ? editedProfile.preferredShifts : profile.preferredShifts}
                    onChange={(e) => handleInputChange('preferredShifts', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="T-Shirt Size"
                    value={isEditing ? editedProfile.tshirtSize : profile.tshirtSize}
                    onChange={(e) => handleInputChange('tshirtSize', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dietary Restrictions"
                    value={isEditing ? editedProfile.dietaryRestrictions : profile.dietaryRestrictions}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 