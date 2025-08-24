"use client";

import { useEffect, useMemo } from "react";

/**
 * CRTOverlay
 * Minimal retro overlay using existing scanlines and tv-static classes.
 * - intensity: 0..1 controls opacity scaling
 * - showStatic / showScanlines: toggles layers
 * - vignette: adds a faint bezel vignette
 */
export default function CRTOverlay({
  intensity = 0.18,
  showStatic = true,
  showScanlines = true,
  vignette = true,
}) {
  // Clamp intensity
  const clamped = useMemo(() => Math.max(0, Math.min(1, intensity)), [intensity]);

  // Hide on small screens
  useEffect(() => {
    // No-op; purely a client component
  }, []);

  return (
    <div className="crt-overlay" aria-hidden>
      {showScanlines && (
        <div className="scanlines" style={{ opacity: clamped * 0.25 }} />
      )}
      {showStatic && (
        <div className="tv-static" style={{ opacity: clamped * 0.18 }} />
      )}
      {vignette && <div className="vignette-overlay" />}
    </div>
  );
}





