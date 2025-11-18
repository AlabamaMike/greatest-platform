'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, FolderShared } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

function RecordsContent() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await apiClient.get<MedicalRecord[]>('/api/v1/healthcare/patients/me/records');
      setRecords(data);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Medical Records
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View your complete medical history
        </Typography>

        {loading ? (
          <Typography>Loading records...</Typography>
        ) : records.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <FolderShared sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No medical records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your medical records will appear here after consultations
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {records.map((record) => (
              <Grid item xs={12} key={record.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip label={record.record_type} color="primary" size="small" />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {record.diagnosis || 'Medical Record'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(record.created_at), 'PP')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {record.diagnosis && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Diagnosis
                          </Typography>
                          <Typography variant="body2">{record.diagnosis}</Typography>
                        </Grid>
                      )}
                      {record.treatment && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Treatment
                          </Typography>
                          <Typography variant="body2">{record.treatment}</Typography>
                        </Grid>
                      )}
                      {record.medications && record.medications.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Medications
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {record.medications.map((med, idx) => (
                              <Chip key={idx} label={med} size="small" />
                            ))}
                          </Box>
                        </Grid>
                      )}
                      {record.notes && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary">
                            Notes
                          </Typography>
                          <Typography variant="body2">{record.notes}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <RecordsContent />
    </ProtectedRoute>
  );
}
