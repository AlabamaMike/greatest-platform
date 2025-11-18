import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.string('language', 10).notNullable().defaultTo('en');
    table.enum('level', ['beginner', 'intermediate', 'advanced']).notNullable();
    table.integer('duration_weeks').notNullable();
    table.uuid('instructor_id');
    table.string('instructor_name').notNullable();
    table.string('category').notNullable();
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.string('thumbnail_url');
    table.boolean('is_published').defaultTo(false);
    table.integer('enrolled_count').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(0);
    table.timestamps(true, true);

    table.index('language');
    table.index('level');
    table.index('category');
    table.index('is_published');
  });

  await knex.schema.createTable('lessons', (table) => {
    table.uuid('id').primary();
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.text('content');
    table.enum('content_type', ['video', 'text', 'interactive', 'quiz']).notNullable();
    table.string('video_url');
    table.integer('duration_minutes').notNullable();
    table.integer('order').notNullable();
    table.boolean('is_free').defaultTo(false);
    table.timestamps(true, true);

    table.index('course_id');
    table.index(['course_id', 'order']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('courses');
}
