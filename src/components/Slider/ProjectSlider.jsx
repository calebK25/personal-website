"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

const ProjectSlider = () => {
  // Register GSAP plugins
  gsap.registerPlugin(SplitText, ScrambleTextPlugin);
  
  const containerRef = useRef(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Project data
  const projects = [
    {
      title: "Chromatic Loopscape",
      pronunciation: "/kro-MAT-ik LOOP-skayp/",
      definition: "A generative art system that creates infinite color variations through mathematical algorithms, exploring the relationship between digital aesthetics and human perception.",
      tags: ["Generative Art", "Three.js", "Mathematics"],
      technologies: ["JavaScript", "Three.js", "WebGL", "GLSL", "HTML5 Canvas"],
      year: "2024"
    },
    {
      title: "Neural Echo",
      pronunciation: "/NYOOR-al EK-oh/",
      definition: "An AI-powered sound design tool that transforms ambient noise into musical compositions, creating unique auditory experiences through machine learning.",
      tags: ["AI/ML", "Audio", "Web Audio API"],
      technologies: ["Python", "TensorFlow", "Web Audio API", "React", "Node.js"],
      year: "2024"
    },
    {
      title: "Quantum Interface",
      pronunciation: "/KWAN-tum IN-ter-fays/",
      definition: "A futuristic UI framework that adapts to user behavior in real-time, creating personalized digital experiences through predictive algorithms.",
      tags: ["UI/UX", "React", "Predictive Analytics"],
      technologies: ["React", "TypeScript", "Framer Motion", "Tailwind CSS", "Firebase"],
      year: "2023"
    },
    {
      title: "Digital Resonance",
      pronunciation: "/DIJ-i-tal REZ-o-nans/",
      definition: "An interactive installation that visualizes data through sound and light, creating immersive experiences that bridge the gap between digital and physical spaces.",
      tags: ["Interactive", "Installation", "Data Visualization"],
      technologies: ["Processing", "Arduino", "Max/MSP", "OpenFrameworks", "C++"],
      year: "2023"
    }
  ];

  // Watch for visibility changes from parent
  useEffect(() => {
    const checkVisibility = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        const isProjectVisible = parent && parent.classList.contains('projects-visible');
        const isProjectActive = parent && parent.getAttribute('data-projects-active') === 'true';
        
        if (isProjectVisible && isProjectActive) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // Check immediately
    checkVisibility();

    // Set up observer to watch for class changes
    const observer = new MutationObserver(checkVisibility);
    if (containerRef.current && containerRef.current.parentElement) {
      observer.observe(containerRef.current.parentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-projects-active']
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // Handle wheel events for project navigation
  useEffect(() => {
    const handleWindowWheel = (event) => {
      // Check if projects are active
      const projectsContainer = containerRef.current?.parentElement;
      const isProjectsVisible = projectsContainer?.classList.contains('projects-visible');
      const isProjectsActive = projectsContainer?.getAttribute('data-projects-active') === 'true';
      
      if (!projectsContainer || !isProjectsVisible || !isProjectsActive) {
        return;
      }
      
      // Check if mouse is over the projects area - make it larger and more predictable
      const projectsRect = projectsContainer.getBoundingClientRect();
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      // Create a larger scroll area in the center of the screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const scrollAreaWidth = 600; // Wider scroll area
      const scrollAreaHeight = 400; // Taller scroll area
      
      const isMouseOverProjects = (
        mouseX >= centerX - scrollAreaWidth / 2 &&
        mouseX <= centerX + scrollAreaWidth / 2 &&
        mouseY >= centerY - scrollAreaHeight / 2 &&
        mouseY <= centerY + scrollAreaHeight / 2
      );
      
      if (!isMouseOverProjects) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Navigate projects with smoother, more responsive scrolling
      const scrollThreshold = 15; // Much lower threshold for immediate response
      
      if (Math.abs(event.deltaY) > scrollThreshold) {
        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Navigate projects
        if (event.deltaY > 0) {
          setCurrentProjectIndex(prev => (prev + 1) % projects.length);
        } else if (event.deltaY < 0) {
          setCurrentProjectIndex(prev => prev === 0 ? projects.length - 1 : prev - 1);
        }
        
        // Much shorter delay for instant feel
        scrollTimeoutRef.current = setTimeout(() => {
          scrollTimeoutRef.current = null;
        }, 100);
      }
    };

    window.addEventListener("wheel", handleWindowWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", handleWindowWheel, { capture: true });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isVisible]);

  // Animate project content with enhanced GSAP animations
  useEffect(() => {
    if (!isVisible) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Reset all elements
    gsap.set(containerRef.current, { clearProps: "all" });
    
    // Animate title with ScrambleText
    const titleElement = containerRef.current?.querySelector('.project-title h2');
    if (titleElement) {
      // Clear any previous scramble text elements
      const existingScramble = titleElement.querySelectorAll('.scrambled-text');
      existingScramble.forEach(el => el.remove());
      
      tl.set(titleElement, { opacity: 0 })
        .to(titleElement, {
          opacity: 1,
          duration: 0.1,
          ease: "power2.out"
        })
        .to(titleElement, {
          duration: 1.2,
          scrambleText: {
            text: currentProject.title,
            chars: "0123456789",
            speed: 0.3,
            newClass: "scrambled-text"
          },
          ease: "power2.out"
        });
    }

    // Animate pronunciation with slide effect
    const pronunciationElement = containerRef.current?.querySelector('.project-pronunciation');
    if (pronunciationElement) {
      tl.set(pronunciationElement, { opacity: 0, x: -50 })
        .to(pronunciationElement, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out"
        }, "-=0.4");
    }

    // Animate definition with enhanced word reveal
    const definitionElement = containerRef.current?.querySelector('.project-definition p');
    if (definitionElement) {
      const splitDefinition = new SplitText(definitionElement, { type: "words" });
      const words = splitDefinition.words;
      
      tl.set(words, { 
        opacity: 0, 
        y: 20,
        scale: 0.9
      })
      .to(words, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.out"
      }, "-=0.3");
    }

    // Animate tags with bounce effect
    const tagsElement = containerRef.current?.querySelector('.project-tags');
    if (tagsElement) {
      const tags = tagsElement.querySelectorAll('.tag');
      tl.set(tags, { 
        opacity: 0, 
        scale: 0.5,
        rotation: -15
      })
      .to(tags, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "back.out(2)"
      }, "-=0.2");
    }

    // Animate technologies with slide and fade
    const technologiesElement = containerRef.current?.querySelector('.project-technologies');
    if (technologiesElement) {
      const techTitle = technologiesElement.querySelector('h3');
      const techItems = technologiesElement.querySelectorAll('.tech-item');
      
      tl.set(techTitle, { opacity: 0, y: 20 })
        .to(techTitle, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.1")
        .set(techItems, { 
          opacity: 0, 
          x: -30,
          scale: 0.8
        })
        .to(techItems, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.5)"
        }, "-=0.3");
    }

    // Animate year with simple fade and scale (reliable)
    const yearElement = containerRef.current?.querySelector('.project-year span');
    if (yearElement) {
      tl.set(yearElement, { opacity: 0, scale: 0.8 })
        .to(yearElement, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)"
        }, "-=0.3");
    }

    // Animate scroll indicator
    const scrollIndicator = containerRef.current?.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      tl.set(scrollIndicator, { opacity: 0, y: 20 })
        .to(scrollIndicator, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        }, "-=0.3");
    }

    return () => {
      tl.kill();
      // Clean up any leftover scramble elements
      const titleElement = containerRef.current?.querySelector('.project-title h2');
      
      if (titleElement) {
        const existingScramble = titleElement.querySelectorAll('.scrambled-text');
        existingScramble.forEach(el => el.remove());
      }
    };
  }, [currentProjectIndex, isVisible]);

  const currentProject = projects[currentProjectIndex];

  return (
    <div ref={containerRef} className="project-slider-container">
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-dots">
          <div className="scroll-dot"></div>
          <div className="scroll-dot"></div>
          <div className="scroll-dot"></div>
        </div>
      </div>

      <div className="project-content">
        {/* Project Title */}
        <div className="project-title">
          <h2>{currentProject.title}</h2>
        </div>

        {/* Pronunciation */}
        <div className="project-pronunciation">
          <p>{currentProject.pronunciation}</p>
        </div>

        {/* Definition */}
        <div className="project-definition">
          <p>{currentProject.definition}</p>
        </div>

        {/* Tags */}
        <div className="project-tags">
          {currentProject.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>

        {/* Technologies */}
        <div className="project-technologies">
          <h3>Technologies</h3>
          <div className="tech-list">
            {currentProject.technologies.map((tech, index) => (
              <span key={index} className="tech-item">{tech}</span>
            ))}
          </div>
        </div>

        {/* Year */}
        <div className="project-year">
          <span>{currentProject.year}</span>
        </div>
      </div>


    </div>
  );
};

export default ProjectSlider; 