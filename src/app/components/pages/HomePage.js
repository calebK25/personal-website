"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const HomePage = () => {
  const titleRef = useRef();
  const subtitleRef = useRef();
  const descriptionRef = useRef();

  useEffect(() => {
    // Animate elements on mount
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(descriptionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );
  }, []);

  return (
    <div className="home-page">
      {/* Content */}
      <div className="page-content">
        <motion.div 
          className="hero-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 
            ref={titleRef}
            className="page-title hero-title"
          >
            Artistry and Engineering
            <br />
            By Caleb
          </h1>
          
          <p 
            ref={subtitleRef}
            className="hero-subtitle"
          >
            Creative Developer & Designer
          </p>
          
          <p 
            ref={descriptionRef}
            className="hero-description"
          >
            Crafting digital experiences through the intersection of
            <br />
            design, technology, and storytelling.
          </p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
        >
          <div className="scroll-line" />
          <span className="scroll-text">Scroll to explore</span>
          <div className="scroll-hint">↓</div>
        </motion.div>
      </div>

      <style jsx>{`
        .home-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          background: #000000;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          text-align: left;
          max-width: 900px;
          margin-left: 10rem;
          margin-top: 7rem;
          padding: 0 2rem;
        }
        
        .page-title {
          text-align: left;
        }
        
        .hero-section {
          margin-bottom: 4rem;
        }
        
        .hero-title {
          font-family: var(--font-geist-sans);
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 300;
          line-height: 1.1;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
          opacity: 0;
        }
        
        .hero-subtitle {
          font-family: var(--font-geist-mono);
          font-size: 1.1rem;
          font-weight: 400;
          color: var(--home-accent);
          margin: 1.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0;
        }
        
        .hero-description {
          font-family: var(--font-geist-sans);
          font-size: 1.1rem;
          font-weight: 300;
          color: #cccccc;
          line-height: 1.6;
          margin: 2rem 0 0 0;
          opacity: 0;
        }
        
        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .scroll-line {
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, var(--home-accent), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        
        .scroll-text {
          font-family: var(--font-geist-mono);
          font-size: 0.7rem;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        
        .scroll-hint {
          font-size: 1.2rem;
          color: var(--home-accent);
          animation: scrollBounce 2s ease-in-out infinite;
          margin-top: 0.5rem;
        }
        
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
        
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        
        @media (max-width: 1024px) {
          .page-content {
            margin-left: 6rem;
          }
        }
        
        @media (max-width: 768px) {
          .page-content {
            margin-left: 0;
            margin-top: 5rem;
            text-align: center;
            padding: 4rem 1rem 0 1rem;
          }
          .page-title {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage; 