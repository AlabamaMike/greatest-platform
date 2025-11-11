import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'economic-service', timestamp: new Date().toISOString() });
});

// Job Marketplace
app.get('/api/v1/economic/jobs', (req, res) => {
  res.json({
    success: true,
    message: 'Job marketplace with AI-powered matching',
    data: [
      { id: 1, title: 'Community Health Worker', location: 'Kenya', salary: '$500/month', type: 'full-time', remote: false },
      { id: 2, title: 'Telemedicine Coordinator', location: 'Remote', salary: '$1200/month', type: 'full-time', remote: true },
      { id: 3, title: 'Data Entry Specialist', location: 'India', salary: '$400/month', type: 'part-time', remote: true },
    ],
    total: 3,
  });
});

app.post('/api/v1/economic/jobs', (req, res) => {
  res.json({ success: true, message: 'Job posted successfully', data: { jobId: 'job_' + Date.now(), ...req.body } });
});

app.post('/api/v1/economic/applications', (req, res) => {
  res.json({ success: true, message: 'Application submitted', data: { applicationId: 'app_' + Date.now() } });
});

// Microlending
app.post('/api/v1/economic/loans/apply', (req, res) => {
  const { amount, purpose, businessPlan } = req.body;
  res.json({
    success: true,
    message: 'Loan application submitted for review',
    data: {
      loanId: 'loan_' + Date.now(),
      amount,
      purpose,
      status: 'under_review',
      estimatedDecision: '3-5 business days',
    },
  });
});

app.get('/api/v1/economic/loans/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      loanId: req.params.id,
      amount: 5000,
      status: 'approved',
      interestRate: 8.5,
      repaymentSchedule: '24 months',
      nextPaymentDue: '2025-12-01',
    },
  });
});

// Mobile Wallet & Financial Inclusion
app.get('/api/v1/economic/wallet/balance', (req, res) => {
  res.json({
    success: true,
    data: { balance: 1250.50, currency: 'USD', lastTransaction: '2025-11-10' },
  });
});

app.post('/api/v1/economic/wallet/transfer', (req, res) => {
  const { to, amount } = req.body;
  res.json({
    success: true,
    message: 'Transfer successful (mobile money)',
    data: { transactionId: 'txn_' + Date.now(), to, amount, fee: amount * 0.01, timestamp: new Date().toISOString() },
  });
});

app.post('/api/v1/economic/wallet/deposit', (req, res) => {
  res.json({ success: true, message: 'Deposit successful', data: { amount: req.body.amount } });
});

// Direct Cash Transfers (for humanitarian aid)
app.post('/api/v1/economic/cash-transfers', (req, res) => {
  const { recipients, amountPerPerson, program } = req.body;
  res.json({
    success: true,
    message: 'Cash transfer program initiated',
    data: {
      transferId: 'ct_' + Date.now(),
      program,
      recipients,
      totalAmount: recipients * amountPerPerson,
      status: 'processing',
      estimatedCompletion: '24-48 hours',
    },
  });
});

// Women's Economic Participation
app.get('/api/v1/economic/women-programs', (req, res) => {
  res.json({
    success: true,
    message: 'Programs specifically designed for women entrepreneurs',
    data: [
      { id: 1, name: 'Women in Business Training', participants: 5000, completionRate: 85 },
      { id: 2, name: 'Microfinance for Women', loansIssued: 12000, repaymentRate: 97 },
    ],
  });
});

// Skills matching
app.post('/api/v1/economic/skills-match', (req, res) => {
  res.json({
    success: true,
    message: 'AI-powered job matching based on your skills',
    data: {
      matches: [
        { job: 'Community Health Worker', matchScore: 92, reasonsWhy: ['Healthcare background', 'Communication skills'] },
        { job: 'Medical Translator', matchScore: 78, reasonsWhy: ['Language proficiency', 'Medical terminology'] },
      ],
    },
  });
});

app.listen(PORT, () => {
  console.log(`💼 Economic Service running on port ${PORT}`);
  console.log('💰 Empowering economic opportunity - Lifting millions out of poverty!');
});
