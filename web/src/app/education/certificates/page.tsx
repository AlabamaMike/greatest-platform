'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { EmojiEvents, Download, Visibility } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Certificate {
  id: string;
  course_id: string;
  course_title: string;
  issued_date: string;
  certificate_url: string;
}

function CertificatesContent() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await apiClient.get<Certificate[]>('/api/v1/education/certificates');
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    window.open(certificate.certificate_url, '_blank');
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Certificates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your earned certificates and achievements
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {certificates.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No certificates yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Complete courses to earn certificates
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/education')}
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            certificates.map((certificate) => (
              <Grid item xs={12} sm={6} md={4} key={certificate.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <EmojiEvents
                      sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
                    />
                    <Typography gutterBottom variant="h6" component="h2">
                      {certificate.course_title}
                    </Typography>
                    <Chip
                      label={`Issued: ${format(new Date(certificate.issued_date), 'PP')}`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => router.push(`/education/certificates/${certificate.course_id}`)}
                      data-testid="view-certificate"
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      startIcon={<Download />}
                      onClick={() => handleDownload(certificate)}
                      data-testid="download-certificate"
                    >
                      Download
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </>
  );
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute>
      <CertificatesContent />
    </ProtectedRoute>
  );
}
