/**
 * Database Helper for E2E Tests
 * Manages test database connections and cleanup
 */

import { Client } from 'pg';

export class TestDatabase {
  private client: Client | null = null;

  async connect() {
    this.client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'nexus_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await this.client.connect();
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  async query(sql: string, params?: any[]) {
    if (!this.client) {
      throw new Error('Database not connected');
    }
    return this.client.query(sql, params);
  }

  async clearTable(tableName: string) {
    if (!this.client) {
      throw new Error('Database not connected');
    }
    await this.client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
  }

  async clearAllTables() {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    // Get all table names
    const result = await this.client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    // Truncate all tables
    for (const row of result.rows) {
      await this.clearTable(row.tablename);
    }
  }
}

export const testDb = new TestDatabase();
