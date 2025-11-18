'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert as MuiAlert,
} from '@mui/material';
import { Warning, Info, Error as ErrorIcon } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
  affected_area: string;
  created_at: string;
  expires_at?: string;
}

function AlertsContent() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Set up WebSocket for real-time alert updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'alert_update') {
        fetchAlerts();
      }
    };

    return () => ws.close();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await apiClient.get<Alert[]>('/api/v1/crisis/alerts');
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Emergency Alerts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Stay informed about emergencies and critical situations
        </Typography>

        {loading ? (
          <Paper sx={{ p: 3 }}>
            <Typography>Loading alerts...</Typography>
          </Paper>
        ) : alerts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Info sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No active alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will be notified when new alerts are issued
            </Typography>
          </Paper>
        ) : (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert) => (
              <Paper key={alert.id} elevation={3}>
                <ListItem
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 3,
                  }}
                  data-testid="alert-item"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ color: `${getSeverityColor(alert.severity)}.main` }}>
                      {getSeverityIcon(alert.severity)}
                    </Box>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {alert.title}
                    </Typography>
                    <Chip
                      label={alert.severity}
                      color={getSeverityColor(alert.severity) as any}
                      size="small"
                    />
                    <Chip
                      label={alert.alert_type}
                      size="small"
                    />
                  </Box>

                  <MuiAlert
                    severity={getSeverityColor(alert.severity) as any}
                    sx={{ mb: 2 }}
                  >
                    {alert.message}
                  </MuiAlert>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Affected Area:</strong> {alert.affected_area}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Issued:</strong> {format(new Date(alert.created_at), 'PPpp')}
                    </Typography>
                    {alert.expires_at && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expires:</strong> {format(new Date(alert.expires_at), 'PPpp')}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Container>
    </>
  );
}

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}
