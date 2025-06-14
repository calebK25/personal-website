"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import PhotoCarousel from "../PhotoCarousel";
import { photos } from "../../data/photos";

const WorkPage = () => {
  const titleRef = useRef();
  const metadataRef = useRef();

  useEffect(() => {
    // Animate elements on mount
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )
    .fromTo(".gear-item",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" },
      "-=0.5"
    );
  }, []);

  return (
    <div className="work-page">
      {/* Content */}
      <div className="page-content">
        <motion.div 
          className="work-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 
            ref={titleRef}
            className="page-title work-title"
          >
            Photography
          </h1>
          
          <div ref={metadataRef} className="photography-metadata">
            <div className="photo-gear">
              <div className="gear-item">
                <span className="gear-label">Camera</span>
                <span className="gear-value">Fujifilm XT-30</span>
              </div>
              <div className="gear-item">
                <span className="gear-label">Lenses</span>
                <span className="gear-value">Fujinon XF 27mm F2.8</span>
              </div>
              <div className="gear-item">
                <span className="gear-label"></span>
                <span className="gear-value">Fujifilm XF 18-55mm f/2.8-4 R LM OIS</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Photography Carousel */}
        <motion.div 
          className="carousel-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        >
          <PhotoCarousel photos={photos} />
        </motion.div>
      </div>

      <style jsx>{`
        .work-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-y: auto;
          background: #000000;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 1200px;
          margin: 6rem auto 0 auto;
          padding: 0 2rem;
          min-height: calc(100vh - 6rem);
          display: flex;
          flex-direction: column;
        }
        
        .page-title {
          text-align: center;
        }
        
        .work-header {
          margin-bottom: 3rem;
          flex-shrink: 0;
        }
        
        .work-title {
          font-family: var(--font-geist-sans), "Neue Haas Grotesk Display Pro", sans-serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 3rem 0;
          letter-spacing: -0.02em;
          opacity: 0;
        }
        
        .photography-metadata {
          margin-bottom: 2rem;
        }
        
        .photo-gear {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .gear-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0;
        }
        
        .gear-label {
          font-family: var(--font-geist-mono);
          font-size: 0.7rem;
          color: var(--work-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        
        .gear-value {
          font-family: var(--font-geist-sans);
          font-size: 0.9rem;
          color: #cccccc;
          font-weight: 300;
          text-align: center;
        }
        
        .carousel-container {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: 500px;
          margin-top: -2rem;
        }
        
        @media (max-width: 768px) {
          .page-content {
            margin: 4rem auto 0 auto;
            text-align: center;
            padding: 0 1rem;
            min-height: calc(100vh - 4rem);
          }
          .page-title {
            text-align: center;
          }
          .carousel-container {
            margin-top: -2rem;
            min-height: 400px;
          }
          .work-title {
            font-size: clamp(2rem, 10vw, 3rem);
          }
          .photo-gear {
            flex-direction: column;
            gap: 0.2rem;
          }
          .gear-item {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkPage; 