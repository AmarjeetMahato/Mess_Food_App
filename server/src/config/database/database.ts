
// src/config/db.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle, NodePgTransaction } from 'drizzle-orm/node-postgres';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '../models';


// const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

const connectionString =  process.env.DATABASE_URL!;


// Create a PostgreSQL pool
const pool = new Pool({
  connectionString,
   ssl: isProduction
    ? { rejectUnauthorized: false } // cloud / production
    : false,
});

// Export the Drizzle ORM instance
export const db = drizzle(pool);

export type DrizzleDb = typeof db;
// Transaction type
export type DrizzleTx = NodePgTransaction<
  typeof schema,                     // TFullSchema = your schema object
  ExtractTablesWithRelations<typeof schema> // TSchema = relational info
>;



// Can be either a normal db instance or an active transaction
export type DbOrTx = DrizzleDb | DrizzleTx;