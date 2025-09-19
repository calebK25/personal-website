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

    // Get user top tracks long_term and pick top for this artist
    const topRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    let topTrack = null;
    if (topRes.ok) {
      const topData = await topRes.json();
      topTrack = topData.items?.find(t => t.artists?.some(a => a.id === artistItem.id));
    }

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
      topTrack: topTrack ? {
        id: topTrack.id,
        name: topTrack.name,
        album: topTrack.album?.name,
        url: topTrack.external_urls?.spotify,
        image: topTrack.album?.images?.[0]?.url,
      } : null,
    };

    return Response.json(payload);
  } catch (e) {
    return Response.json({ error: 'Internal error' }, { status: 200 });
  }
}


