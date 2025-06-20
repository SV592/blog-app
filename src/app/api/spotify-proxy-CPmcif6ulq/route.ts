import { NextResponse, NextRequest } from 'next/server';

// Token cache
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0; // Timestamp

// Get the app access token
const getAppAccessToken = async (): Promise<string | null> => {
    
    // Check for a valid, unexpired token in cache
    const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

    if (cachedAccessToken && (Date.now() < tokenExpiryTime - TOKEN_REFRESH_BUFFER_MS)) {
        return cachedAccessToken;
    }

    // Token is expired or not present, fetch a new one from your dedicated API route
    try {
        // Call the spotify-app-token API route
        // Use process.env.NEXT_PUBLIC_VERCEL_URL for production deployment
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` // Add https:// for Vercel deployments
            : 'http://localhost:3000'; // Local development URL already has http://

        const tokenRouteUrl = new URL('/api/spotify-app-token-S2Fg3uMRzH', baseUrl);

        const response = await fetch(tokenRouteUrl.toString());

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No error body from /api/spotify-app-token' }));
            console.error('Server (Proxy): Failed to get app access token from /api/spotify-app-token (Status:', response.status, ') Error:', errorData);
            cachedAccessToken = null; // Invalidate cache on failure
            tokenExpiryTime = 0;
            return null;
        }

        const data: { access_token: string; expires_in: number } = await response.json();
        
        cachedAccessToken = data.access_token;
        // Calculate expiry time: current time + expiresIn (in seconds) * 1000 (to milliseconds)
        tokenExpiryTime = Date.now() + (data.expires_in * 1000);
        console.log('Server (Proxy): Successfully fetched NEW access token via /api/spotify-app-token. Expires in:', data.expires_in, 'seconds.');
        return cachedAccessToken;

    } catch (error) {
        console.error('Server (Proxy): Error calling internal /api/spotify-app-token:', error);
        cachedAccessToken = null; // Invalidate cache on error
        tokenExpiryTime = 0;
        return null;
    }
}

/**
 * API route handler for proxying requests to the Spotify Web API.
 * Acquires the token internally, so the client doesn't send it.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const url = new URL(request.url);
    const endpoint: string | null = url.searchParams.get('endpoint');

    if (!endpoint) {
        return NextResponse.json({ error: 'Missing Spotify API endpoint parameter.' }, { status: 400 });
    }

    // Get access token internally ---
    const accessToken = await getAppAccessToken(); // This will use caching or fetch from /api/spotify-app-token
    if (!accessToken) {
        // If we can't get a token internally, it's a server error
        return NextResponse.json({ error: 'Failed to obtain Spotify access token for proxy request.' }, { status: 500 });
    }

    try {
        // Construct the full Spotify API URL
        const spotifyApiUrl: string = `https://api.spotify.com/v1/${endpoint}`;

        // Forward the request to the Spotify API with the internally obtained access token
        const spotifyResponse: Response = await fetch(spotifyApiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Handle various Spotify API response statuses
        if (!spotifyResponse.ok) {
            const errorData = await spotifyResponse.json().catch(() => ({ message: 'No error body from Spotify Web API' }));
            console.error(`Server (Proxy): Spotify Web API request failed for endpoint "${endpoint}" (Status: ${spotifyResponse.status}):`, errorData);
            
            // If Spotify rejects the token (401/403), invalidate our cache to force a new token acquisition next time
            if (spotifyResponse.status === 401 || spotifyResponse.status === 403) {
                console.log('Server (Proxy): Received 401/403 from Spotify Web API, invalidating cached token to force re-acquisition.');
                cachedAccessToken = null; // Clear the cache
                tokenExpiryTime = 0;
            }
            return NextResponse.json(errorData, { status: spotifyResponse.status });
        }

        // Parse and return the successful response from Spotify
        const data = await spotifyResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        // Log and return a generic proxy server error for unexpected issues
        console.error(`Proxy server error for ${endpoint}:`, error);
        return NextResponse.json({ error: 'Proxy server internal error.' }, { status: 500});
    }
};