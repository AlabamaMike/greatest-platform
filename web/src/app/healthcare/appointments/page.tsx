'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_type: string;
  scheduled_time: string;
  status: string;
  notes?: string;
}

function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    provider_id: '',
    appointment_type: 'consultation',
    scheduled_time: '',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await apiClient.get<Appointment[]>('/api/v1/healthcare/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      provider_id: '',
      appointment_type: 'consultation',
      scheduled_time: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/v1/healthcare/appointments', formData);
      setSuccess('Appointment booked successfully!');
      handleCloseDialog();
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Appointments
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            data-testid="book-appointment"
          >
            Book Appointment
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper} data-testid="appointments-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Provider ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No appointments found. Book your first appointment!
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(new Date(appointment.scheduled_time), 'PPpp')}
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {appointment.appointment_type}
                    </TableCell>
                    <TableCell>{appointment.provider_id}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{appointment.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Provider ID"
              fullWidth
              margin="normal"
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              data-testid="provider-select"
            />

            <TextField
              select
              label="Appointment Type"
              fullWidth
              margin="normal"
              value={formData.appointment_type}
              onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
              data-testid="appointment-type"
            >
              <MenuItem value="consultation">Consultation</MenuItem>
              <MenuItem value="followup">Follow-up</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </TextField>

            <TextField
              label="Date & Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              data-testid="appointment-datetime"
            />

            <TextField
              label="Notes (optional)"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !formData.provider_id || !formData.scheduled_time}
              data-testid="confirm-booking"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <ProtectedRoute>
      <AppointmentsContent />
    </ProtectedRoute>
  );
}
