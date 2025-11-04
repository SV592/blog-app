// Type definitions for Spotify API responses
type SpotifyArtist = {
  name: string;
};

type SpotifyImage = {
  url: string;
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  album: {
    images: SpotifyImage[];
  };
  uri: string;
};

type SpotifyPlaylistItem = {
  track: SpotifyTrack;
};

// Track summary type
type SpotifyTrackSummary = {
  id: string;
  name: string;
  artists: string;
  duration_ms: number;
  albumImageUrl: string;
  uri: string;
};

/**
 * Fetches playlist data from Spotify for a given playlist ID by calling the /api/spotify-proxy route.
 * For intended for server-side rendering (SSR) of initial data.
 * Returns an array of simplified track summaries, or null if the request fails.
 * @param playlistId - The Spotify playlist ID to fetch
 */
export async function fetchPlaylistDataFromServer(
  playlistId?: string
): Promise<SpotifyTrackSummary[] | null> {
  try {
    const resolvedPlaylistId =
      playlistId || process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID;

    // Use proxy API route from env
    const proxyRoute: string | undefined =
      process.env.NEXT_PUBLIC_SPOTIFY_PROXY_ROUTE;

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

    if (!proxyRoute || proxyRoute.trim() === "") {
      console.error(
        "Server Utils: NEXT_PUBLIC_SPOTIFY_PROXY_ROUTE is not defined or is empty."
      );
      return null;
    }

    // Build the proxy URL and pass playlistId and limit as separate params (avoids double '?')
    const proxyUrl = new URL(proxyRoute, baseUrl);
    proxyUrl.searchParams.set("playlistId", resolvedPlaylistId ?? "");
    proxyUrl.searchParams.set("limit", "5");
    proxyUrl.searchParams.set("random", "true");

    // Make the fetch request to the proxy API
    const response = await fetch(proxyUrl.toString(), {
      // Cache: 1 hour in production, no cache in development
      ...(process.env.NODE_ENV === 'production'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as RequestCache }
      ),
    });

    if (!response.ok) {
      let errorRawText = "No error body received.";
      try {
        errorRawText = await response.text();
      } catch (e) {
        console.error("Failed to read response body as text:", e);
      }

      let errorData;
      try {
        errorData = JSON.parse(errorRawText);
      } catch {
        errorData = errorRawText;
      }

      console.error(
        "Server Utils: Failed to fetch playlist data via /api/spotify-proxy for SSR (Status:",
        response.status,
        ") Error:",
        errorData
      );
      return null;
    }

    // Parse the response from proxy
    const data = await response.json();

    // Ensure the structure is as expected from Spotify's API
    if (!data || !data.items) {
      console.error(
        "Server Utils: Proxy returned unexpected data structure for playlist items:",
        data
      );
      return null;
    }

    // Map to simplified track summaries
    return data.items.map((item: SpotifyPlaylistItem) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists
        .map((artist: SpotifyArtist) => artist.name)
        .join(", "),
      duration_ms: item.track.duration_ms,
      albumImageUrl: item.track.album.images[0]?.url || "",
      uri: item.track.uri,
    }));
  } catch (error) {
    // Log server or network errors during the fetch to your proxy
    console.error(
      "Server Utils: Error fetching playlist data from proxy:",
      error
    );
    return null;
  }
}
