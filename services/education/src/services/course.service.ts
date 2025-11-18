import db from '../config/database';
import { Course, Lesson } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class CourseService {
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const course = {
      id: uuidv4(),
      enrolled_count: 0,
      rating: 0,
      is_published: false,
      created_at: new Date(),
      updated_at: new Date(),
      ...courseData,
    };

    await db('courses').insert(course);
    return course as Course;
  }

  async getCourses(filters: {
    language?: string;
    level?: string;
    category?: string;
    is_published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    let query = db('courses');

    if (filters.language) {
      query = query.where('language', filters.language);
    }
    if (filters.level) {
      query = query.where('level', filters.level);
    }
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    if (filters.is_published !== undefined) {
      query = query.where('is_published', filters.is_published);
    }

    const total = await query.clone().count('* as count').first();
    const courses = await query
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)
      .orderBy('created_at', 'desc');

    return {
      courses: courses as Course[],
      total: parseInt(total?.count as string) || 0,
    };
  }

  async getCourseById(id: string): Promise<Course | null> {
    const course = await db('courses').where({ id }).first();
    return course as Course | null;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    await db('courses')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date(),
      });

    return this.getCourseById(id);
  }

  async deleteCourse(id: string): Promise<boolean> {
    const deleted = await db('courses').where({ id }).delete();
    return deleted > 0;
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    const lessons = await db('lessons')
      .where({ course_id: courseId })
      .orderBy('order', 'asc');

    return lessons as Lesson[];
  }

  async createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
    const lesson = {
      id: uuidv4(),
      is_free: false,
      created_at: new Date(),
      updated_at: new Date(),
      ...lessonData,
    };

    await db('lessons').insert(lesson);
    return lesson as Lesson;
  }

  async incrementEnrollmentCount(courseId: string): Promise<void> {
    await db('courses')
      .where({ id: courseId })
      .increment('enrolled_count', 1);
  }

  async updateCourseRating(courseId: string): Promise<void> {
    // Calculate average rating from enrollments or reviews
    const result = await db('enrollments')
      .where({ course_id: courseId, status: 'completed' })
      .avg('rating as avg_rating')
      .first();

    if (result && result.avg_rating) {
      await db('courses')
        .where({ id: courseId })
        .update({ rating: parseFloat(result.avg_rating) });
    }
  }

  async searchCourses(searchTerm: string, limit: number = 20): Promise<Course[]> {
    const courses = await db('courses')
      .where('is_published', true)
      .andWhere(function() {
        this.where('title', 'ilike', `%${searchTerm}%`)
          .orWhere('description', 'ilike', `%${searchTerm}%`)
          .orWhereRaw('? = ANY(tags)', [searchTerm]);
      })
      .limit(limit)
      .orderBy('enrolled_count', 'desc');

    return courses as Course[];
  }
}

export default new CourseService();
