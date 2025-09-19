export async function GET() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!refreshToken || !clientId || !clientSecret) {
      return Response.json({ tracks: [] }, { status: 200 });
    }

    const refreshAccessToken = async () => {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.access_token;
    };

    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      return Response.json({ tracks: [] }, { status: 200 });
    }

    // Short term ~ 4 weeks top tracks
    const res = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return Response.json({ tracks: [] }, { status: 200 });
    const data = await res.json();
    const tracks = (data.items || []).map(t => ({
      id: t.id,
      name: t.name,
      artists: (t.artists || []).map(a => a.name).join(', '),
    }));
    return Response.json({ tracks }, { status: 200 });
  } catch {
    return Response.json({ tracks: [] }, { status: 200 });
  }
}


