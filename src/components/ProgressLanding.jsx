"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { gsap } from "gsap";

// Minimal, swappable landing page with center progress and side labels
// Animates left/right labels toward edges as progress reaches 100%, then pushes up into the main app
const ProgressLanding = ({ onStart }) => {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const progressRef = useRef(null);
  const rafRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const dimsRef = useRef({ leftMax: 0, rightMax: 0, baseGap: 140 });

  const measure = () => {
    try {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
      const pad = Math.max(24, Math.min(80, Math.round(vw * 0.06)));
      const leftW = leftRef.current ? leftRef.current.offsetWidth : 0;
      const rightW = rightRef.current ? rightRef.current.offsetWidth : 0;
      const half = vw / 2;
      const leftMax = Math.max(0, half - pad - leftW / 2);
      const rightMax = Math.max(0, half - pad - rightW / 2);
      // Base starting gap from center so labels don't overlap loader
      // Start with a wider visual gap like the reference
      const desired = Math.round(vw * 0.12);
      const clampedDesired = Math.max(120, Math.min(240, desired));
      const base = Math.min(clampedDesired, leftMax * 0.85, rightMax * 0.85);
      dimsRef.current.leftMax = leftMax;
      dimsRef.current.rightMax = rightMax;
      dimsRef.current.baseGap = isFinite(base) ? base : 40;
    } catch {}
  };

  // Pre-position and hide before first paint to avoid flicker/jumble
  useLayoutEffect(() => {
    measure();
    const { baseGap } = dimsRef.current;
    if (containerRef.current) {
      containerRef.current.style.visibility = 'visible';
    }
    if (leftRef.current) {
      leftRef.current.style.opacity = '0';
      leftRef.current.style.transform = `translate(-50%, -50%) translateX(${-baseGap}px)`;
    }
    if (rightRef.current) {
      rightRef.current.style.opacity = '0';
      rightRef.current.style.transform = `translate(-50%, -50%) translateX(${baseGap}px)`;
    }
    if (progressRef.current) {
      progressRef.current.style.opacity = '0';
    }
  }, []);

  // Split element text content into inline-block spans for reveal animation
  const splitToSpans = (el) => {
    if (!el) return [];
    const text = el.textContent || "";
    el.textContent = "";
    const spans = [];
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.display = 'inline-block';
      s.style.willChange = 'transform, opacity';
      el.appendChild(s);
      spans.push(s);
    }
    return spans;
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    // Ensure initial positions are at baseGap so nothing overlaps the loader
    const { baseGap } = dimsRef.current;
    if (leftRef.current) leftRef.current.style.transform = `translate(-50%, -50%) translateX(${-baseGap}px)`;
    if (rightRef.current) rightRef.current.style.transform = `translate(-50%, -50%) translateX(${baseGap}px)`;

    // Prepare split animation for left, center, right
    const leftSpans = splitToSpans(leftRef.current);
    // For progress: reveal a static "[ 0% ]" first, then switch to dynamic updates
    if (progressRef.current) progressRef.current.textContent = "[ 0% ]";
    const progSpans = splitToSpans(progressRef.current);
    const rightSpans = splitToSpans(rightRef.current);

    gsap.set(leftRef.current, { opacity: 1 });
    gsap.set(progressRef.current, { opacity: 1 });
    gsap.set(rightRef.current, { opacity: 1 });
    gsap.set([...leftSpans, ...progSpans, ...rightSpans], { y: "120%", opacity: 0, filter: 'blur(6px)' });

    const tl = gsap.timeline({ delay: 0.35 });
    if (leftSpans.length) tl.to(leftSpans, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: "power2.out", stagger: 0.014 }, 0);
    if (progSpans.length) tl.to(progSpans, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: "power2.out", stagger: 0.014 }, 0.08);
    if (rightSpans.length) tl.to(rightSpans, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: "power2.out", stagger: 0.014 }, 0.16);

    // After reveal, replace progress with dynamic text and start counting/drift after a short pause
    tl.call(() => {
      if (progressRef.current) progressRef.current.textContent = "[ 0% ]";

      const start = performance.now() + 220; // pause before counting
      const durationMs = 3000; // slower, more gradual drift to edges

      const step = (now) => {
        const tRaw = (now - start) / durationMs;
        const t = Math.min(1, Math.max(0, tRaw));
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
        const pct = Math.floor(t * 100);
        if (pct !== progress) setProgress(pct);
        if (progressRef.current) progressRef.current.textContent = `[ ${pct}% ]`;

        const { leftMax, rightMax, baseGap } = dimsRef.current;
        const mapOffset = (max) => {
          const mid = baseGap + 0.5 * (max - baseGap);
          const p1End = 0.45;     // reach mid
          const pHoldEnd = 0.65;  // hold at mid
          let offset;
          if (t <= p1End) {
            const u = t / p1End;
            const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
            offset = baseGap + e * (mid - baseGap);
          } else if (t <= pHoldEnd) {
            offset = mid;
          } else {
            const u = (t - pHoldEnd) / (1 - pHoldEnd);
            const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
            offset = mid + e * (max - mid);
          }
          return offset;
        };

        const leftOffset = mapOffset(leftMax);
        const rightOffset = mapOffset(rightMax);
        if (leftRef.current) leftRef.current.style.transform = `translate(-50%, -50%) translateX(${-Math.round(leftOffset)}px)`;
        if (rightRef.current) rightRef.current.style.transform = `translate(-50%, -50%) translateX(${Math.round(rightOffset)}px)`;

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          // Snap exactly to edges on completion
          if (leftRef.current) leftRef.current.style.transform = `translate(-50%, -50%) translateX(${-leftMax}px)`;
          if (rightRef.current) rightRef.current.style.transform = `translate(-50%, -50%) translateX(${rightMax}px)`;
          const el = containerRef.current;
          if (el) {
            el.classList.add('pl-push');
            setTimeout(() => { if (onStart) onStart(); }, 120);
          } else if (onStart) {
            onStart();
          }
        }
      };
      rafRef.current = requestAnimationFrame(step);
    });

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onStart]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        color: '#fff',
        zIndex: 9999,
        fontFamily: 'VCR, monospace',
        letterSpacing: '0.06em',
        userSelect: 'none',
        transition: 'transform 980ms cubic-bezier(.16,1,.3,1), opacity 480ms ease',
      visibility: 'hidden',
      }}
      className="progress-landing"
    >
      {/* Center progress */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.9rem',
          opacity: 0.9,
        }}
        ref={progressRef}
      >
        [ {progress}% ]
      </div>

      {/* Left label */}
      <div
        ref={leftRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.72rem',
          opacity: 0.85,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Caleb Kha-Uong
      </div>

      {/* Right label */}
      <div
        ref={rightRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.72rem',
          opacity: 0.85,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Portfolio '25
      </div>

      <style>{`
        .progress-landing.pl-push { transform: translateY(-100%); }
      `}</style>
    </div>
  );
};

export default ProgressLanding;


