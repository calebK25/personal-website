"use client";

import { useState, useEffect, useRef } from "react";
import VHSLanding from "@/components/VHSLanding";
import VHSHeader from "@/components/VHSHeader";
import WarpedSlider from "@/components/Slider/WarpedSlider";
import EjectPage from "@/components/EjectPage";
import { PowerGlitch } from "powerglitch";
import CRTOverlay from "@/components/CRTOverlay";

export default function Home() {
  const [showSlider, setShowSlider] = useState(false);
  const [showEjectPage, setShowEjectPage] = useState(false);
  const [landingKey, setLandingKey] = useState(0);
  const glitchRef = useRef(null);
  const [powerClass, setPowerClass] = useState("power-transition-enter");
  const [isRec, setIsRec] = useState(false);
  

  const handleStart = () => {
    // longer delay to allow landing fade-out and ensure first slide animations are ready
    setTimeout(() => setShowSlider(true), 700);
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
      // Trigger power-off collapse just before switching
      setPowerClass('power-transition-exit');
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
    // Power-on transition on mount
    setPowerClass("power-transition-enter");
    const t = setTimeout(() => setPowerClass(""), 300);

    // Easter-egg: Shift+E toggles stronger glitch briefly
    const onKey = (e) => {
      if (e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        try {
          if (glitchRef.current) {
            const g = PowerGlitch.glitch(glitchRef.current, { shake: true, slice: { count: 8 }, glitchTimeSpan: { start: 0, end: 0.3 } });
            setTimeout(() => g?.stopGlitch?.(), 600);
          }
        } catch {}
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

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
    <div ref={glitchRef} className={powerClass}>
      <CRTOverlay intensity={0.15} showStatic={true} showScanlines={true} vignette={true} />
      {showEjectPage ? (
        <EjectPage onRewind={handleRewind} />
      ) : showSlider ? (
        <>
          <VHSHeader onEject={handleEject} isRec={isRec} onToggleRecord={() => setIsRec((v) => !v)} />
          <WarpedSlider />
        </>
      ) : (
        <VHSLanding key={landingKey} onStart={handleStart} />
      )}
    </div>
  );
}
