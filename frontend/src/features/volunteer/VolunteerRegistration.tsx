import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

// Define the steps for the registration process
const steps = ['Personal Information', 'Skills & Experience', 'Availability', 'Review'];

// Define the form data interface
interface VolunteerFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Skills & Experience
  skills: string[];
  experience: string;
  certifications: string[];
  
  // Availability
  availableDays: string[];
  preferredShifts: string[];
  maxHoursPerDay: number;
  
  // Additional Information
  tShirtSize: string;
  dietaryRestrictions: string;
  specialAccommodations: string;
}

const initialFormData: VolunteerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  emergencyContact: '',
  emergencyPhone: '',
  skills: [],
  experience: '',
  certifications: [],
  availableDays: [],
  preferredShifts: [],
  maxHoursPerDay: 8,
  tShirtSize: '',
  dietaryRestrictions: '',
  specialAccommodations: '',
};

const VolunteerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<VolunteerFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSkillsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({
      ...prev,
      skills: event.target.value as string[],
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // First, create the user account
      await signUp(formData.email, formData.password);
      
      // Create the volunteer profile in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            emergency_contact: formData.emergencyContact,
            emergency_phone: formData.emergencyPhone,
            t_shirt_size: formData.tShirtSize,
            dietary_restrictions: formData.dietaryRestrictions,
            special_accommodations: formData.specialAccommodations,
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // Create volunteer-specific information
      const { error: volunteerError } = await supabase
        .from('volunteers')
        .insert([
          {
            profile_id: profile.id,
            skills: formData.skills,
            experience: formData.experience,
            certifications: formData.certifications,
            available_days: formData.availableDays,
            preferred_shifts: formData.preferredShifts,
            max_hours_per_day: formData.maxHoursPerDay,
            status: 'pending',
          },
        ]);

      if (volunteerError) throw volunteerError;

      // Assign the volunteer role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: profile.id,
            role: 'volunteer',
          },
        ]);

      if (roleError) throw roleError;

      setSuccess(true);
      // Show success message and redirect
      setTimeout(() => {
        navigate('/volunteer/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                helperText="Password must be at least 6 characters long"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Emergency Contact Name"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Emergency Contact Phone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Skills</InputLabel>
                <Select
                  multiple
                  value={formData.skills}
                  onChange={handleSkillsChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="customer_service">Customer Service</MenuItem>
                  <MenuItem value="food_service">Food Service</MenuItem>
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="stage_management">Stage Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certifications (comma-separated)"
                name="certifications"
                value={formData.certifications.join(', ')}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    certifications: e.target.value.split(',').map((cert) => cert.trim()),
                  }));
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Available Days</InputLabel>
                <Select
                  multiple
                  value={formData.availableDays}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      availableDays: e.target.value as string[],
                    }));
                  }}
                >
                  <MenuItem value="friday">Friday</MenuItem>
                  <MenuItem value="saturday">Saturday</MenuItem>
                  <MenuItem value="sunday">Sunday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Preferred Shifts</InputLabel>
                <Select
                  multiple
                  value={formData.preferredShifts}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      preferredShifts: e.target.value as string[],
                    }));
                  }}
                >
                  <MenuItem value="morning">Morning (6am-2pm)</MenuItem>
                  <MenuItem value="afternoon">Afternoon (2pm-10pm)</MenuItem>
                  <MenuItem value="night">Night (10pm-6am)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Hours per Day"
                name="maxHoursPerDay"
                value={formData.maxHoursPerDay}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>T-Shirt Size</InputLabel>
                <Select
                  value={formData.tShirtSize}
                  onChange={handleInputChange}
                  name="tShirtSize"
                >
                  <MenuItem value="xs">XS</MenuItem>
                  <MenuItem value="s">S</MenuItem>
                  <MenuItem value="m">M</MenuItem>
                  <MenuItem value="l">L</MenuItem>
                  <MenuItem value="xl">XL</MenuItem>
                  <MenuItem value="xxl">XXL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dietary Restrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Special Accommodations"
                name="specialAccommodations"
                value={formData.specialAccommodations}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Volunteer Registration
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! Please check your email to verify your account.
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={success || loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VolunteerRegistration; 