export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new Response(`
      <html>
        <head>
          <title>Spotify Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">Authorization Error</h1>
          <p>Error: ${error}</p>
          <p><a href="/">Return to website</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!code) {
    return new Response(`
      <html>
        <head>
          <title>Spotify Authorization</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #27ae60; }
            pre { background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Spotify Authorization</h1>
          <p>No authorization code received. Please try again.</p>
          <p><a href="/">Return to website</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://caleb-k.com/api/spotify/callback'
      : 'http://localhost:3000/api/spotify/callback';

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Spotify API error: ${errorData.error_description || errorData.error}`);
    }

    const data = await response.json();
    const { access_token, refresh_token } = data;

    return new Response(`
      <html>
        <head>
          <title>Spotify Authorization Success</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #27ae60; }
            pre { background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: left; overflow-x: auto; }
            .token { word-break: break-all; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Spotify Authorization Successful!</h1>
          <p>Your Spotify integration is now configured.</p>
          
          <h3>Add these to your environment variables:</h3>
          <pre>
SPOTIFY_CLIENT_ID=${clientId}
SPOTIFY_CLIENT_SECRET=${clientSecret}
SPOTIFY_REFRESH_TOKEN=${refresh_token}
          </pre>
          
          <p><strong>Important:</strong> Save the refresh token securely. The access token will be automatically refreshed.</p>
          
          <p><a href="/">Return to your website</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Spotify callback error:', error);
    
    return new Response(`
      <html>
        <head>
          <title>Spotify Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Authorization Failed</h1>
          <p>Error: ${error.message}</p>
          <p><a href="/">Return to website</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
} 