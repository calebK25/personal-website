export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return Response.json({ 
        error: 'Authorization failed', 
        details: error 
      }, { status: 400 });
    }

    if (!code) {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      if (!clientId) {
        return Response.json({ 
          error: 'SPOTIFY_CLIENT_ID not configured' 
        }, { status: 400 });
      }

      const scope = encodeURIComponent('user-read-currently-playing user-top-read playlist-read-private');
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent('http://localhost:3000/api/spotify/setup')}&scope=${scope}`;
      
      return Response.json({
        message: 'Visit this URL to authorize Spotify',
        authUrl,
        instructions: '1. Visit the authUrl above\n2. Authorize your Spotify account\n3. Copy the code from the redirect URL\n4. Add ?code=YOUR_CODE to this endpoint'
      });
    }

    // Exchange code for tokens
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json({ 
        error: 'Spotify credentials not configured' 
      }, { status: 400 });
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/api/spotify/setup',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return Response.json({ 
        error: 'Failed to exchange code for tokens',
        details: errorData
      }, { status: 400 });
    }

    const data = await response.json();

    return Response.json({
      message: 'Success! Here are your tokens:',
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
      },
      instructions: [
        '1. Copy the refresh_token value above',
        '2. Add it to your .env.local file as SPOTIFY_REFRESH_TOKEN',
        '3. Add it to your Vercel environment variables',
        '4. The access_token will be automatically obtained using the refresh_token'
      ]
    });

  } catch (error) {
    console.error('Setup endpoint error:', error);
    return Response.json({ 
      error: 'Setup failed',
      details: error.message
    }, { status: 500 });
  }
} 