'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Work, LocationOn, AttachMoney } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: string;
  salary_range?: string;
  requirements: string[];
  posted_at: string;
}

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, jobTypeFilter]);

  const fetchJobs = async () => {
    try {
      const data = await apiClient.get<Job[]>('/api/v1/economic/jobs');
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const filterJobs = () => {
    if (jobTypeFilter === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.job_type === jobTypeFilter));
    }
  };

  const handleApply = async (job: Job) => {
    setSelectedJob(job);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleConfirmApply = async () => {
    if (!selectedJob) return;

    try {
      await apiClient.post(`/api/v1/economic/jobs/${selectedJob.id}/apply`);
      setSuccess('Application submitted successfully!');
      setOpenDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Find employment opportunities that match your skills
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            select
            label="Job Type"
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="full_time">Full Time</MenuItem>
            <MenuItem value="part_time">Part Time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="freelance">Freelance</MenuItem>
          </TextField>
        </Box>

        <Grid container spacing={3}>
          {filteredJobs.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Work sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No jobs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or check back later
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            filteredJobs.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {job.title}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {job.company}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<LocationOn />}
                        label={job.location}
                        size="small"
                      />
                      <Chip
                        label={job.job_type.replace('_', ' ')}
                        size="small"
                        color="primary"
                      />
                      {job.salary_range && (
                        <Chip
                          icon={<AttachMoney />}
                          label={job.salary_range}
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {job.description}
                    </Typography>
                    {job.requirements.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {job.requirements.slice(0, 3).map((req, idx) => (
                            <Chip key={idx} label={req} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => handleApply(job)}
                    >
                      Apply Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body2" gutterBottom>
              You are about to apply for this position at {selectedJob?.company}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your profile information will be sent to the employer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmApply} variant="contained">
              Confirm Application
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <JobsContent />
    </ProtectedRoute>
  );
}
