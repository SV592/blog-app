import { NextResponse } from 'next/server';

// Type for the response from Spotify's token endpoint
type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

/**
 * API route handler for GET requests to retrieve a Spotify app access token.
 * Uses the Client Credentials flow to get an app-level token from Spotify.
 */
export const POST = async (): Promise<NextResponse> => {
  // Read Spotify credentials from environment variables
  const CLIENT_ID: string | undefined = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET: string | undefined = process.env.SPOTIFY_CLIENT_SECRET;

  // If credentials are missing, return an error response
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Spotify API credentials not set in environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Request an app access token from Spotify
    const response: Response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString()
    });

    // If the response is not OK, log and return an error
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to get app token from Spotify:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to get app token from Spotify', details: errorData },
        { status: response.status }
      );
    }

    // Parse the token response and return the access token and expiry
    const data: SpotifyTokenResponse = await response.json();
    return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in });

  } catch (error) {
    // Handle and log server/network errors
    console.error('Server error getting app token:', error);
    return NextResponse.json(
      { error: 'Internal server error getting app token.' },
      { status: 500 }
    );
  }
}