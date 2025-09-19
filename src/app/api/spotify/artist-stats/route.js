export async function GET(request) {
  try {
    const url = new URL(request.url);
    const artist = url.searchParams.get('artist');
    if (!artist) {
      return Response.json({ error: 'Missing artist' }, { status: 400 });
    }

    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!refreshToken || !clientId || !clientSecret) {
      return Response.json({ error: 'Spotify credentials not configured' }, { status: 200 });
    }

    const refreshAccessToken = async () => {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token;
      } catch {
        return null;
      }
    };

    let accessToken = await refreshAccessToken();
    if (!accessToken) {
      return Response.json({ error: 'Failed to authenticate with Spotify' }, { status: 200 });
    }

    // Search for artist id
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!searchRes.ok) return Response.json({ error: 'Artist search failed' }, { status: 200 });
    const searchData = await searchRes.json();
    const artistItem = searchData.artists?.items?.[0];
    if (!artistItem) return Response.json({ error: 'Artist not found' }, { status: 200 });

    // Build top tracks list for this artist from user's top tracks (long + medium term)
    const ranges = ['long_term', 'medium_term'];
    const seen = new Map();
    for (const range of ranges) {
      const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${range}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) continue;
      const data = await res.json();
      (data.items || []).forEach(t => {
        const hasArtist = t.artists?.some(a => a.id === artistItem.id);
        if (!hasArtist) return;
        if (!seen.has(t.id)) {
          seen.set(t.id, {
            id: t.id,
            name: t.name,
            album: t.album?.name,
            url: t.external_urls?.spotify,
            image: t.album?.images?.[0]?.url,
            popularity: t.popularity ?? 0,
          });
        }
      });
    }
    const topTracks = Array.from(seen.values()).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10);

    // Build minimal stats payload
    const payload = {
      artist: {
        id: artistItem.id,
        name: artistItem.name,
        followers: artistItem.followers?.total,
        genres: artistItem.genres,
        image: artistItem.images?.[0]?.url,
        popularity: artistItem.popularity,
      },
      topTracks,
    };

    return Response.json(payload);
  } catch (e) {
    return Response.json({ error: 'Internal error' }, { status: 200 });
  }
}


