"use client";

import { useEffect, useRef, useState } from "react";

const EjectPage = ({ onRewind }) => {
  const [count, setCount] = useState(0);
  const [spinner, setSpinner] = useState("|");
  const [selectedGif, setSelectedGif] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const dvdRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  const gifs = [
    "/gifs/_.gif",
    "/gifs/ddlr08v-9a00be7c-0626-4895-83fc-b155f94e5451.gif"
  ];

  // DVD animation function
  const runDvd = (dvd, cb) => {
    if (!dvd || typeof document === 'undefined' || !isMounted) return;
    
    let x = 0;
    let y = 0;
    let dirX = 1;
    let dirY = 1;
    let speed = 4;
    const dvdWidth = dvd.clientWidth;
    const dvdHeight = dvd.clientHeight;

    const handleMouseOver = () => {
      speed += 0.25;
    };

    dvd.addEventListener('mouseover', handleMouseOver);

    function getNewRandomColor() {
      return `${Math.floor(Math.random() * (360 - 0 + 1) + 0)}deg`;
    }

    function animate() {
      if (!dvd || typeof document === 'undefined' || !document.body || !isMounted) return;
      
      // Use window dimensions instead of document.body
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;

      if (y + dvdHeight >= screenHeight || y < 0) {
        dirY *= -1;
        dvd.style.filter = `hue-rotate(${getNewRandomColor()})`;
        cb();
      }
      if (x + dvdWidth >= screenWidth || x < 0) {
        dirX *= -1;
        dvd.style.filter = `hue-rotate(${getNewRandomColor()})`;
        cb();
      }
      x += dirX * speed;
      y += dirY * speed;
      dvd.style.animation = `spin ${16 / speed}s linear infinite`;
      dvd.style.left = `${x}px`;
      dvd.style.top = `${y}px`;
      animationRef.current = window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    return () => {
      dvd.removeEventListener('mouseover', handleMouseOver);
    };
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Select random GIF
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    setSelectedGif(randomGif);

    // Create audio element
    audioRef.current = new Audio("/effect.webm");

    // Spinner functionality
    const timeChars = ["|", "/", "-", "\\"];
    let i = 0;
    const spinnerInterval = setInterval(() => {
      if (isMounted) {
        i += 1;
        setSpinner(timeChars[i % timeChars.length]);
      }
    }, 100);

    // Start DVD animation after a short delay
    const animationTimeout = setTimeout(() => {
      if (dvdRef.current && typeof document !== 'undefined' && isMounted) {
        const cleanup = runDvd(dvdRef.current, () => {
          if (isMounted) {
            setCount(prev => prev + 1);
          }
        });
        
        if (cleanup) {
          animationRef.current = cleanup;
        }
      }
    }, 100);

    return () => {
      setIsMounted(false);
      clearInterval(spinnerInterval);
      clearTimeout(animationTimeout);
      if (animationRef.current) {
        if (typeof animationRef.current === 'function') {
          animationRef.current();
        } else {
          cancelAnimationFrame(animationRef.current);
        }
      }
    };
  }, [isMounted]);

  const handleRewind = () => {
    // Play audio effect first
    if (audioRef.current) {
      audioRef.current.cloneNode(true).play();
    }
    
    // Reload the page after 1 second delay (like vhs-main)
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        fontFamily: 'VCR, monospace',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* DVD that bounces across the full screen */}
      {selectedGif && (
        <img 
          ref={dvdRef}
          src={selectedGif}
          alt="DVD"
          draggable="false"
          style={{
            position: 'fixed',
            height: '200px',
            width: '200px',
            left: '0px',
            top: '0px',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '75px',
            backgroundPosition: 'center',
            zIndex: 10000,
          }}
          className="dvd"
        />
      )}

      {/* Centered text content */}
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10001,
        width: '100%',
        maxWidth: '600px',
        padding: '0 20px',
      }}>
        <p className="eject-page-text" style={{ 
          marginBottom: '1rem',
          color: 'white',
        }}>
          <span style={{ color: 'white' }}>{spinner}</span> <span style={{ color: 'white' }}>{count} EJECTED</span>
        </p>
        <p className="eject-page-description" style={{ 
          margin: '1.25rem auto 0',
          width: '100%',
          maxWidth: '20rem',
          color: '#9ca3af',
        }}>
          Being afraid is natural. It's part of being{' '}
          <span style={{ color: 'white' }}>
            <a 
              href="https://jp.pinterest.com/pin/286893438756969222/"
              style={{ color: 'white', textDecoration: 'underline' }}
            >
              alive
            </a>
          </span>
          . Without it, you are already dead.
        </p>
        <p style={{ marginTop: '1.25rem' }}>
          <button 
            onClick={handleRewind}
            className="eject-page-button"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            REWIND ⏮
          </button>
        </p>
      </div>
    </div>
  );
};

export default EjectPage; 