export async function GET() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!refreshToken || !clientId || !clientSecret) {
      return Response.json({ error: 'Spotify credentials not configured' }, { status: 200 });
    }

    const refreshAccessToken = async () => {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.access_token;
    };

    const accessToken = await refreshAccessToken();
    if (!accessToken) return Response.json({ error: 'Auth failed' }, { status: 200 });

    // Get current user's playlists
    const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return Response.json({ error: 'Failed to fetch playlists' }, { status: 200 });
    const data = await res.json();

    // Map minimal payload + simple stats proxy (track count, owner)
    const playlists = (data.items || []).map(pl => ({
      id: pl.id,
      name: pl.name,
      tracks: pl.tracks?.total || 0,
      image: pl.images?.[0]?.url || null,
      url: pl.external_urls?.spotify || null,
      owner: pl.owner?.display_name || 'me'
    }));

    return Response.json({ playlists });
  } catch (e) {
    return Response.json({ error: 'Internal error' }, { status: 200 });
  }
}


