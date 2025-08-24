"use client";

import { useEffect, useRef, useState } from "react";

/**
 * RetroHUD
 * Minimal corner HUD: PLAY/REC indicator + running timecode.
 * - position can be: 'tl' | 'tr' | 'bl' | 'br'
 * - mode: 'PLAY' | 'REC' | 'PAUSE'
 */
export default function RetroHUD({ position = "tl", mode = "PLAY", show = true }) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [show]);

  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const posClass =
    position === "tr"
      ? "hud-tr"
      : position === "bl"
      ? "hud-bl"
      : position === "br"
      ? "hud-br"
      : "hud-tl";

  return (
    <div className={`retro-hud ${posClass}`} aria-hidden>
      <span className={`hud-mode ${mode === "REC" ? "rec" : ""}`}>{mode}</span>
      {mode === "REC" && <span className="hud-dot">•</span>}
      <span className="hud-time">{hh}:{mm}:{ss}</span>
    </div>
  );
}





