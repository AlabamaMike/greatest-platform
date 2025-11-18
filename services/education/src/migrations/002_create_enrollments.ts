import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('enrollments', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.enum('status', ['active', 'completed', 'dropped']).notNullable().defaultTo('active');
    table.integer('progress').defaultTo(0);
    table.integer('completed_lessons').defaultTo(0);
    table.integer('total_lessons').defaultTo(0);
    table.uuid('current_lesson_id');
    table.timestamp('started_at').notNullable();
    table.timestamp('completed_at');
    table.timestamp('last_accessed_at').notNullable();
    table.boolean('certificate_issued').defaultTo(false);
    table.decimal('rating', 3, 2);
    table.timestamps(true, true);

    table.index('user_id');
    table.index('course_id');
    table.index(['user_id', 'course_id']);
    table.unique(['user_id', 'course_id']);
  });

  await knex.schema.createTable('lesson_progress', (table) => {
    table.uuid('id').primary();
    table.uuid('enrollment_id').notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.uuid('lesson_id').notNullable().references('id').inTable('lessons').onDelete('CASCADE');
    table.uuid('user_id').notNullable();
    table.enum('status', ['not_started', 'in_progress', 'completed']).notNullable().defaultTo('not_started');
    table.integer('progress_percentage').defaultTo(0);
    table.integer('time_spent_minutes').defaultTo(0);
    table.timestamp('completed_at');
    table.timestamps(true, true);

    table.index('enrollment_id');
    table.index('lesson_id');
    table.index('user_id');
    table.unique(['enrollment_id', 'lesson_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lesson_progress');
  await knex.schema.dropTableIfExists('enrollments');
}
