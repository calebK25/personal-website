"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import gsap from "gsap";

const MusicPage = () => {
  const titleRef = useRef();
  const contentRef = useRef();
  const { data: session, status } = useSession();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [activeTab, setActiveTab] = useState("top");
  const [userProfile, setUserProfile] = useState(null);


  useEffect(() => {
    // Animate elements on mount
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )
    .fromTo(".music-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );
  }, []);

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
            progress_ms: data.progress_ms,
            duration_ms: data.item.duration_ms,
            external_urls: data.item.external_urls
          };
          setCurrentTrack(track);
        }
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  };

  const fetchTopTracks = async () => {
    if (!session?.access_token) {
      console.log('No access token for top tracks');
      return;
    }

    try {
      console.log('Fetching top tracks...');
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Top tracks response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Top tracks data:', data);
        setTopTracks(data.items || []);
      } else {
        console.error('Top tracks API error - Status:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('Top tracks API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  const fetchRecentlyPlayed = async () => {
    if (!session?.access_token) {
      console.log('No access token for recently played');
      return;
    }

    try {
      console.log('Fetching recently played...');
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Recently played response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Recently played data:', data);
        setRecentlyPlayed(data.items?.map(item => item.track) || []);
      } else {
        console.error('Recently played API error - Status:', response.status, response.statusText);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.error('Unauthorized - Token may be expired or invalid');
        } else if (response.status === 403) {
          console.error('Forbidden - App may not have required permissions');
        } else if (response.status === 429) {
          console.error('Rate limited - Too many requests');
        }
        
        try {
          const errorData = await response.json();
          console.error('Recently played API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching recently played:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!session?.access_token) {
      console.log('No access token for user profile');
      return;
    }

    try {
      console.log('Fetching user profile...');
      console.log('Access token (first 20 chars):', session.access_token.substring(0, 20) + '...');
      console.log('Token expires at:', session.expires_at, 'Current time:', Math.floor(Date.now() / 1000));
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('User profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User profile data:', data);
        setUserProfile(data);
      } else {
        console.error('User profile API error - Status:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('User profile API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (session?.access_token && !session?.error) {
      console.log('=== Starting Spotify API calls ===');
      fetchUserProfile();
      
      // Add delay between API calls to avoid rate limiting
      setTimeout(() => fetchCurrentTrack(), 500);
      setTimeout(() => fetchTopTracks(), 1000);
      setTimeout(() => fetchRecentlyPlayed(), 1500);
      
      const interval = setInterval(() => {
        fetchCurrentTrack();
      }, 10000);

      return () => clearInterval(interval);
    } else if (session?.error) {
      console.error('Session error:', session.error);
    }
  }, [session?.access_token, session?.error]);

  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentTrack?.progress_ms || !currentTrack?.duration_ms) return 0;
    return (currentTrack.progress_ms / currentTrack.duration_ms) * 100;
  };



  if (status === "loading") {
    return (
      <div className="music-page">
        <div className="page-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="loading-state"
          >
            Loading music data...
          </motion.div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="music-page">
        <div className="page-content">
          <h1 ref={titleRef} className="page-title music-title">
            Music
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="connect-section"
          >
            <div className="connect-content">
              <div className="connect-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-mint)">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3>Connect to Spotify</h3>
              <p>Connect your Spotify account to see your music activity</p>
              <button 
                className="connect-button"
                onClick={() => signIn('spotify')}
              >
                Connect Spotify
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Session:', session);
  console.log('User profile:', userProfile);
  console.log('Top tracks:', topTracks);
  console.log('Recently played:', recentlyPlayed);
  console.log('Active tab:', activeTab);

  return (
    <div className="music-page">
      <div className="page-content">
        <h1 ref={titleRef} className="page-title music-title">Music</h1>
        
        <div className="music-content">
          {/* Current Playing */}
          {currentTrack && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="now-playing-section"
            >
              <div className="section-label">Now Playing</div>
              <div className="now-playing-item">
                <div className="now-playing-line">
                  <span className="now-playing-indicator">♪</span>
                  <span className="now-playing-title">{currentTrack.name}</span>
                  <span className="now-playing-artist">— {currentTrack.artist}</span>
                  <span className="now-playing-time">{formatTime(currentTrack.progress_ms)} / {formatTime(currentTrack.duration_ms)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="music-tabs"
          >
            <button 
              className={`tab-btn ${activeTab === 'top' ? 'active' : ''}`}
              onClick={() => setActiveTab('top')}
            >
              Top Tracks
            </button>
            <button 
              className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recently Played
            </button>
          </motion.div>

          {/* Track Lists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tracks-section"
          >
            <div className="tracks-grid">
              {activeTab === 'top' && (
                topTracks.length > 0 ? (
                  topTracks.slice(0, 5).map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="track-item"
                    >
                      <div className="track-line">
                        <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="track-title">{track.name}</span>
                        <span className="track-artist">— {track.artists[0].name}</span>
                        <span className="track-duration">{formatTime(track.duration_ms)}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-tracks">
                    <p>No top tracks available. Try listening to more music on Spotify!</p>
                  </div>
                )
              )}
              
              {activeTab === 'recent' && (
                recentlyPlayed.length > 0 ? (
                  recentlyPlayed.slice(0, 5).map((track, index) => (
                    <motion.div
                      key={`${track.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="track-item"
                    >
                      <div className="track-line">
                        <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="track-title">{track.name}</span>
                        <span className="track-artist">— {track.artists[0].name}</span>
                        <span className="track-duration">{formatTime(track.duration_ms)}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-tracks">
                    <p>No recently played tracks available. Try playing some music on Spotify!</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .music-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #000000;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          margin: 6rem auto 0 auto;
          padding: 0 2rem 6rem 2rem;
        }
        
        .music-title {
          font-family: var(--font-geist-sans), "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 3rem 0;
          letter-spacing: -0.02em;
          opacity: 0;
        }
        
        .loading-state {
          color: var(--music-accent);
          font-size: 0.9rem;
          font-family: "Akkurat Mono", monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4rem;
        }
        
        .connect-section {
          margin-top: 4rem;
        }
        
        .connect-content {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .connect-icon {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .connect-content h3 {
          color: #ffffff;
          font-family: "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        
        .connect-content p {
          color: #888888;
          font-family: "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        
        .connect-button {
          background: var(--music-accent);
          color: #000000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-family: "Akkurat Mono", monospace;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .connect-button:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }
        
        .music-content {
          text-align: left;
        }
        
        .section-label {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          color: var(--music-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        
        .now-playing-section {
          margin-bottom: 3rem;
        }
        
        .now-playing-item {
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 0.5rem;
        }
        
        .now-playing-line {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          font-family: "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: 0.8rem;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }
        
        .now-playing-indicator {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          color: var(--music-accent);
          font-weight: 600;
          min-width: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .now-playing-title {
          color: #ffffff;
          font-weight: 500;
          font-size: 0.8rem;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .now-playing-artist {
          color: #888888;
          font-weight: 300;
          font-size: 0.75rem;
          flex-shrink: 0;
          white-space: nowrap;
        }
        
        .now-playing-time {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          color: #666666;
          font-weight: 500;
          min-width: 4rem;
          text-align: right;
        }
        

        
        .progress-bar {
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--music-accent);
          border-radius: 0.5px;
          transition: width 0.1s ease;
        }
        

        
        .music-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          justify-content: center;
        }
        
        .tab-btn {
          background: transparent;
          border: none;
          color: #888888;
          padding: 0.75rem 0;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Akkurat Mono", monospace;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid transparent;
          margin-right: 2rem;
        }
        
        .tab-btn:hover {
          color: #ffffff;
        }
        
        .tab-btn.active {
          color: #ffffff;
          border-bottom-color: var(--music-accent);
        }
        
        .tracks-section {
          min-height: 300px;
        }
        
        .tracks-grid {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .track-item {
          padding: 0.75rem 0;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .track-item:hover {
          transform: translateX(4px);
        }
        
        .track-item:last-child {
          border-bottom: none;
        }
        
        .track-line {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          font-family: "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: 0.8rem;
          line-height: 1.3;
        }
        
        .track-number {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          color: var(--music-accent);
          font-weight: 600;
          min-width: 1.5rem;
        }
        
        .track-title {
          color: #ffffff;
          font-weight: 500;
          font-size: 0.8rem;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .track-artist {
          color: #888888;
          font-weight: 300;
          font-size: 0.75rem;
          flex-shrink: 0;
          white-space: nowrap;
        }
        
        .track-duration {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          color: #666666;
          font-weight: 500;
          min-width: 2.5rem;
          text-align: right;
          transition: all 0.3s ease;
        }
        
        .track-item:hover .track-duration {
          color: #ffffff;
        }
        
        .no-tracks {
          text-align: center;
          padding: 3rem 1rem;
          color: #888888;
          font-family: "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
                 @media (max-width: 768px) {
           .page-content {
             margin: 4rem auto 0 auto;
             padding: 0 1rem 4rem 1rem;
           }
           
           .music-title {
             font-size: clamp(2rem, 8vw, 3rem);
             margin-bottom: 2rem;
           }
           
           .now-playing-line {
             gap: 0.5rem;
             font-size: 0.75rem;
           }
           
           .now-playing-indicator {
             font-size: 0.65rem;
             min-width: 1.25rem;
           }
           
           .now-playing-title {
             font-size: 0.75rem;
           }
           
           .now-playing-artist {
             font-size: 0.7rem;
           }
           
           .now-playing-time {
             font-size: 0.65rem;
             min-width: 3.5rem;
           }
           
           .music-tabs {
             flex-direction: column;
             gap: 0.5rem;
             align-items: center;
           }
           
           .tab-btn {
             margin-right: 0;
             padding: 0.5rem 0;
           }
           
           .track-item {
             padding: 0.5rem 0;
           }
           
           .track-line {
             gap: 0.5rem;
             font-size: 0.75rem;
           }
           
           .track-number {
             font-size: 0.65rem;
             min-width: 1.25rem;
           }
           
           .track-title {
             font-size: 0.75rem;
           }
           
           .track-artist {
             font-size: 0.7rem;
           }
           
           .track-duration {
             font-size: 0.65rem;
             min-width: 2rem;
           }
           
           .track-number {
             font-size: 0.8rem;
           }
           
           .track-name {
             font-size: 0.85rem;
           }
           
           .track-artist {
             font-size: 0.75rem;
           }
           
           .track-duration {
             font-size: 0.7rem;
           }
         }
      `}</style>
    </div>
  );
};

export default MusicPage; 