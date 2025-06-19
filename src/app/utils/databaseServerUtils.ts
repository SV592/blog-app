import { Pool, QueryResult } from 'pg';

// Initialize PostgreSQL connection pool
// This pool will be reused across all requests, which is efficient for serverless functions.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a SQL query against the PostgreSQL database.
 * @param text The SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns A promise that resolves to the query result.
 */
export const query = async (text: string, params: unknown[] = []):  Promise<QueryResult> => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release(); // Always release the client back to the pool
  }
}