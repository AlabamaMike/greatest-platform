'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { apiClient } from '@/lib/api';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer?: number;
}

interface AssessmentDetail {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  questions: Question[];
  time_limit_minutes?: number;
  user_score?: number;
  is_passed?: boolean;
}

function AssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const assessmentId = params.assessmentId as string;
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const data = await apiClient.get<AssessmentDetail>(
        `/api/v1/education/courses/${courseId}/assessments/${assessmentId}`
      );
      setAssessment(data);
      if (data.user_score !== undefined) {
        setSubmitted(true);
        setResult({ score: data.user_score, passed: data.is_passed || false });
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    try {
      const response = await apiClient.post<{ score: number; passed: boolean }>(
        `/api/v1/education/courses/${courseId}/assessments/${assessmentId}/submit`,
        { answers }
      );
      setResult(response);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading assessment...</Typography>
        </Container>
      </>
    );
  }

  if (!assessment) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Assessment not found</Typography>
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
          <Typography variant="h4" component="h1" gutterBottom>
            {assessment.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {assessment.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Passing score: {assessment.passing_score}%
            {assessment.time_limit_minutes && ` | Time limit: ${assessment.time_limit_minutes} minutes`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {result && (
            <Alert
              severity={result.passed ? 'success' : 'warning'}
              sx={{ mb: 3 }}
            >
              You scored {result.score}%. {result.passed ? 'Congratulations! You passed!' : 'Keep learning and try again!'}
            </Alert>
          )}

          {assessment.questions.map((question, index) => (
            <Box key={question.id} sx={{ mb: 4 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {question.question_text}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={answers[question.id] ?? ''}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={option}
                      disabled={submitted}
                      data-testid={`question-${index}-option-${optionIndex}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          ))}

          {!submitted && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== assessment.questions.length}
              data-testid="submit-assessment"
            >
              Submit Assessment
            </Button>
          )}

          {submitted && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/education/courses/${courseId}`)}
              >
                Back to Course
              </Button>
              {!result?.passed && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setResult(null);
                  }}
                >
                  Retry Assessment
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default function AssessmentPage() {
  return (
    <ProtectedRoute>
      <AssessmentContent />
    </ProtectedRoute>
  );
}
