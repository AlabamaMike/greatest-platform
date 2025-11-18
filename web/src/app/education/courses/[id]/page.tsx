'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle,
  Assignment,
  EmojiEvents,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  is_completed: boolean;
}

interface Assessment {
  id: string;
  title: string;
  passing_score: number;
  user_score?: number;
  is_passed: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  lessons: Lesson[];
  assessments: Assessment[];
  is_completed: boolean;
  has_certificate: boolean;
}

function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const data = await apiClient.get<CourseDetail>(`/api/v1/education/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/education/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleAssessmentClick = (assessmentId: string) => {
    router.push(`/education/courses/${courseId}/assessments/${assessmentId}`);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading course...</Typography>
        </Container>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Course not found</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {course.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip label={course.level} color="primary" size="small" />
                <Chip label={`Instructor: ${course.instructor}`} size="small" />
                {course.is_completed && (
                  <Chip label="Completed" color="success" size="small" icon={<CheckCircle />} />
                )}
              </Box>
            </Box>
            {course.has_certificate && (
              <Button
                variant="contained"
                startIcon={<EmojiEvents />}
                onClick={() => router.push(`/education/certificates/${courseId}`)}
                data-testid="view-certificate"
              >
                View Certificate
              </Button>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Course Content
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Lessons
          </Typography>
          <List>
            {course.lessons.map((lesson) => (
              <ListItem key={lesson.id} disablePadding>
                <ListItemButton
                  onClick={() => handleLessonClick(lesson.id)}
                  data-testid="lesson-item"
                >
                  <ListItemIcon>
                    {lesson.is_completed ? (
                      <CheckCircle color="success" />
                    ) : (
                      <PlayCircle color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    secondary={`${lesson.duration_minutes} minutes`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Assessments
          </Typography>
          <List>
            {course.assessments.map((assessment) => (
              <ListItem key={assessment.id} disablePadding>
                <ListItemButton
                  onClick={() => handleAssessmentClick(assessment.id)}
                  data-testid="assessment-item"
                >
                  <ListItemIcon>
                    {assessment.is_passed ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Assignment color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={assessment.title}
                    secondary={
                      assessment.user_score !== undefined
                        ? `Score: ${assessment.user_score}% (Passing: ${assessment.passing_score}%)`
                        : `Passing score: ${assessment.passing_score}%`
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
}

export default function CourseDetailPage() {
  return (
    <ProtectedRoute>
      <CourseDetailContent />
    </ProtectedRoute>
  );
}
