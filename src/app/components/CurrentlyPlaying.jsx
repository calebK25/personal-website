"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const CurrentlyPlaying = ({ track }) => {
    const containerRef = useRef();

    useEffect(() => {
        if (track && containerRef.current) {
            // Animate in the component
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [track]);

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!track?.progress_ms || !track?.duration_ms) return 0;
        return (track.progress_ms / track.duration_ms) * 100;
    };

    // Format time in mm:ss
    const formatTime = (ms) => {
        if (!ms) return "0:00";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!track) {
        return null;
    }

    return (
        <div className="currently-playing-text-section minimal" ref={containerRef}>
            <div className="track-info-text">
                <div className="track-title-text">{track.name}</div>
                <div className="track-artist-text">{track.artist}</div>
                
                {/* Progress Bar */}
                <div className="track-progress-section">
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                    <div className="progress-time">
                        <span className="current-time">{formatTime(track.progress_ms)}</span>
                        <span className="total-time">{formatTime(track.duration_ms)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentlyPlaying; 