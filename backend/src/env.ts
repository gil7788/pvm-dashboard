import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Schema to validate .env variables
const envSchema = z.object({
  ENV: z.enum(['dev', 'production']),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  PORT: z.string().default('3001'),
  DB_URI: z.string().url('DB_URI must be a valid URL'),
  MONGO_URI: z.string().url('MONGO_URI must be a valid URL').optional(),
  CONNECTION_STRING: z.string().url('CONNECTION_STRING must be a valid URL').optional(),
  LOG_DIRECTORY: z.string().default('./logs'),
});

// Safe parse to handle errors cleanly
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

// Runtime helpers
function getRuntimeDatabaseFullName(): string {
  return `${env.ENV}_${env.DB_NAME}`;
}

function getDatabaseConnectionString(): string {
  return `${env.DB_URI}/${getRuntimeDatabaseFullName()}`;
}

// Strings dictionary
export const strings = {
  DEV_ENV: 'dev',
  PRODUCTION_ENV: 'production',
};

// Final config object
interface Config {
  dbName: string;
  port: string;
  env: 'dev' | 'production';
  connectionString: string;
  strings: Record<string, string>;
  logDirectory: string;
}

const config: Config = {
  dbName: getRuntimeDatabaseFullName(),
  port: env.PORT,
  env: env.ENV,
  connectionString: getDatabaseConnectionString(),
  strings,
  logDirectory: env.LOG_DIRECTORY,
};

console.log('✅ Config loaded successfully:', config);

export default config;
