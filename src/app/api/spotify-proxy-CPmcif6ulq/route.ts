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
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * API route handler for proxying requests to the Spotify Web API.
 * Acquires the token internally if cached, so the client doesn't have to send it.
 * Supports random song selection.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get("playlistId");
  const limitParam = url.searchParams.get("limit") || "5";
  const limit = parseInt(limitParam);
  const random = url.searchParams.get("random") === "true";

  if (!playlistId) {
    return NextResponse.json(
      { error: "Missing playlistId parameter." },
      { status: 400 }
    );
  }

  // Get access token internally
  const accessToken = await getAppAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Failed to obtain Spotify access token for proxy request." },
      { status: 500 }
    );
  }

  try {
    const SPOTIFY_API_BASE_URL: string | undefined =
      process.env.SPOTIFY_API_BASE_URL;

    if (random) {
      // Fetch playlist info to get total track count
      const playlistEndpoint = new URL(
        `playlists/${playlistId}`,
        SPOTIFY_API_BASE_URL
      );

      const playlistResponse = await fetch(playlistEndpoint.href, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!playlistResponse.ok) {
        const errorData = await playlistResponse
          .json()
          .catch(() => ({ message: "Failed to fetch playlist info" }));
        console.error(
          `Server (Proxy): Failed to fetch playlist info (Status: ${playlistResponse.status}):`,
          errorData
        );
        return NextResponse.json(errorData, {
          status: playlistResponse.status,
        });
      }

      const playlistData = await playlistResponse.json();
      const totalTracks = playlistData.tracks.total;

      // Generate random offsets
      const allIndices = Array.from({ length: totalTracks }, (_, i) => i);
      const randomIndices = shuffleArray(allIndices).slice(0, limit);

      // Fetch individual tracks at random positions
      const trackPromises = randomIndices.map(async (offset) => {
        const trackEndpoint = new URL(
          `playlists/${playlistId}/tracks?offset=${offset}&limit=1`,
          SPOTIFY_API_BASE_URL
        );

        const response = await fetch(trackEndpoint.href, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.items[0];
        }
        return null;
      });

      const tracks = (await Promise.all(trackPromises)).filter(
        (track) => track !== null
      );

      // Return in Spotify playlist format
      return NextResponse.json({
        items: tracks,
        total: totalTracks,
      });
    } else {
      
      const endpoint = `playlists/${playlistId}/tracks?limit=${limit}`;
      const endpointUrl = new URL(endpoint, SPOTIFY_API_BASE_URL);

      const spotifyResponse: Response = await fetch(endpointUrl.href, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!spotifyResponse.ok) {
        const errorData = await spotifyResponse
          .json()
          .catch(() => ({ message: "No error body from Spotify Web API" }));
        console.error(
          `Server (Proxy): Spotify Web API request failed (Status: ${spotifyResponse.status}):`,
          errorData
        );

        if (spotifyResponse.status === 401 || spotifyResponse.status === 403) {
          console.log(
            "Server (Proxy): Received 401/403 from Spotify Web API, invalidating cached token to force re-acquisition."
          );
          cachedAccessToken = null;
          tokenExpiryTime = 0;
        }
        return NextResponse.json(errorData, {
          status: spotifyResponse.status,
        });
      }

      const data = await spotifyResponse.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error(`Proxy server error:`, error);
    return NextResponse.json(
      { error: "Proxy server internal error." },
      { status: 500 }
    );
  }
};
