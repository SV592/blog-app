// app/api/spotify-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    const accessToken = request.headers.get('Authorization')?.split(' ')[1]; // Get token from request header

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token provided in request headers.' }, { status: 401 });
    }

    if (!endpoint) {
        return NextResponse.json({ error: 'Missing Spotify API endpoint.' }, { status: 400 });
    }

    try {
        const spotifyApiUrl = `https://api.spotify.com/v1/${endpoint}`;

        const spotifyResponse = await fetch(spotifyApiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (spotifyResponse.status === 401) {
            // Indicate to the client that the token might be expired.
            // Client-side will then trigger a refresh via /api/spotify-app-token.
            return NextResponse.json({ error: 'Access token expired or invalid', code: 'TOKEN_EXPIRED' }, { status: 401 });
        }

        if (!spotifyResponse.ok) {
            const errorData = await spotifyResponse.json();
            console.error(`Spotify API error for ${endpoint}:`, spotifyResponse.status, errorData);
            return NextResponse.json({ error: 'Spotify API error', details: errorData }, { status: spotifyResponse.status });
        }

        const data = await spotifyResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error(`Proxy error for ${endpoint}:`, error);
        return NextResponse.json({ error: 'Proxy server error.' }, { status: 500 });
    }
}