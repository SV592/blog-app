import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../utils/databaseServerUtils';

// --- Rate Limiting Configuration ---
const rateLimit = new Map<string, { count: number; lastRequest: number }>();
const MAX_REQUESTS = 3; // Allow 3 requests
const TIME_WINDOW_MS = 60 * 1000; // Within 60 seconds (1 minute)

/**
 * Handles POST requests to subscribe an email address.
 * Validates the email, checks for duplicates, and inserts into the database.
 * Returns appropriate status codes and messages for each scenario.
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  // --- Rate Limiting Logic ---
  // Get client IP from x-forwarded-for header or fallback to 'unknown'
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const now = Date.now();

  let clientData = rateLimit.get(ip);

  // If no data for this IP or time window has passed, reset
  if (!clientData || (now - clientData.lastRequest) > TIME_WINDOW_MS) {
    clientData = { count: 1, lastRequest: now };
    rateLimit.set(ip, clientData);
  } else {
    // Increment count
    clientData.count++;
    rateLimit.set(ip, clientData); // Update map
  }

  // Check if rate limit exceeded
  if (clientData.count > MAX_REQUESTS) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429 } // 429 Too Many Requests
    );
  }
  // --- End Rate Limiting Logic ---

  try {
    // Parse the request body to get the email
    const { email }: { email?: string } = await req.json();

    // Basic server-side email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 });
    }

    // Check if the email already exists in the database using the query utility
    const checkEmailQuery = 'SELECT id FROM subscribers WHERE email = $1';
    const emailExists = await query(checkEmailQuery, [email]);

    if (emailExists.rows.length > 0) {
      // Email already subscribed
      return NextResponse.json({ message: 'Email already subscribed.' }, { status: 409 });
    }

    // Insert the new email into the database
    const insertQuery = 'INSERT INTO subscribers(email) VALUES($1) RETURNING id';
    const result = await query(insertQuery, [email]);

    // Return success response with the new subscriber's ID
    return NextResponse.json(
      { message: 'Successfully subscribed!', id: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    // Log and return server error
    console.error('Error saving email to database:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500});
  }
};