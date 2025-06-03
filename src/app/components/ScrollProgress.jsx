"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollProgress = () => {
  const progressBarRef = useRef(null);
  const progressContainerRef = useRef(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial state - hidden
    gsap.set(progressContainerRef.current, {
      opacity: 0,
      y: -50,
    });

    // Track scroll direction and position
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const hasScrolledDown = currentScrollY > 100;

      if (isScrollingDown && hasScrolledDown) {
        setIsVisible(true);
      } else if (currentScrollY < 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Show/hide animation based on visibility state
    if (isVisible && progressContainerRef.current) {
      gsap.to(progressContainerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else if (!isVisible && progressContainerRef.current) {
      gsap.to(progressContainerRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    // Create scroll progress animation
    const progressTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (progressBarRef.current) {
          const progress = self.progress;
          gsap.set(progressBarRef.current, {
            scaleX: progress,
          });
        }
      },
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      progressTrigger.kill();
    };
  }, [lastScrollY, isVisible]);

  return (
    <div className="scroll-progress-container" ref={progressContainerRef}>
      <div className="scroll-progress-track">
        <div className="scroll-progress-bar" ref={progressBarRef}></div>
      </div>
      <div className="scroll-progress-text">
        <span>Portfolio Progress</span>
      </div>
    </div>
  );
};

export default ScrollProgress; 