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
 * This function is intended for server-side rendering (SSR) of initial data.
 * Returns an array of simplified track summaries, or null if the request fails.
 * @param playlistId - The Spotify playlist ID to fetch (default is a sample playlist)
 */
export async function fetchPlaylistDataFromServer(
  playlistId: string = "4sm1LiCcKQDxZcgUqe1A7P"
): Promise<SpotifyTrackSummary[] | null> {
  try {
    // The first argument to URL constructor is relative to the path in the proxy API route.
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` // Add https:// for Vercel deployments
      : "http://localhost:3000"; // Local development URL already has http://

    const proxyUrl = new URL(
      // Pass the actual Spotify API endpoint as the 'endpoint' query parameter
      `/api/spotify-proxy-CPmcif6ulq?endpoint=playlists/${playlistId}/tracks?limit=5`,
      // Use the corrected baseUrl here
      baseUrl
    );

    // Make the fetch request to the proxy API
    const response = await fetch(proxyUrl.toString(), {
      // No 'Authorization' header needed here, the proxy handles token internally.
      // Cache for 1 hour.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // Attempt to read the response body as text first in case it's HTML or plain text,
      // as that's what's causing the problem.
      // If it's JSON, JSON.parse() can handle the string.
      let errorRawText = "No error body received.";
      try {
        errorRawText = await response.text(); // Read as text FIRST. This consumes the stream.
      } catch (e) {
        console.error("Failed to read response body as text:", e);
      }

      let errorData;
      try {
        // Now, try to parse the obtained text as JSON.
        // This won't throw "Body is unusable" because the stream is already read into errorRawText.
        errorData = JSON.parse(errorRawText);
      } catch {
        // If it's not valid JSON, just use the raw text.
        errorData = errorRawText;
      }

      console.error(
        "Server Utils: Failed to fetch playlist data via /api/spotify-proxy for SSR (Status:",
        response.status,
        ") Error:",
        errorData
      );
      return null; // Return null on failure to get data
    }

    // Parse the response from your proxy (which should be the raw Spotify data)
    const data = await response.json();

    // Basic check to ensure the structure is as expected from Spotify's API
    if (!data || !data.items) {
      console.error(
        "Server Utils: Proxy returned unexpected data structure for playlist items:",
        data
      );
      return null;
    }

    // Map to simplified track summaries as before
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
