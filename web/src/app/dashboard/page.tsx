'use client';

import { Container, Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LocalHospital,
  School,
  Work,
  Warning,
} from '@mui/icons-material';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const modules = [
    {
      title: 'Healthcare',
      description: 'Book appointments, consult with doctors, manage health records',
      icon: <LocalHospital sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/healthcare',
    },
    {
      title: 'Education',
      description: 'Browse courses, track your progress, earn certificates',
      icon: <School sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/education',
    },
    {
      title: 'Economic Empowerment',
      description: 'Find jobs, apply for loans, manage your wallet',
      icon: <Work sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/economic',
    },
    {
      title: 'Crisis Response',
      description: 'Report incidents, volunteer, stay informed',
      icon: <Warning sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/crisis',
    },
  ];

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.email?.split('@')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            What would you like to do today?
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} md={3} key={module.title}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {module.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {module.title}
                  </Typography>
                  <Typography>
                    {module.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => router.push(module.path)}
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
