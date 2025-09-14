"use client";

import { useEffect, useRef, useState } from "react";
import { PowerGlitch } from "powerglitch";

const VHSLanding = ({ onStart }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [timer, setTimer] = useState("--:--");
  const [spinner, setSpinner] = useState("|");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [location, setLocation] = useState("LOCATION: DETECTING...");
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const spinnerIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const vcrRef = useRef(null);
  const glitchInstancesRef = useRef([]);

    useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("/effect.webm");

    // Define handleStart function at the top level
    const handleStart = () => {
      if (isInitialized) return;
      
      setIsInitialized(true);
      
      // Play audio effect
      if (audioRef.current) {
        audioRef.current.cloneNode(true).play();
      }

      // Stop timers
      clearInterval(timerIntervalRef.current);
      clearInterval(spinnerIntervalRef.current);
      clearInterval(timeIntervalRef.current);

      // Clean up all glitch effects
      glitchInstancesRef.current.forEach(instance => {
        if (instance && typeof instance.stopGlitch === 'function') {
          try {
            instance.stopGlitch();
          } catch (error) {
            console.warn('Error stopping glitch effect:', error);
          }
        }
      });
      glitchInstancesRef.current = [];

      // Fade out VCR overlay
      if (vcrRef.current) {
        vcrRef.current.style.opacity = 0;
      }

      // Call the onStart callback to transition to the slider
      setTimeout(() => {
        onStart();
      }, 1000);
    };

    // Timer functionality
    let time = 0;
    timerIntervalRef.current = setInterval(() => {
      time += 1;
      const hours = Math.floor(time / 3600);
      const minutes = `0${Math.floor((time % 3600) / 60)}`.slice(-2);
      const seconds = `0${Math.floor(time % 60)}`.slice(-2);
      setTimer(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    // Spinner functionality
    const timeChars = ["|", "/", "-", "\\"];
    let i = 0;
    spinnerIntervalRef.current = setInterval(() => {
      i += 1;
      setSpinner(timeChars[i % timeChars.length]);
    }, 100);

    // Real time and date functionality
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Time in 24-hour format
      const hours = `0${now.getHours()}`.slice(-2);
      const minutes = `0${now.getMinutes()}`.slice(-2);
      const seconds = `0${now.getSeconds()}`.slice(-2);
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // Date in VCR format
      const day = `0${now.getDate()}`.slice(-2);
      const month = `0${now.getMonth() + 1}`.slice(-2);
      const year = now.getFullYear();
      setCurrentDate(`${day}/${month}/${year}`);
    };

    // Update immediately and then every second
    updateTimeAndDate();
    timeIntervalRef.current = setInterval(updateTimeAndDate, 1000);

    // Geolocation functionality
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get location name
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
              .then(response => response.json())
              .then(data => {
                const city = data.city || data.locality || 'Unknown City';
                const state = data.principalSubdivision || data.state || 'Unknown State';
                setLocation(`LOCATION: ${city}, ${state}`);
              })
              .catch(() => {
                setLocation(`LOCATION: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
              });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            setLocation('LOCATION: ACCESS DENIED');
          }
        );
      } else {
        setLocation('LOCATION: NOT SUPPORTED');
      }
    };

    // Get location on component mount
    getLocation();

    // Show reminder after 1 second
    const reminderTimer = setTimeout(() => {
      setShowReminder(true);
    }, 1000);

    // Add click listener immediately
    document.addEventListener('click', handleStart);

    // Apply glitch effects
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const glitchTimer = setTimeout(() => {
        try {
          // Verify elements exist before applying glitch
          const overlayElement = vcrRef.current;
          const glitchElements = Array.from(document.querySelectorAll('.glitch')).filter(el => el && el.nodeType === 1 && el.isConnected);
          
          if (overlayElement && overlayElement.isConnected && glitchElements.length > 0) {
            const glitch0 = PowerGlitch.glitch(overlayElement, {
              glitchTimeSpan: false,
            });
            const glitch1 = PowerGlitch.glitch(glitchElements, {
              timing: {
                duration: 700,
                easing: 'ease-in-out',
              },
            });

            // Store glitch instances for cleanup
            glitchInstancesRef.current = [glitch0, glitch1];

            // Stop overlay glitch after 1 second
            setTimeout(() => {
              if (glitch0 && typeof glitch0.stopGlitch === 'function') {
                glitch0.stopGlitch();
              }
            }, 1000);
          } else {
            console.warn('PowerGlitch elements not found, skipping glitch effects');
          }
        } catch (error) {
          console.error('PowerGlitch error:', error);
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      // Remove click listener to prevent sound from playing after component unmounts
      document.removeEventListener('click', handleStart);
      
      clearInterval(timerIntervalRef.current);
      clearInterval(spinnerIntervalRef.current);
      clearInterval(timeIntervalRef.current);
      clearTimeout(reminderTimer);
      
      // Clean up glitch effects
      glitchInstancesRef.current.forEach(instance => {
        if (instance && typeof instance.stopGlitch === 'function') {
          try {
            instance.stopGlitch();
          } catch (error) {
            console.warn('Error stopping glitch effect:', error);
          }
        }
      });
      glitchInstancesRef.current = [];
    };
  }, [isInitialized, onStart]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1d4ed8',
        zIndex: 9999,
        display: 'block',
      }}
    >
      {/* TV Static Effect */}
      <div className="tv-static"></div>
      
      {/* Scanlines Effect */}
      <div className="scanlines"></div>
      
      {/* Screen Distortion Effect */}
      <div className="screen-distortion"></div>

      <div 
        ref={vcrRef}
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1d4ed8',
          pointerEvents: 'none',
          width: '100%',
          fontSize: '2.25rem',
          height: '100vh',
          paddingBottom: '8rem',
          padding: '2rem',
          color: 'white',
          fontFamily: 'VCR, monospace',
          transition: 'opacity 0.5s',
          zIndex: 10000,
        }}
        className="overlay"
      >
        {/* Top section with PLAY and timer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'auto' }}>
          <div className="glitch chromatic-text" style={{ color: 'white', fontSize: '3rem', fontFamily: 'VCR, monospace' }}>PLAY ►</div>
          <div className="glitch chromatic-text" style={{ color: 'white', fontSize: '3rem', fontFamily: 'VCR, monospace' }}>{timer}</div>
        </div>

        {/* Middle section with reminder */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div
            className="glitch chromatic-text"
            style={{ 
              color: 'white',
              fontSize: '2rem',
              fontFamily: 'VCR, monospace',
              opacity: showReminder ? 1 : 0,
              transition: 'opacity 0.5s'
            }}
          >
            click to begin
          </div>
        </div>

        {/* Bottom section with spinner only */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
          <div className="glitch chromatic-text" style={{ color: 'white', fontSize: '3rem', fontFamily: 'VCR, monospace' }}>{spinner}</div>
        </div>

        {/* Time, Date, and Location Info */}
        <div style={{ 
          position: 'absolute', 
          bottom: '2rem', 
          left: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontFamily: 'VCR, monospace'
        }}>
          <div className="glitch chromatic-text" style={{ color: 'white', fontFamily: 'VCR, monospace' }}>
            TIME: {currentTime}
          </div>
          <div className="glitch chromatic-text" style={{ color: 'white', fontFamily: 'VCR, monospace' }}>
            DATE: {currentDate}
          </div>
          <div className="glitch chromatic-text" style={{ color: 'white', fontFamily: 'VCR, monospace' }}>
            {location}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VHSLanding; 