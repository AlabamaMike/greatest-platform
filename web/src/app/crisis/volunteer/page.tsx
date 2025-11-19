'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

const volunteerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  availability: z.string().min(1, 'Availability is required'),
  experience: z.string().optional(),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const skillOptions = [
  'Medical Training',
  'Search and Rescue',
  'Communication',
  'Transportation',
  'Food Distribution',
  'Shelter Management',
  'Translation',
  'Technical Support',
];

function VolunteerContent() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  });

  const handleSkillChange = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const onSubmit = async (data: VolunteerFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/v1/crisis/volunteers', {
        ...data,
        skills: selectedSkills,
      });
      setSuccess('Volunteer registration successful! Thank you for your service.');
      setTimeout(() => {
        router.push('/crisis');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register as volunteer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Volunteer Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join our crisis response team and help your community
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  {...register('full_name')}
                  label="Full Name"
                  fullWidth
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
                  data-testid="volunteer-name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('phone')}
                  label="Phone"
                  type="tel"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  data-testid="volunteer-phone"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('email')}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  data-testid="volunteer-email"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl error={!!errors.skills} component="fieldset">
                  <FormLabel component="legend">Skills & Qualifications</FormLabel>
                  <FormGroup data-testid="volunteer-skills">
                    {skillOptions.map((skill) => (
                      <FormControlLabel
                        key={skill}
                        control={
                          <Checkbox
                            checked={selectedSkills.includes(skill)}
                            onChange={() => handleSkillChange(skill)}
                          />
                        }
                        label={skill}
                      />
                    ))}
                  </FormGroup>
                  {errors.skills && (
                    <Typography variant="caption" color="error">
                      {errors.skills.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('availability')}
                  label="Availability"
                  fullWidth
                  placeholder="e.g., Weekends, Evenings, 24/7"
                  error={!!errors.availability}
                  helperText={errors.availability?.message}
                  data-testid="volunteer-availability"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('experience')}
                  label="Relevant Experience (optional)"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.experience}
                  helperText={errors.experience?.message}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                data-testid="register-volunteer"
              >
                {loading ? 'Registering...' : 'Register as Volunteer'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/crisis')}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default function VolunteerPage() {
  return (
    <ProtectedRoute>
      <VolunteerContent />
    </ProtectedRoute>
  );
}
