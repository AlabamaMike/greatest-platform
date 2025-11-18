'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Send,
  GetApp,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  recipient?: string;
}

function WalletContent() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await apiClient.get<Wallet>('/api/v1/economic/wallet');
      setWallet(data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await apiClient.get<Transaction[]>('/api/v1/economic/wallet/transactions');
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleSendMoney = async () => {
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/api/v1/economic/wallet/send', {
        amount: parseFloat(amount),
        recipient,
      });
      setSuccess('Money sent successfully!');
      setOpenSendDialog(false);
      setAmount('');
      setRecipient('');
      fetchWallet();
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send money');
    }
  };

  const handleAddFunds = async () => {
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/api/v1/economic/wallet/deposit', {
        amount: parseFloat(amount),
      });
      setSuccess('Funds added successfully!');
      setOpenAddDialog(false);
      setAmount('');
      fetchWallet();
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funds');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'received':
        return <TrendingUp color="success" />;
      case 'withdrawal':
      case 'sent':
        return <TrendingDown color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your digital wallet and transactions
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWallet sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Available Balance
                    </Typography>
                    <Typography variant="h3">
                      ${wallet?.balance.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => setOpenSendDialog(true)}
                  >
                    Send Money
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={() => setOpenAddDialog(true)}
                  >
                    Add Funds
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                  <Typography variant="h5">{transactions.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Recent Transactions</Typography>
          </Box>
          {transactions.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No transactions yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTransactionIcon(transaction.type)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {transaction.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: transaction.type === 'deposit' || transaction.type === 'received'
                              ? 'success.main'
                              : 'error.main',
                          }}
                        >
                          {transaction.type === 'deposit' || transaction.type === 'received' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={transaction.status === 'completed' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(transaction.created_at), 'PP')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Send Money Dialog */}
        <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Send Money</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Recipient"
              fullWidth
              margin="normal"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Email or wallet ID"
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ step: '0.01', min: '0' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSendDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSendMoney}
              variant="contained"
              disabled={!amount || !recipient}
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Funds Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Amount"
              type="number"
              fullWidth
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ step: '0.01', min: '0' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddFunds}
              variant="contained"
              disabled={!amount}
            >
              Add Funds
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
