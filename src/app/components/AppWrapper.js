"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

const AppWrapper = ({ children }) => {
  const contentRef = useRef();

  useEffect(() => {
    if (contentRef.current) {
      gsap.set(contentRef.current, {
        opacity: 0
      });
      
      gsap.to(contentRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, []);

  return (
    <div ref={contentRef}>
      {children}
    </div>
  );
};

export default AppWrapper; 