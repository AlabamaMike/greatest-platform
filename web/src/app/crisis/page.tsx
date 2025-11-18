'use client';

import { Container, Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import {
  ReportProblem,
  Map,
  VolunteerActivism,
  Notifications,
} from '@mui/icons-material';

function CrisisContent() {
  const router = useRouter();

  const features = [
    {
      title: 'Report Incident',
      description: 'Report crisis incidents and emergencies in your area',
      icon: <ReportProblem sx={{ fontSize: 60, color: 'error.main' }} />,
      path: '/crisis/report',
    },
    {
      title: 'Crisis Map',
      description: 'View real-time crisis incidents on an interactive map',
      icon: <Map sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/crisis/map',
    },
    {
      title: 'Volunteer',
      description: 'Register as a volunteer for crisis response',
      icon: <VolunteerActivism sx={{ fontSize: 60, color: 'success.main' }} />,
      path: '/crisis/volunteer',
    },
    {
      title: 'Alerts',
      description: 'View and manage emergency alerts',
      icon: <Notifications sx={{ fontSize: 60, color: 'warning.main' }} />,
      path: '/crisis/alerts',
    },
  ];

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Crisis Response
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coordinate and respond to emergencies in your community
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

export default function CrisisPage() {
  return (
    <ProtectedRoute>
      <CrisisContent />
    </ProtectedRoute>
  );
}
