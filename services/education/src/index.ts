import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import courseService from './services/course.service';
import enrollmentService from './services/enrollment.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'education-service', timestamp: new Date().toISOString() });
});

// Courses
app.get('/api/v1/education/courses', async (req, res) => {
  try {
    const { courses, total } = await courseService.getCourses({
      language: req.query.language as string,
      level: req.query.level as string,
      category: req.query.category as string,
      is_published: req.query.published === 'true',
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    });
    res.json({ success: true, data: courses, total });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/education/courses', async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/education/courses/:id', async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    const lessons = await courseService.getCourseLessons(req.params.id);
    res.json({ success: true, data: { ...course, lessons } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enrollments
app.post('/api/v1/education/enrollments', async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    const enrollment = await enrollmentService.createEnrollment(userId, courseId);
    res.status(201).json({ success: true, message: 'Enrolled successfully', data: enrollment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/education/enrollments/:id/progress', async (req, res) => {
  try {
    const progress = await enrollmentService.getEnrollmentProgress(req.params.id);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Assessments (mock for now)
app.post('/api/v1/education/assessments/:id/submit', (req, res) => {
  res.json({
    success: true,
    message: 'Assessment graded',
    data: { score: 85, passed: true, feedback: 'Great work!' },
  });
});

// Certificates (mock for now)
app.get('/api/v1/education/certificates', (req, res) => {
  res.json({
    success: true,
    data: [{ id: 'cert_123', course: 'Healthcare Training', issued: '2025-10-15' }],
  });
});

app.listen(PORT, () => {
  console.log(`📚 Education Service running on port ${PORT}`);
  console.log('🎓 Database-backed learning platform ready!');
});
