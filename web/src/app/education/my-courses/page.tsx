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
  LinearProgress,
  Chip,
} from '@mui/material';
import { School, EmojiEvents } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface EnrolledCourse {
  id: string;
  course_id: string;
  course_title: string;
  course_description: string;
  level: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  has_certificate: boolean;
}

function MyCoursesContent() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const data = await apiClient.get<EnrolledCourse[]>('/api/v1/education/enrollments');
      setEnrolledCourses(data);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Courses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your learning progress and access your certificates
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EmojiEvents />}
            onClick={() => router.push('/education/certificates')}
          >
            My Certificates
          </Button>
        </Box>

        <Grid container spacing={3}>
          {enrolledCourses.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No enrolled courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start learning by enrolling in a course
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
            enrolledCourses.map((enrollment) => (
              <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {enrollment.course_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {enrollment.course_description}
                    </Typography>
                    <Chip
                      label={enrollment.level}
                      size="small"
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {enrollment.progress_percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={enrollment.progress_percentage}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {enrollment.completed_lessons} of {enrollment.total_lessons} lessons completed
                    </Typography>
                    {enrollment.has_certificate && (
                      <Chip
                        label="Certificate Earned"
                        size="small"
                        color="success"
                        icon={<EmojiEvents />}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => router.push(`/education/courses/${enrollment.course_id}`)}
                      data-testid="continue-course"
                    >
                      Continue Learning
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </>
  );
}

export default function MyCoursesPage() {
  return (
    <ProtectedRoute>
      <MyCoursesContent />
    </ProtectedRoute>
  );
}
