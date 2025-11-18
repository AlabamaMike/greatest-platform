'use client';

import { Container, Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import {
  CalendarToday,
  VideoCall,
  FolderShared,
  PersonAdd,
} from '@mui/icons-material';

function HealthcareContent() {
  const router = useRouter();

  const features = [
    {
      title: 'Appointments',
      description: 'Book and manage your medical appointments',
      icon: <CalendarToday sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/healthcare/appointments',
    },
    {
      title: 'Consultations',
      description: 'Join telemedicine video consultations',
      icon: <VideoCall sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/healthcare/consultations',
    },
    {
      title: 'Medical Records',
      description: 'View and manage your medical records',
      icon: <FolderShared sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/healthcare/records',
    },
    {
      title: 'Register Patient',
      description: 'Register a new patient in the system',
      icon: <PersonAdd sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/healthcare/patients/register',
    },
  ];

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Healthcare Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access comprehensive healthcare services from anywhere
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => router.push(feature.path)}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default function HealthcarePage() {
  return (
    <ProtectedRoute>
      <HealthcareContent />
    </ProtectedRoute>
  );
}
