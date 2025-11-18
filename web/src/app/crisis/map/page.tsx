'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Incident {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: string;
  reported_at: string;
}

function CrisisMapContent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
    // Set up WebSocket for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'incident_update') {
        fetchIncidents();
      }
    };

    return () => ws.close();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await apiClient.get<Incident[]>('/api/v1/crisis/incidents');
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crisis Map
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Real-time view of crisis incidents
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                height: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
              data-testid="crisis-map"
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Interactive Map
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Map visualization would render here with Mapbox GL
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {incidents.length} incidents on map
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ maxHeight: 500, overflow: 'auto' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">Active Incidents</Typography>
              </Box>
              {loading ? (
                <Box sx={{ p: 2 }}>
                  <Typography>Loading incidents...</Typography>
                </Box>
              ) : incidents.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography>No active incidents</Typography>
                </Box>
              ) : (
                <List>
                  {incidents.map((incident) => (
                    <ListItem
                      key={incident.id}
                      sx={{ borderBottom: 1, borderColor: 'divider' }}
                      data-testid="incident-marker"
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                              label={incident.incident_type.replace('_', ' ')}
                              size="small"
                            />
                            <Chip
                              label={incident.severity}
                              size="small"
                              color={getSeverityColor(incident.severity) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" gutterBottom>
                              {incident.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(incident.reported_at), 'PPpp')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default function CrisisMapPage() {
  return (
    <ProtectedRoute>
      <CrisisMapContent />
    </ProtectedRoute>
  );
}
