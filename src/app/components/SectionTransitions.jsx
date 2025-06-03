"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const SectionTransitions = ({ sections }) => {
  const sectionIndicatorRef = useRef(null);
  const currentSectionRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Create section transition triggers
    sections.forEach((section, index) => {
      const nextIndex = (index + 1) % sections.length;
      
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          currentSectionRef.current = index;
          updateSectionIndicator(section.title, index);
        },
        onEnterBack: () => {
          currentSectionRef.current = index;
          updateSectionIndicator(section.title, index);
        },
      });

      // Create enhanced section animations
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const element = document.getElementById(section.id);
          if (element) {
            // Parallax effect for section backgrounds
            const yPos = -(self.progress - 0.5) * 100;
            gsap.set(element.querySelector('.section-bg'), {
              yPercent: yPos * 0.5,
            });

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

    // Smooth section navigation
    const handleSectionScroll = (targetId) => {
      const target = document.getElementById(targetId);
      if (target) {
        gsap.to(window, {
          scrollTo: { 
            y: target, 
            offsetY: 0 
          },
          duration: 1.5,
          ease: "power2.inOut",
        });
      }
    };

    // Add scroll navigation to nav links
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        handleSectionScroll(targetId);
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      navLinks.forEach(link => {
        link.removeEventListener('click', handleSectionScroll);
      });
    };
  }, [sections]);

  const updateSectionIndicator = (title, index) => {
    if (sectionIndicatorRef.current) {
      gsap.to(sectionIndicatorRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          sectionIndicatorRef.current.textContent = title;
          gsap.to(sectionIndicatorRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
          });
        },
      });
    }
  };

  return (
    <div className="section-transitions">
      <div className="section-indicator" ref={sectionIndicatorRef}>
        {sections[0]?.title || "Home"}
      </div>
    </div>
  );
};

export default SectionTransitions; 