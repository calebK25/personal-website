"use client";
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import SpotifyDisplay from './SpotifyDisplay';

const SpotifyPlayer = ({ onTrackChange }) => {
  const { data: session, status } = useSession();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const fetchCurrentTrack = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data && data.item) {
          const track = {
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists[0].name,
            album: data.item.album.name,
            image: data.item.album.images[0]?.url,
            isPlaying: data.is_playing,
            uri: data.item.uri,
            external_urls: data.item.external_urls,
            progress_ms: data.progress_ms,
            duration_ms: data.item.duration_ms
          };
          setCurrentTrack(track);
          onTrackChange?.(track);
        }
      } else if (response.status === 204) {
        setCurrentTrack(null);
        onTrackChange?.(null);
      } else if (response.status === 401) {
        signOut();
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  };

  const fetchRecentlyPlayed = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tracks = data.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          image: item.track.album.images[2]?.url,
          uri: item.track.uri,
          external_urls: item.track.external_urls,
          played_at: item.played_at
        }));
        setRecentlyPlayed(tracks);
      } else if (response.status === 401) {
        signOut();
      }
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  };

  const fetchTopTracks = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tracks = data.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[2]?.url,
          uri: track.uri,
          external_urls: track.external_urls
        }));
        setTopTracks(tracks);
      } else if (response.status === 401) {
        signOut();
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchCurrentTrack();
      fetchTopTracks();
      fetchRecentlyPlayed();
      
      const interval = setInterval(() => {
        fetchCurrentTrack();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session?.access_token]);

  if (status === "loading") {
    return (
      <div className="spotify-player">
        <div className="spotify-loading">
          <p>Loading Spotify integration...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="spotify-player">
        <div className="spotify-auth">
          <button className="spotify-login-btn" onClick={() => signIn('spotify')}>
            Connect Spotify
          </button>
          <p className="spotify-description">
            Connect your Spotify account to see what you're currently playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-player">
      <SpotifyDisplay 
        recentlyPlayed={recentlyPlayed}
        topTracks={topTracks}
      />
    </div>
  );
};

export default SpotifyPlayer; 