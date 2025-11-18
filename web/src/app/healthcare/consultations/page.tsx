'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { VideoCall } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Consultation {
  id: string;
  appointment_id: string;
  status: string;
  start_time: string;
  end_time?: string;
  video_url?: string;
}

function ConsultationsContent() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const data = await apiClient.get<Consultation[]>('/api/v1/healthcare/consultations');
      setConsultations(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const handleStartConsultation = async (consultationId: string) => {
    try {
      // In a real implementation, this would initiate a WebRTC connection
      console.log('Starting consultation:', consultationId);
      // Navigate to video room or open video interface
    } catch (err) {
      console.error('Error starting consultation:', err);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Telemedicine Consultations
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join video consultations with healthcare providers
        </Typography>

        <Grid container spacing={3}>
          {consultations.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <VideoCall sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No consultations scheduled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Book an appointment to schedule a consultation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            consultations.map((consultation) => (
              <Grid item xs={12} md={6} key={consultation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Consultation #{consultation.id.slice(0, 8)}
                      </Typography>
                      <Chip
                        label={consultation.status}
                        color={consultation.status === 'in_progress' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Start: {format(new Date(consultation.start_time), 'PPpp')}
                    </Typography>
                    {consultation.end_time && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        End: {format(new Date(consultation.end_time), 'PPpp')}
                      </Typography>
                    )}
                    {consultation.status === 'scheduled' && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCall />}
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleStartConsultation(consultation.id)}
                        data-testid="start-consultation"
                      >
                        Start Consultation
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </>
  );
}

export default function ConsultationsPage() {
  return (
    <ProtectedRoute>
      <ConsultationsContent />
    </ProtectedRoute>
  );
}
