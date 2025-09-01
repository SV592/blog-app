import { NextResponse, NextRequest } from "next/server";

// Token cache
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0; // Timestamp

// Get the app access token
const getAppAccessToken = async (): Promise<string | null> => {
  // Check for a valid, unexpired token in cache
  const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  if (
    cachedAccessToken &&
    Date.now() < tokenExpiryTime - TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedAccessToken;
  }

  // Token is expired or not present, fetch a new one
  try {
    // Call the spotify-app-token API route
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

    const tokenRoutePath: string | undefined =
      process.env.SPOTIFY_APP_TOKEN_ROUTE;
    if (!tokenRoutePath || tokenRoutePath.trim() === "") {
      throw new Error(
        "SPOTIFY_APP_TOKEN_ROUTE environment variable is not set or is empty."
      );
    }
    const tokenRouteUrl = new URL(tokenRoutePath, baseUrl);

    const response = await fetch(tokenRouteUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "No error body from /api/spotify-app-token",
      }));

      console.error(
        "Server (Proxy): Failed to get app access token from /api/spotify-app-token (Status:",
        response.status,
        ") Error:",
        errorData
      );
      cachedAccessToken = null; // Invalidate cache on failure
      tokenExpiryTime = 0;
      return null;
    }

    const data: { access_token: string; expires_in: number } =
      await response.json();

    cachedAccessToken = data.access_token;

    // Calculate expiry time: current time + expiresIn (in seconds) * 1000 (to milliseconds)
    tokenExpiryTime = Date.now() + data.expires_in * 1000;
    console.log(
      "Server (Proxy): Successfully fetched NEW access token via /api/spotify-app-token. Expires in:",
      data.expires_in,
      "seconds."
    );
    return cachedAccessToken;
  } catch (error) {
    console.error(
      "Server (Proxy): Error calling internal /api/spotify-app-token:",
      error
    );
    cachedAccessToken = null; // Invalidate cache on error
    tokenExpiryTime = 0;
    return null;
  }
};

/**
 * API route handler for proxying requests to the Spotify Web API.
 * Acquires the token internally if cached, so the client doesn't have to send it.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get("playlistId");
  const limit = url.searchParams.get("limit") || "5";

  if (!playlistId) {
    return NextResponse.json(
      { error: "Missing playlistId parameter." },
      { status: 400 }
    );
  }

  // Build the endpoint for Spotify API
  const endpoint = `playlists/${playlistId}/tracks?limit=${limit}`;

  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing Spotify API endpoint parameter." },
      { status: 400 }
    );
  }

  // Get access token internally ---
  const accessToken = await getAppAccessToken(); // Use caching or fetch from /api/spotify-app-token
  if (!accessToken) {
    // A server error
    return NextResponse.json(
      { error: "Failed to obtain Spotify access token for proxy request." },
      { status: 500 }
    );
  }

  try {
    // URLS
    const SPOTIFY_API_BASE_URL: string | undefined =
      process.env.SPOTIFY_API_BASE_URL;
    const endpointUrl = new URL(endpoint, SPOTIFY_API_BASE_URL);

    // Construct the full Spotify API URL
    const spotifyApiUrl: string = endpointUrl.href;

    // Forward the request to the Spotify API with the internally obtained access token
    const spotifyResponse: Response = await fetch(spotifyApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle various Spotify API response statuses
    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse
        .json()
        .catch(() => ({ message: "No error body from Spotify Web API" }));
      console.error(
        `Server (Proxy): Spotify Web API request failed for endpoint "${endpoint}" (Status: ${spotifyResponse.status}):`,
        errorData
      );

      // If Spotify rejects the token (401/403), invalidate the cache to get a new token
      if (spotifyResponse.status === 401 || spotifyResponse.status === 403) {
        console.log(
          "Server (Proxy): Received 401/403 from Spotify Web API, invalidating cached token to force re-acquisition."
        );
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
    return NextResponse.json(
      { error: "Proxy server internal error." },
      { status: 500 }
    );
  }
};
