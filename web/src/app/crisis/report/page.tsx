'use client';

import { useState, useEffect } from 'react';
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
  IconButton,
} from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

const incidentSchema = z.object({
  incident_type: z.enum(['natural_disaster', 'medical_emergency', 'fire', 'violence', 'accident', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

function ReportIncidentContent() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_type: 'other',
      severity: 'medium',
      latitude: 0,
      longitude: 0,
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          setLoadingLocation(false);
        },
        (error) => {
          setError('Unable to get your location. Please enter coordinates manually.');
          setLoadingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onSubmit = async (data: IncidentFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/v1/crisis/incidents', data);
      setSuccess('Incident reported successfully!');
      setTimeout(() => {
        router.push('/crisis/map');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to report incident');
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
            Report Crisis Incident
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Provide details about the crisis incident
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
                  {...register('incident_type')}
                  select
                  label="Incident Type"
                  fullWidth
                  defaultValue="other"
                  error={!!errors.incident_type}
                  helperText={errors.incident_type?.message}
                  data-testid="incident-type"
                >
                  <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                  <MenuItem value="medical_emergency">Medical Emergency</MenuItem>
                  <MenuItem value="fire">Fire</MenuItem>
                  <MenuItem value="violence">Violence</MenuItem>
                  <MenuItem value="accident">Accident</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('severity')}
                  select
                  label="Severity"
                  fullWidth
                  defaultValue="medium"
                  error={!!errors.severity}
                  helperText={errors.severity?.message}
                  data-testid="incident-severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('description')}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  data-testid="incident-description"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1">Location</Typography>
                  <IconButton
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    size="small"
                    data-testid="get-location"
                  >
                    <MyLocation />
                  </IconButton>
                  {loadingLocation && <Typography variant="body2">Getting location...</Typography>}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('latitude', { valueAsNumber: true })}
                  label="Latitude"
                  type="number"
                  fullWidth
                  error={!!errors.latitude}
                  helperText={errors.latitude?.message}
                  data-testid="incident-latitude"
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('longitude', { valueAsNumber: true })}
                  label="Longitude"
                  type="number"
                  fullWidth
                  error={!!errors.longitude}
                  helperText={errors.longitude?.message}
                  data-testid="incident-longitude"
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('address')}
                  label="Address (optional)"
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
                data-testid="submit-incident"
              >
                {loading ? 'Reporting...' : 'Report Incident'}
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

export default function ReportIncidentPage() {
  return (
    <ProtectedRoute>
      <ReportIncidentContent />
    </ProtectedRoute>
  );
}
