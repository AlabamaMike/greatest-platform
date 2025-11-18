'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

const loanSchema = z.object({
  amount: z.number().min(100, 'Minimum loan amount is $100').max(10000, 'Maximum loan amount is $10,000'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  business_description: z.string().optional(),
  repayment_months: z.number().min(3, 'Minimum repayment period is 3 months').max(36, 'Maximum repayment period is 36 months'),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  interest_rate: number;
  repayment_months: number;
  monthly_payment: number;
  amount_paid: number;
  amount_remaining: number;
  created_at: string;
  approved_at?: string;
}

function LoansContent() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await apiClient.get<Loan[]>('/api/v1/economic/loans');
      setLoans(data);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/api/v1/economic/loans', data);
      setSuccess('Loan application submitted successfully!');
      setOpenDialog(false);
      reset();
      fetchLoans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit loan application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'paid':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Microloans
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access affordable financing for your business
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AccountBalance />}
            onClick={() => setOpenDialog(true)}
          >
            Apply for Loan
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loans.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <AccountBalance sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No loan applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apply for your first microloan to grow your business
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Interest Rate</TableCell>
                  <TableCell>Monthly Payment</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Applied On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status}
                        color={getStatusColor(loan.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>${loan.monthly_payment.toFixed(2)}</TableCell>
                    <TableCell>${loan.amount_remaining.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(loan.created_at), 'PP')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Apply for Microloan</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form id="loan-form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('amount', { valueAsNumber: true })}
                label="Loan Amount ($)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />

              <TextField
                {...register('repayment_months', { valueAsNumber: true })}
                label="Repayment Period (months)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.repayment_months}
                helperText={errors.repayment_months?.message}
              />

              <TextField
                {...register('purpose')}
                label="Purpose of Loan"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                error={!!errors.purpose}
                helperText={errors.purpose?.message}
              />

              <TextField
                {...register('business_description')}
                label="Business Description (optional)"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                error={!!errors.business_description}
                helperText={errors.business_description?.message}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" form="loan-form" variant="contained">
              Submit Application
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <LoansContent />
    </ProtectedRoute>
  );
}
