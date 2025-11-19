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
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import { School, MenuBook } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  language: string;
  duration_hours: number;
  is_enrolled?: boolean;
}

function EducationContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, levelFilter, languageFilter]);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get<Course[]>('/api/v1/education/courses');
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level === levelFilter);
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(course => course.language === languageFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await apiClient.post(`/api/v1/education/courses/${courseId}/enroll`);
      fetchCourses();
    } catch (err) {
      console.error('Error enrolling in course:', err);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Course Catalog
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore and enroll in courses to expand your skills
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<MenuBook />}
            onClick={() => router.push('/education/my-courses')}
          >
            My Courses
          </Button>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            data-testid="level-filter"
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </TextField>

          <TextField
            select
            label="Language"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            data-testid="language-filter"
          >
            <MenuItem value="all">All Languages</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="ar">Arabic</MenuItem>
          </TextField>
        </Box>

        <Grid container spacing={3}>
          {filteredCourses.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No courses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or check back later for new courses
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={course.level} size="small" color="primary" />
                      <Chip label={course.language.toUpperCase()} size="small" />
                      <Chip label={`${course.duration_hours}h`} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Instructor: {course.instructor}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {course.is_enrolled ? (
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        onClick={() => router.push(`/education/courses/${course.id}`)}
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => handleEnroll(course.id)}
                        data-testid="enroll-button"
                      >
                        Enroll
                      </Button>
                    )}
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

export default function EducationPage() {
  return (
    <ProtectedRoute>
      <EducationContent />
    </ProtectedRoute>
  );
}
