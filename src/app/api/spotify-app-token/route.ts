// app/api/spotify-app-token/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        return NextResponse.json({ error: 'Spotify API credentials not set in environment variables.' }, { status: 500 });
    }

    try {
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
            const errorData = await response.json();
            console.error('Failed to get app token from Spotify:', response.status, errorData);
            return NextResponse.json({ error: 'Failed to get app token from Spotify', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in });

    } catch (error) {
        console.error('Server error getting app token:', error);
        return NextResponse.json({ error: 'Internal server error getting app token.' }, { status: 500 });
    }
}

// 4sm1LiCcKQDxZcgUqe1A7P