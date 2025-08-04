export async function POST() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      console.error('Missing Spotify credentials for token refresh');
      return Response.json({ 
        error: 'Spotify credentials not configured' 
      }, { status: 400 });
    }

    // Exchange refresh token for new access token
    // According to Spotify docs: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
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
      const errorData = await response.text();
      console.error('Spotify token refresh failed:', response.status, errorData);
      
      if (response.status === 400) {
        return Response.json({ 
          error: 'Invalid refresh token or credentials' 
        }, { status: 400 });
      }
      
      return Response.json({ 
        error: 'Failed to refresh token' 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Validate the response
    if (!data.access_token) {
      console.error('No access token in refresh response');
      return Response.json({ 
        error: 'Invalid response from Spotify' 
      }, { status: 500 });
    }
    
    return Response.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type || 'Bearer',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json({ 
      error: 'Internal server error during token refresh' 
    }, { status: 500 });
  }
} 