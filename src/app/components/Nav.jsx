"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const Nav = () => {
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Nav scroll effect
    const navScrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "100px top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (self.progress > 0.01) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      },
    });

    return () => {
      navScrollTrigger.kill();
    };
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      gsap.to(window, {
        scrollTo: { 
          y: element, 
          offsetY: 80 // Account for nav height
        },
        duration: 1.5,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <nav 
      className={`nav ${isScrolled ? 'scrolled' : ''}`} 
      ref={navRef}
    >
      <div className="logo">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, "home")}
        >
          CALEB
        </a>
      </div>
      <div className="links">
        <a 
          href="#about" 
          onClick={(e) => handleNavClick(e, "about")}
        >
          ABOUT
        </a>
        <a 
          href="#projects" 
          onClick={(e) => handleNavClick(e, "projects")}
        >
          PROJECTS
        </a>
        <a 
          href="#timeline" 
          onClick={(e) => handleNavClick(e, "timeline")}
        >
          EXPERIENCE
        </a>
        <a 
          href="#photography" 
          onClick={(e) => handleNavClick(e, "photography")}
        >
          PHOTOGRAPHY
        </a>
      </div>
    </nav>
  );
};

export default Nav;
