export async function GET() {
  try {
    // Check if we have the required credentials
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      console.log('Spotify credentials not configured');
      return Response.json({ 
        isPlaying: false, 
        error: 'Spotify credentials not configured' 
      }, { status: 200 }); // Return 200 instead of 500 for missing config
    }

    // Helper function to refresh access token
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

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Spotify token refresh failed:', response.status, errorData);
          return null;
        }

        const data = await response.json();
        return data.access_token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      }
    };

    // Get or refresh access token
    let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    
    // If no access token, get one using refresh token
    if (!accessToken) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return Response.json({ 
          isPlaying: false, 
          error: 'Failed to authenticate with Spotify' 
        }, { status: 200 });
      }
    }

    // Fetch currently playing track from Spotify API
    // According to Spotify docs: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
    let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If token is expired (401), try to refresh it
    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return Response.json({ 
          isPlaying: false, 
          error: 'Authentication failed' 
        }, { status: 200 });
      }
      
      // Retry the request with new token
      response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle different response statuses
    if (!response.ok) {
      if (response.status === 204) {
        // 204 means no content - user is not playing anything
        return Response.json({ isPlaying: false });
      }
      
      if (response.status === 401) {
        return Response.json({ 
          isPlaying: false, 
          error: 'Spotify token expired or invalid' 
        }, { status: 200 });
      }
      
      console.error('Spotify API error:', response.status, response.statusText);
      return Response.json({ 
        isPlaying: false, 
        error: 'Failed to fetch from Spotify API' 
      }, { status: 200 });
    }

    const data = await response.json();

    // If no track is currently playing
    if (!data.item) {
      return Response.json({ isPlaying: false });
    }

    // Extract track information according to Spotify API response structure
    const track = {
      title: data.item.name,
      artist: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images[0]?.url,
      url: data.item.external_urls.spotify,
      isPlaying: data.is_playing || false,
      progress: data.progress_ms,
      duration: data.item.duration_ms,
    };

    return Response.json(track);
  } catch (error) {
    console.error('Spotify API error:', error);
    return Response.json({ 
      isPlaying: false, 
      error: 'Internal server error' 
    }, { status: 200 }); // Return 200 instead of 500 to avoid breaking the frontend
  }
} 