export async function GET() {
  try {
    // Get the access token from environment variable
    let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    
    if (!accessToken) {
      return Response.json({ 
        isPlaying: false, 
        error: 'Spotify access token not configured' 
      }, { status: 500 });
    }

    // Fetch currently playing track from Spotify API
    let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If token is expired, try to refresh it
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch('/api/spotify/refresh', {
          method: 'POST',
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          
          // Retry the request with new token
          response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        return Response.json({ 
          isPlaying: false, 
          error: 'Spotify token expired or invalid' 
        }, { status: 401 });
      }
      
      return Response.json({ 
        isPlaying: false, 
        error: 'Failed to fetch from Spotify API' 
      }, { status: response.status });
    }

    const data = await response.json();

    // If no track is currently playing
    if (!data.item) {
      return Response.json({ isPlaying: false });
    }

    // Extract track information
    const track = {
      title: data.item.name,
      artist: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images[0]?.url,
      url: data.item.external_urls.spotify,
      isPlaying: data.is_playing,
      progress: data.progress_ms,
      duration: data.item.duration_ms,
    };

    return Response.json(track);
  } catch (error) {
    console.error('Spotify API error:', error);
    return Response.json({ 
      isPlaying: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 