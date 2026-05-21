import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../server/db.js';

const schemaPath = path.resolve('supabase/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const client = await pool.connect();
try {
  console.log('Applying schema...');
  await client.query(schemaSql);
  console.log('Schema applied successfully.');
} catch (error) {
  console.error('Error applying schema:', error);
} finally {
  client.release();
  await pool.end();
}
