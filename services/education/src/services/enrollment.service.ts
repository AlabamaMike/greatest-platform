import db from '../config/database';
import { Enrollment, LessonProgress } from '../models';
import { v4 as uuidv4 } from 'uuid';
import courseService from './course.service';

export class EnrollmentService {
  async createEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    // Check if already enrolled
    const existing = await db('enrollments')
      .where({ user_id: userId, course_id: courseId })
      .first();

    if (existing) {
      throw new Error('User already enrolled in this course');
    }

    // Get total lessons count
    const lessons = await courseService.getCourseLessons(courseId);
    const totalLessons = lessons.length;

    const enrollment = {
      id: uuidv4(),
      user_id: userId,
      course_id: courseId,
      status: 'active',
      progress: 0,
      completed_lessons: 0,
      total_lessons: totalLessons,
      started_at: new Date(),
      last_accessed_at: new Date(),
      certificate_issued: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('enrollments').insert(enrollment);

    // Increment course enrollment count
    await courseService.incrementEnrollmentCount(courseId);

    // Create initial lesson progress records
    const lessonProgressRecords = lessons.map(lesson => ({
      id: uuidv4(),
      enrollment_id: enrollment.id,
      lesson_id: lesson.id,
      user_id: userId,
      status: 'not_started',
      progress_percentage: 0,
      time_spent_minutes: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    if (lessonProgressRecords.length > 0) {
      await db('lesson_progress').insert(lessonProgressRecords);
    }

    return enrollment as Enrollment;
  }

  async getEnrollment(enrollmentId: string): Promise<Enrollment | null> {
    const enrollment = await db('enrollments').where({ id: enrollmentId }).first();
    return enrollment as Enrollment | null;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const enrollments = await db('enrollments')
      .where({ user_id: userId })
      .orderBy('last_accessed_at', 'desc');

    return enrollments as Enrollment[];
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<{
    enrollment: Enrollment;
    lessonProgress: LessonProgress[];
    nextLesson: LessonProgress | null;
  }> {
    const enrollment = await this.getEnrollment(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const lessonProgress = await db('lesson_progress')
      .where({ enrollment_id: enrollmentId })
      .orderBy('created_at', 'asc');

    const nextLesson = await db('lesson_progress')
      .where({ enrollment_id: enrollmentId, status: 'not_started' })
      .orWhere({ enrollment_id: enrollmentId, status: 'in_progress' })
      .orderBy('created_at', 'asc')
      .first();

    return {
      enrollment: enrollment as Enrollment,
      lessonProgress: lessonProgress as LessonProgress[],
      nextLesson: nextLesson as LessonProgress | null,
    };
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      status?: 'not_started' | 'in_progress' | 'completed';
      progress_percentage?: number;
      time_spent_minutes?: number;
    }
  ): Promise<void> {
    const updates: any = {
      ...progressData,
      updated_at: new Date(),
    };

    if (progressData.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date();
    }

    await db('lesson_progress')
      .where({ enrollment_id: enrollmentId, lesson_id: lessonId })
      .update(updates);

    // Update enrollment progress
    await this.recalculateEnrollmentProgress(enrollmentId);
  }

  async recalculateEnrollmentProgress(enrollmentId: string): Promise<void> {
    const stats = await db('lesson_progress')
      .where({ enrollment_id: enrollmentId })
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
        db.raw('AVG(progress_percentage) as avg_progress')
      )
      .first();

    const updates: any = {
      completed_lessons: parseInt(stats.completed) || 0,
      progress: Math.round(parseFloat(stats.avg_progress) || 0),
      last_accessed_at: new Date(),
      updated_at: new Date(),
    };

    // Check if course is completed
    if (updates.completed_lessons === parseInt(stats.total) && updates.completed_lessons > 0) {
      updates.status = 'completed';
      updates.completed_at = new Date();
    }

    await db('enrollments').where({ id: enrollmentId }).update(updates);
  }

  async dropEnrollment(enrollmentId: string): Promise<void> {
    await db('enrollments')
      .where({ id: enrollmentId })
      .update({
        status: 'dropped',
        updated_at: new Date(),
      });
  }

  async getEnrollmentStats(courseId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    dropped: number;
    averageProgress: number;
  }> {
    const stats = await db('enrollments')
      .where({ course_id: courseId })
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE status = 'active') as active"),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
        db.raw("COUNT(*) FILTER (WHERE status = 'dropped') as dropped"),
        db.raw('AVG(progress) as avg_progress')
      )
      .first();

    return {
      total: parseInt(stats.total) || 0,
      active: parseInt(stats.active) || 0,
      completed: parseInt(stats.completed) || 0,
      dropped: parseInt(stats.dropped) || 0,
      averageProgress: Math.round(parseFloat(stats.avg_progress) || 0),
    };
  }
}

export default new EnrollmentService();
