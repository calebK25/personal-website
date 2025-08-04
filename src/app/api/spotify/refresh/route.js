export async function POST() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      return Response.json({ 
        error: 'Spotify credentials not configured' 
      }, { status: 500 });
    }

    // Exchange refresh token for new access token
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

    if (!response.ok) {
      return Response.json({ 
        error: 'Failed to refresh token' 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 