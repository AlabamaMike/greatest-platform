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
  MenuItem,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

function RegisterPatientContent() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/v1/healthcare/patients', data);
      setSuccess('Patient registered successfully!');
      reset();
      setTimeout(() => {
        router.push('/healthcare');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register patient');
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
            Register New Patient
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the form below to register a new patient
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
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('first_name')}
                  label="First Name"
                  fullWidth
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  data-testid="patient-first-name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('last_name')}
                  label="Last Name"
                  fullWidth
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  data-testid="patient-last-name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('date_of_birth')}
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth?.message}
                  data-testid="patient-dob"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('gender')}
                  select
                  label="Gender"
                  fullWidth
                  defaultValue="male"
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  data-testid="patient-gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('phone')}
                  label="Phone"
                  type="tel"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  data-testid="patient-phone"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('email')}
                  label="Email (optional)"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  data-testid="patient-email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('address')}
                  label="Address (optional)"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('emergency_contact_name')}
                  label="Emergency Contact Name (optional)"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('emergency_contact_phone')}
                  label="Emergency Contact Phone (optional)"
                  type="tel"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('medical_history')}
                  label="Medical History (optional)"
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('allergies')}
                  label="Allergies (optional)"
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                data-testid="register-patient-submit"
              >
                {loading ? 'Registering...' : 'Register Patient'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/healthcare')}
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

export default function RegisterPatientPage() {
  return (
    <ProtectedRoute>
      <RegisterPatientContent />
    </ProtectedRoute>
  );
}
