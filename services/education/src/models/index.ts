export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  instructor_id?: string;
  instructor_name: string;
  category: string;
  tags: string[];
  thumbnail_url?: string;
  is_published: boolean;
  enrolled_count: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  content_type: 'video' | 'text' | 'interactive' | 'quiz';
  video_url?: string;
  duration_minutes: number;
  order: number;
  is_free: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  current_lesson_id?: string;
  started_at: Date;
  completed_at?: Date;
  last_accessed_at: Date;
  certificate_issued: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_minutes: number;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Assessment {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  questions: any; // JSON
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts: number;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  user_id: string;
  enrollment_id: string;
  answers: any; // JSON
  score: number;
  passed: boolean;
  attempt_number: number;
  time_taken_minutes: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  submitted_at: Date;
  created_at: Date;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  issued_date: Date;
  expiry_date?: Date;
  verification_url: string;
  pdf_url?: string;
  skills_acquired: string[];
  created_at: Date;
}

export interface LearningPath {
  id: string;
  user_id: string;
  name: string;
  description: string;
  course_ids: string[];
  recommended_order: number[];
  progress: number;
  estimated_completion_weeks: number;
  created_at: Date;
  updated_at: Date;
}
