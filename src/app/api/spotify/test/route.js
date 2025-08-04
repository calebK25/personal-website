export async function GET() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;

    const config = {
      hasRefreshToken: !!refreshToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasAccessToken: !!accessToken,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
      clientIdLength: clientId ? clientId.length : 0,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      accessTokenLength: accessToken ? accessToken.length : 0,
    };

    return Response.json({
      message: 'Spotify configuration test',
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return Response.json({ 
      error: 'Test endpoint failed' 
    }, { status: 500 });
  }
} 