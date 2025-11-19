'use client';

import { useRouter } from 'next/navigation';
import { Button, Container, Typography, Box, Grid, Card, CardContent, CardActions } from '@mui/material';
import {
  LocalHospital,
  School,
  Work,
  Warning,
} from '@mui/icons-material';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'Healthcare',
      description: 'Access telemedicine consultations, book appointments, and manage your health records.',
      icon: <LocalHospital sx={{ fontSize: 60 }} />,
      path: '/healthcare',
    },
    {
      title: 'Education',
      description: 'Browse courses, enroll in training programs, and earn certificates.',
      icon: <School sx={{ fontSize: 60 }} />,
      path: '/education',
    },
    {
      title: 'Economic Empowerment',
      description: 'Find jobs, apply for microloans, and manage your digital wallet.',
      icon: <Work sx={{ fontSize: 60 }} />,
      path: '/economic',
    },
    {
      title: 'Crisis Response',
      description: 'Report incidents, volunteer for crisis response, and stay informed about emergencies.',
      icon: <Warning sx={{ fontSize: 60 }} />,
      path: '/crisis',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to Nexus
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary" sx={{ mb: 6 }}>
          Empowering Communities Through Technology
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/auth/signup')}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" onClick={() => router.push(feature.path)}>
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
