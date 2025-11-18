import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'nexus',
    password: process.env.DB_PASSWORD || 'nexus_secure_pass',
    database: process.env.DB_NAME || 'nexus_education',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

export default config;
