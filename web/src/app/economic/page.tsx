'use client';

import { Container, Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import {
  Work,
  AccountBalance,
  AccountBalanceWallet,
} from '@mui/icons-material';

function EconomicContent() {
  const router = useRouter();

  const features = [
    {
      title: 'Job Marketplace',
      description: 'Browse job opportunities and apply for positions',
      icon: <Work sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/economic/jobs',
    },
    {
      title: 'Microloans',
      description: 'Apply for microloans to start or grow your business',
      icon: <AccountBalance sx={{ fontSize: 60, color: 'success.main' }} />,
      path: '/economic/loans',
    },
    {
      title: 'My Wallet',
      description: 'Manage your digital wallet and transactions',
      icon: <AccountBalanceWallet sx={{ fontSize: 60, color: 'info.main' }} />,
      path: '/economic/wallet',
    },
  ];

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Economic Empowerment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Build your financial independence and grow your opportunities
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
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

export default function EconomicPage() {
  return (
    <ProtectedRoute>
      <EconomicContent />
    </ProtectedRoute>
  );
}
