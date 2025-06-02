"use client";
import { useState, useEffect, useRef } from "react";
import { Spotify } from "react-spotify-embed";
import gsap from "gsap";

const SpotifyDisplay = ({ recentlyPlayed, topTracks }) => {
    const hasRecentlyPlayed = recentlyPlayed && recentlyPlayed.length > 0;
    const hasTopTracks = topTracks && topTracks.length > 0;
    
    const getInitialTab = () => {
        if (hasRecentlyPlayed) return "recently";
        if (hasTopTracks) return "top";
        return "recently";
    };
    
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const tabContentRef = useRef();
    
    const switchTab = (newTab) => {
        if (newTab === activeTab) return;
        
        gsap.to(tabContentRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                setActiveTab(newTab);
                gsap.fromTo(tabContentRef.current, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                );
            }
        });
    };
    
    useEffect(() => {
        if (tabContentRef.current) {
            gsap.fromTo(tabContentRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3 }
            );
        }
    }, []);
    
    if (!hasRecentlyPlayed && !hasTopTracks) {
        return null;
    }

    return (
        <div className="spotify-display compact sleek">
            <div className="spotify-tabs-container sleek">
                <div className="tab-buttons sleek">
                    {hasRecentlyPlayed && (
                        <button 
                            className={`tab-button sleek ${activeTab === "recently" ? "active" : ""}`}
                            onClick={() => switchTab("recently")}
                        >
                            Recently Played
                        </button>
                    )}
                    {hasTopTracks && (
                        <button 
                            className={`tab-button sleek ${activeTab === "top" ? "active" : ""}`}
                            onClick={() => switchTab("top")}
                        >
                            Top Tracks
                        </button>
                    )}
                </div>

                <div className="tab-content sleek" ref={tabContentRef}>
                    {activeTab === "recently" && hasRecentlyPlayed ? (
                        <div className="recently-played-container compact sleek">
                            {recentlyPlayed.slice(0, 3).map((track, i) => (
                                <div key={track.id || i} className="track-wrapper sleek">
                                    <Spotify 
                                        className="track compact sleek" 
                                        wide 
                                        link={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : null}
                    
                    {activeTab === "top" && hasTopTracks ? (
                        <div className="top-tracks-container compact sleek">
                            {topTracks.slice(0, 3).map((track, i) => (
                                <div key={track.id || i} className="track-wrapper sleek">
                                    <Spotify 
                                        className="track compact sleek" 
                                        wide 
                                        link={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SpotifyDisplay; 