import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../utils/databaseServerUtils'; // <-- Adjusted import path

/**
 * Handles POST requests to subscribe an email address.
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { email }: { email?: string } = await req.json();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 });
    }

    const checkEmailQuery = 'SELECT id FROM subscribers WHERE email = $1';
    const emailExists = await query(checkEmailQuery, [email]); // <-- USE 'query'

    if (emailExists.rows.length > 0) {
      return NextResponse.json({ message: 'Email already subscribed.' }, { status: 409 });
    }

    const insertQuery = 'INSERT INTO subscribers(email) VALUES($1) RETURNING id';
    const result = await query(insertQuery, [email]); // <-- USE 'query'

    return NextResponse.json(
      { message: 'Successfully subscribed!', id: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving email to database:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500});
  }
};