# Spotify API Setup Guide

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in:
   - App name: "Personal Portfolio Website"
   - App description: "Vinyl record portfolio with Spotify integration"
   - Redirect URI: `http://localhost:3000` (for development)

## Step 2: Get Your Credentials

After creating the app:
1. Copy the **Client ID** from your app settings
2. Note down the **Redirect URI** you set

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000
```

## Step 4: For Production Deployment

When deploying to production:
1. Update the Redirect URI in your Spotify app settings to your production domain
2. Update the environment variable:
```bash
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourdomain.com
```

## Features

Once set up, your vinyl record will:
- Show the album art of your currently playing Spotify track
- Display track name, artist, and album below the vinyl
- Show your top 5 tracks
- Rotate faster when music is playing
- Smoothly transition between album arts

## Permissions Required

The app requests these Spotify permissions:
- `user-read-currently-playing` - To see what you're currently listening to
- `user-read-playback-state` - To know if music is playing or paused
- `user-top-read` - To show your top tracks
- `user-read-recently-played` - For enhanced track history 