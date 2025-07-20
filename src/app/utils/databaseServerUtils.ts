import { Pool, QueryResult, DatabaseError } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Retry Configuration ---
const MAX_RETRIES = 3; // Maximum number of attempts (1 initial try + 2 retries)
const INITIAL_RETRY_DELAY_MS = 100; // Initial delay before first retry in milliseconds

/**
 * Executes a SQL query against the PostgreSQL database with retry logic and enhanced logging.
 * @param text The SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns A promise that resolves to the query result.
 * @throws An error if the query fails after all retries.
 */
export const query = async (
  text: string,
  params: unknown[] = []
): Promise<QueryResult> => {
  let client;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Always try to get a fresh client for each attempt in case the previous one was bad
      client = await pool.connect();
      const res = await client.query(text, params);
      return res; // Query successful, exit function
    } catch (error: unknown) {
      // --- Error Logging ---
      console.error(
        `Database query failed (Attempt ${attempt}/${MAX_RETRIES}):`
      );
      console.error(`  Query: ${text.substring(0, 100)}...`); // Log part of the query
      if (params.length > 0) {
        console.error(`  Params: ${JSON.stringify(params)}`);
      }

      if (error instanceof Error) {
        console.error(`  Error message: ${error.message}`);
        // If it's a PostgreSQL specific error, log more details from the pg client
        if (error instanceof DatabaseError) {
          console.error(`  DB Error Code: ${error.code}`); // PostgreSQL error code (e.g., '23505' for unique_violation)
          console.error(`  DB Severity: ${error.severity}`); // 'ERROR', 'FATAL'
          console.error(`  DB Detail: ${error.detail}`); // More specific info
          console.error(`  DB Hint: ${error.hint}`); // Suggestions for fixing
          console.error(`  DB Position: ${error.position}`); // Position in query where error occurred
        }
        // Log stack trace in non-production environments for detailed debugging
        if (process.env.NODE_ENV !== "production") {
          console.error(`  Stack: ${error.stack}`);
        }
      } else {
        console.error("  Unknown error occurred:", error);
      }

      // --- Retry Logic ---
      if (attempt < MAX_RETRIES) {
        // Exponential backoff strategy: 100ms, 200ms, 400ms, etc.
        const delay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);
        console.log(`  Retrying query in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Max retries reached, re-throw the last error
        console.error(
          `Database query permanently failed after ${MAX_RETRIES} attempts. Throwing error.`
        );
        throw error;
      }
    } finally {
      // Ensure the client is released even if it was just acquired and failed,
      // but only if `client` was actually assigned (i.e., `pool.connect()` succeeded).
      if (client) {
        client.release();
      }
    }
  }

  // This line should theoretically never be reached if an error is always thrown
  // on final failure or success, but included for completeness or if logic changes.
  throw new Error("Query execution failed unexpectedly after all retries.");
};
