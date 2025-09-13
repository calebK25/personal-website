"use client";

import { useEffect, useRef, useState } from "react";
import { PowerGlitch } from "powerglitch";

const VHSHeader = ({ onEject, isRec = false, onToggleRecord }) => {
  const [timer, setTimer] = useState("0:00:00");
  const [spinner, setSpinner] = useState("|");
  const [timeline, setTimeline] = useState("●-------●");
  const [isEjected, setIsEjected] = useState(false);
  const timerRef = useRef(null);
  const spinnerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/effect.webm");

    // Timer functionality with timeline
    let time = 0;
    timerRef.current = setInterval(() => {
      time += 1;
      const hours = Math.floor(time / 3600);
      const minutes = `0${Math.floor((time % 3600) / 60)}`.slice(-2);
      const seconds = `0${Math.floor(time % 60)}`.slice(-2);

      // Create timeline with moving dot
      let baseProgress = '-------'.split('');
      baseProgress[time % 7] = '█';
      const timelineStr = `●${baseProgress.join('')}●`;

      setTimer(`${hours}:${minutes}:${seconds}`);
      setTimeline(timelineStr);
    }, 1000);

    // Spinner functionality
    const timeChars = ["|", "/", "-", "\\"];
    let i = 0;
    spinnerRef.current = setInterval(() => {
      i += 1;
      setSpinner(timeChars[i % timeChars.length]);
    }, 100);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(spinnerRef.current);
    };
  }, []);

  const handleEject = () => {
    if (isEjected) return;

    setIsEjected(true);

    // Play audio effect
    if (audioRef.current) {
      audioRef.current.cloneNode(true).play();
    }

    // Stop timers
    clearInterval(timerRef.current);
    clearInterval(spinnerRef.current);

    // Call the parent's onEject function after 1 second
    setTimeout(() => {
      if (onEject) {
        onEject();
      }
    }, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'black',
        fontFamily: 'VCR, monospace',
        zIndex: 10002,
        pointerEvents: 'none',
      }}
    >
      {/* Eject (Left) */}
      <div
        style={{
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s',
          pointerEvents: 'auto',
          fontFamily: 'VCR, monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'black',
        }}
        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        onClick={handleEject}
      >
        {spinner} EJECT ⏏
      </div>

      {/* CRT HUD (Right) */}
      <div
        style={{
          fontSize: '1rem',
          whiteSpace: 'nowrap',
          fontFamily: 'VCR, monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'auto',
          cursor: onToggleRecord ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (onToggleRecord) onToggleRecord();
        }}
        title={onToggleRecord ? 'Toggle REC' : undefined}
      >
        <span style={{ opacity: 0.8 }}>{isRec ? 'REC' : 'PLAY'}</span>
        <span style={{ opacity: 0.9, color: isRec ? 'rgba(200,0,0,0.9)' : 'rgba(0,0,0,0.9)' }}>•</span>
        <span>{timer}</span>
        <span style={{ opacity: 1, color: 'black', marginLeft: '0.5rem' }}>{timeline}</span>
      </div>


    </div>
  );
};

export default VHSHeader; 