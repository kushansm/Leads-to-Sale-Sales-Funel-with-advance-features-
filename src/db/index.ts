import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as crmSchema from './crm-schema';

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/crm';

const client = postgres(connectionString);
export const db = drizzle(client, { schema: { ...schema, ...crmSchema } });
