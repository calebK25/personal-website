"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const RightNavigation = ({ sections }) => {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Create section triggers to update active dot
    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: "top center",
        end: "bottom center",
        onEnter: () => setCurrentSection(index),
        onEnterBack: () => setCurrentSection(index),
      });

      // Enhanced section animations
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const element = document.getElementById(section.id);
          if (element) {
            // Parallax effect for section backgrounds
            const yPos = -(self.progress - 0.5) * 100;
            const bgElement = element.querySelector('.section-bg');
            if (bgElement) {
              gsap.set(bgElement, {
                yPercent: yPos * 0.5,
              });
            }

            // Scale effect as section comes into view
            const scale = 0.95 + (self.progress * 0.05);
            gsap.set(element, {
              scale: scale,
            });
          }
        },
      });

      // Section content stagger animations
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          const content = document.querySelectorAll(`#${section.id} .animate-in`);
          gsap.fromTo(content, 
            { 
              opacity: 0, 
              y: 60,
              scale: 0.9,
            },
            { 
              opacity: 1, 
              y: 0,
              scale: 1,
              duration: 1.2,
              stagger: 0.1,
              ease: "power3.out",
            }
          );
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [sections]);

  const handleNavClick = (sectionId, index) => {
    const element = document.getElementById(sectionId);
    if (element) {
      gsap.to(window, {
        scrollTo: { 
          y: sectionId === "home" ? 0 : element, 
          offsetY: sectionId === "home" ? 0 : 0 
        },
        duration: 1.5,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <div className="right-nav">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`nav-dot ${currentSection === index ? 'active' : ''}`}
          data-label={section.title}
          onClick={() => handleNavClick(section.id, index)}
        />
      ))}
    </div>
  );
};

export default RightNavigation; 