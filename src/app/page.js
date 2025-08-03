"use client";

import { useState, useEffect, useRef } from "react";
import VHSLanding from "@/components/VHSLanding";
import VHSHeader from "@/components/VHSHeader";
import WarpedSlider from "@/components/Slider/WarpedSlider";
import EjectPage from "@/components/EjectPage";
import { PowerGlitch } from "powerglitch";

export default function Home() {
  const [showSlider, setShowSlider] = useState(false);
  const [showEjectPage, setShowEjectPage] = useState(false);
  const [landingKey, setLandingKey] = useState(0);
  const glitchRef = useRef(null);

  const handleStart = () => {
    setShowSlider(true);
  };

  const handleEject = () => {
    // Apply PowerGlitch effect only during transition
    try {
      if (typeof document !== 'undefined' && glitchRef.current) {
        const glitchInstance = PowerGlitch.glitch(glitchRef.current, {
          glitchTimeSpan: false,
        });
        
        // Stop the glitch after 2 seconds
        setTimeout(() => {
          if (glitchInstance && glitchInstance.stopGlitch) {
            glitchInstance.stopGlitch();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('PowerGlitch error:', error);
    }

    // Set the eject page state after a short delay
    setTimeout(() => {
      setShowEjectPage(true);
    }, 500);
  };

  const handleRewind = () => {
    // Use location.reload() like vhs-main to completely reset the page state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Handle body class when eject page is shown
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      if (showEjectPage) {
        document.body.classList.add('eject-page-active');
      } else {
        document.body.classList.remove('eject-page-active');
      }
    }

    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('eject-page-active');
      }
    };
  }, [showEjectPage]);

  return (
    <div ref={glitchRef}>
      {showEjectPage ? (
        <EjectPage onRewind={handleRewind} />
      ) : showSlider ? (
        <>
          <VHSHeader onEject={handleEject} />
          <WarpedSlider />
        </>
      ) : (
        <VHSLanding key={landingKey} onStart={handleStart} />
      )}
    </div>
  );
}
