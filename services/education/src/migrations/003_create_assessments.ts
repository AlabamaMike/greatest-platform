import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('assessments', (table) => {
    table.uuid('id').primary();
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('lesson_id').references('id').inTable('lessons').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['quiz', 'assignment', 'exam', 'project']).notNullable();
    table.jsonb('questions').notNullable();
    table.integer('passing_score').notNullable();
    table.integer('time_limit_minutes');
    table.integer('max_attempts').defaultTo(3);
    table.timestamps(true, true);

    table.index('course_id');
    table.index('lesson_id');
  });

  await knex.schema.createTable('assessment_submissions', (table) => {
    table.uuid('id').primary();
    table.uuid('assessment_id').notNullable().references('id').inTable('assessments').onDelete('CASCADE');
    table.uuid('user_id').notNullable();
    table.uuid('enrollment_id').notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.jsonb('answers').notNullable();
    table.integer('score').notNullable();
    table.boolean('passed').notNullable();
    table.integer('attempt_number').notNullable();
    table.integer('time_taken_minutes');
    table.text('feedback');
    table.uuid('graded_by');
    table.timestamp('graded_at');
    table.timestamp('submitted_at').notNullable();
    table.timestamps(true, true);

    table.index('assessment_id');
    table.index('user_id');
    table.index('enrollment_id');
    table.index(['user_id', 'assessment_id']);
  });

  await knex.schema.createTable('certificates', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('enrollment_id').notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.string('certificate_number').notNullable().unique();
    table.timestamp('issued_date').notNullable();
    table.timestamp('expiry_date');
    table.string('verification_url').notNullable();
    table.string('pdf_url');
    table.specificType('skills_acquired', 'text[]').defaultTo('{}');
    table.timestamps(true, true);

    table.index('user_id');
    table.index('course_id');
    table.index('certificate_number');
    table.unique(['user_id', 'course_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('certificates');
  await knex.schema.dropTableIfExists('assessment_submissions');
  await knex.schema.dropTableIfExists('assessments');
}
