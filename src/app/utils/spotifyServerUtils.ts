const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/**
 * Retrieves an app-level access token from Spotify using Client Credentials flow.
 * Returns the access token as a string, or null if credentials are missing or request fails.
 */
async function getAppAccessToken(): Promise<string | null> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('Spotify API credentials not set in environment variables.');
        return null;
    }

    try {
        // Request a token from Spotify's accounts service
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials'
            }).toString()
        });

        if (!response.ok) {
            // Log error details if token request fails
            const errorData = await response.json();
            console.error('Failed to get app token from Spotify:', response.status, errorData);
            return null;
        }

        // Parse and return the access token from the response
        const data = await response.json();
        return data.access_token;

    } catch (error) {
        // Log server or network errors
        console.error('Server error getting app token:', error);
        return null;
    }
}

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

// Simplified track summary type for use in the app
type SpotifyTrackSummary = {
    id: string;
    name: string;
    artists: string;
    duration_ms: number;
    albumImageUrl: string;
    uri: string;
};

/**
 * Fetches playlist data from Spotify for a given playlist ID.
 * Returns an array of simplified track summaries, or null if the request fails.
 * @param playlistId - The Spotify playlist ID to fetch (default is a sample playlist)
 */
export async function fetchPlaylistDataFromServer( playlistId: string = '4sm1LiCcKQDxZcgUqe1A7P'): Promise<SpotifyTrackSummary[] | null> {
    
    // Get an app access token
    const accessToken = await getAppAccessToken();
    if (!accessToken) {
        return null;
    }

    try {
        // Fetch tracks from the specified playlist (limit to 5 tracks)
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            // Log error details if playlist fetch fails
            const errorData = await response.json().catch(() => ({ message: 'No error body from Spotify' }));
            console.error('Failed to fetch playlist data from Spotify:', response.status, errorData);
            return null;
        }

        // Parse the response and map to simplified track summaries
        const data = await response.json();
        return data.items.map((item: SpotifyPlaylistItem) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((artist: SpotifyArtist) => artist.name).join(', '),
            duration_ms: item.track.duration_ms,
            albumImageUrl: item.track.album.images[0]?.url || '',
            uri: item.track.uri,
        }));
    } catch (error) {
        // Log server or network errors
        console.error('Error fetching playlist data:', error);
        return null;
    }
}