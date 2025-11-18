'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import { CheckCircle, ArrowBack, ArrowForward } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface LessonDetail {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  is_completed: boolean;
  order: number;
  next_lesson_id?: string;
  previous_lesson_id?: string;
}

function LessonContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const data = await apiClient.get<LessonDetail>(
        `/api/v1/education/courses/${courseId}/lessons/${lessonId}`
      );
      setLesson(data);
    } catch (err) {
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await apiClient.post(
        `/api/v1/education/courses/${courseId}/lessons/${lessonId}/complete`
      );
      if (lesson) {
        setLesson({ ...lesson, is_completed: true });
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleNext = () => {
    if (lesson?.next_lesson_id) {
      router.push(`/education/courses/${courseId}/lessons/${lesson.next_lesson_id}`);
    } else {
      router.push(`/education/courses/${courseId}`);
    }
  };

  const handlePrevious = () => {
    if (lesson?.previous_lesson_id) {
      router.push(`/education/courses/${courseId}/lessons/${lesson.previous_lesson_id}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading lesson...</Typography>
        </Container>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Lesson not found</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push(`/education/courses/${courseId}`)}
          sx={{ mb: 2 }}
        >
          Back to Course
        </Button>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {lesson.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {lesson.duration_minutes} minutes
              </Typography>
            </Box>
            {lesson.is_completed && (
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {lesson.video_url && (
            <Box sx={{ mb: 3, width: '100%', aspectRatio: '16/9', bgcolor: 'black' }}>
              <video
                src={lesson.video_url}
                controls
                style={{ width: '100%', height: '100%' }}
              >
                Your browser does not support the video tag.
              </video>
            </Box>
          )}

          <Typography
            variant="body1"
            component="div"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
            sx={{ mb: 4 }}
          />

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handlePrevious}
              disabled={!lesson.previous_lesson_id}
            >
              Previous Lesson
            </Button>

            {!lesson.is_completed && (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleComplete}
                data-testid="complete-lesson"
              >
                Mark as Complete
              </Button>
            )}

            <Button
              endIcon={<ArrowForward />}
              onClick={handleNext}
              variant={lesson.is_completed ? 'contained' : 'outlined'}
            >
              {lesson.next_lesson_id ? 'Next Lesson' : 'Back to Course'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default function LessonPage() {
  return (
    <ProtectedRoute>
      <LessonContent />
    </ProtectedRoute>
  );
}
