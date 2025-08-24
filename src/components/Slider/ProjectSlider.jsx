"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

const ProjectSlider = () => {
  // Register GSAP plugins
  gsap.registerPlugin(SplitText, ScrambleTextPlugin);
  
  const containerRef = useRef(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const scrollTimeoutRef = useRef(null);
  const setWidthRef = useRef(0);

     // Project data
   const projects = [
      {
        title: "volley",
        pronunciation: "/ˈvälē/",
        description: "Computer vision system for tennis analysis using YOLO to detect players and track the ball, rendering a 2D overlay of plays and estimating ball speed across rallies.",
        tags: ["Computer Vision", "YOLO", "Object Tracking", "Ball Speed", "2D Overlay"],
        technologies: ["Python", "Jupyter", "OpenCV", "YOLO", "NumPy"],
        year: "2024",
        liveUrl: "https://github.com/calebK25/volley",
        images: [
          "/projects/volley/output_video.mp4",
          "/projects/volley/chat.png",
          "/projects/volley/projects.png",
          "/projects/volley/files.png",
          "/projects/volley/analytics.png"
        ]
      },
      {
        title: "refrain",
        pronunciation: "/rəˈfrān/",
        description: "Music visualizer that uses Three.js to render a similarity graph of your listening history and K-means clustering to auto-generate playlists tailored to your taste.",
        tags: ["Music Visualization", "Similarity Graphs", "K-means", "Creative Tools"],
        technologies: ["Python", "PyTorch", "React", "Next.js", "Three.js"],
        year: "2023",
        liveUrl: "https://github.com/calebK25/refrain",
        images: [
          "/projects/refrain/interface.png",
          "/projects/refrain/generation.png",
          "/projects/refrain/playlist.png",
          "/projects/refrain/visualizer.png"
        ]
      },
      {
        title: "distill",
        pronunciation: "/dɪˈstɪl/",
        description: "Context Compressor: production-grade context compression for intelligent document analysis and QA. Achieves 90–95% token reduction with CDC/SDM, multimodal extraction, auto-router, and a web API.",
        tags: ["Context Compression", "PDF QA", "Multimodal", "LLM Integration"],
        technologies: ["Python", "FastAPI", "OpenRouter", "BM25", "MMR"],
        year: "2025",
        liveUrl: "https://github.com/calebK25/distill",
        images: []
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

  // Handle wheel events for project navigation (disabled when gallery overlay is open)
  useEffect(() => {
    const handleWindowWheel = (event) => {
      // If project gallery overlay is open, do not change projects
      if (showGallery || (typeof document !== 'undefined' && document.body.classList.contains('gallery-active'))) {
        return;
      }
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
      
      const isScrollingDown = event.deltaY > 0;
      const atFirstProject = currentProjectIndex === 0;
      const atLastProject = currentProjectIndex === projects.length - 1;

      // When at edges, ask parent slider to advance and let the wheel bubble
      if (isScrollingDown && atLastProject) {
        window.dispatchEvent(new CustomEvent('projects-edge-scroll', { detail: { direction: 'next' } }));
        return;
      }
      if (!isScrollingDown && atFirstProject) {
        window.dispatchEvent(new CustomEvent('projects-edge-scroll', { detail: { direction: 'prev' } }));
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
  }, [isVisible, showGallery]);

  // Handle gallery open/close with animation
  const handleProjectClick = () => {
    // Only allow opening when Projects section is actually active/visible
    const parent = containerRef.current?.parentElement;
    const isProjectsVisible = parent?.classList.contains('projects-visible');
    const isProjectsActive = parent?.getAttribute('data-projects-active') === 'true';
    if (!isProjectsVisible || !isProjectsActive || !isVisible) {
      return;
    }

    setShowGallery(true);
    setGalleryImages(currentProject.images);
    
    // Add class to body to hide slide content
    document.body.classList.add('gallery-active');
    
         // Animate the gallery expansion
     setTimeout(() => {
       const gallery = document.querySelector('.project-gallery-expanding');
       const content = document.querySelector('.gallery-content');
       if (gallery && content) {
         // Start from nothing (invisible)
         gsap.set(gallery, {
           width: '0px',
           height: '0px',
           left: '50%',
           top: '50%',
           xPercent: -50,
           yPercent: -50,
           opacity: 0
         });
         
         // Set content to be hidden initially
         gsap.set(content, {
           opacity: 0,
           width: '100%',
           height: '100%'
         });
         
                   // Create the three-step animation
          const tl = gsap.timeline();
          
          // Step 1: Expand horizontally from center (like "pulling" it open from nothing)
          tl.to(gallery, {
            opacity: 1,
            width: '600px',
            duration: 0.4,
            ease: "power2.out"
          })
          // Step 2: Expand vertically to create the small rectangle
          .to(gallery, {
            height: '400px',
            duration: 0.3,
            ease: "power2.out"
          })
          // Step 3: Expand evenly from all sides to fill the screen
          .to(gallery, {
            width: '90vw',
            height: '90vh',
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              // Show gallery content
              gsap.to('.gallery-content', {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
              });
            }
          });
       }
     }, 50);
  };

     const handleGalleryClose = () => {
     // Animate gallery closing
     const gallery = document.querySelector('.project-gallery-expanding');
     if (gallery) {
       // Hide gallery content first
       gsap.to('.gallery-content', {
         opacity: 0,
         duration: 0.2,
         ease: "power2.in"
       });
       
       setTimeout(() => {
         // Create the reverse animation timeline
         const tl = gsap.timeline({
           onComplete: () => {
             setShowGallery(false);
             setGalleryImages([]);
             // Remove class from body to show slide content
             document.body.classList.remove('gallery-active');
           }
         });
         
                   // Step 1: Shrink evenly from all sides back to small rectangle
          tl.to(gallery, {
            width: '600px',
            height: '400px',
            duration: 0.6,
            ease: "power2.in"
          })
          // Step 2: Shrink vertically back to horizontal line
          .to(gallery, {
            height: '0px',
            duration: 0.3,
            ease: "power2.in"
          })
          // Step 3: Collapse horizontally from left and right edges (like "pulling" it closed)
          .to(gallery, {
            width: '0px',
            duration: 0.4,
            ease: "power2.in"
          })
          // Step 4: Fade out completely
          .to(gallery, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
          });
       }, 200);
     } else {
       setShowGallery(false);
       setGalleryImages([]);
       // Remove class from body to show slide content
       document.body.classList.remove('gallery-active');
     }
   };

  // Close gallery when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGallery && !event.target.closest('.project-gallery-expanding')) {
        handleGalleryClose();
      }
    };

    if (showGallery) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showGallery]);

  // Build display list for nicer small galleries
  const displayMedia = useMemo(() => {
    if (!Array.isArray(galleryImages)) return [];
    if (galleryImages.length === 1) return galleryImages;
    if (galleryImages.length === 2) {
      const [a, b] = galleryImages;
      return [a, b, a, b, a];
    }
    return galleryImages;
  }, [galleryImages]);

  const isHero = galleryImages.length === 1;
  const isSmallSet = galleryImages.length > 1 && galleryImages.length < 3;
  const repeatedMedia = useMemo(() => {
    return isHero ? galleryImages : [...displayMedia, ...displayMedia, ...displayMedia];
  }, [displayMedia, galleryImages, isHero]);

  const navigateProjectWithFade = (direction) => {
    const content = document.querySelector('.gallery-content');
    if (!content) {
      // Fallback: just change index
      setCurrentProjectIndex(prev => direction === 'next' ? (prev + 1) % projects.length : (prev === 0 ? projects.length - 1 : prev - 1));
      return;
    }

    gsap.to(content, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        setCurrentProjectIndex(prev => {
          const nextIndex = direction === 'next' ? (prev + 1) % projects.length : (prev === 0 ? projects.length - 1 : prev - 1);
          // Allow DOM to update then fade back in
          requestAnimationFrame(() => {
            const newContent = document.querySelector('.gallery-content');
            if (newContent) {
              gsap.fromTo(newContent, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
            }
          });
          return nextIndex;
        });
      }
    });
  };

  // Highlight center media in gallery (for focus effect)
  useEffect(() => {
    if (!showGallery) return;
    const container = document.querySelector('.gallery-horizontal');
    if (!container) return;

    const updateCenter = () => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      let nearest = null;
      let nearestDist = Number.POSITIVE_INFINITY;
      const items = container.querySelectorAll('.gallery-item');
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const dist = Math.abs(itemCenter - centerX);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = item;
        }
      });
      items.forEach((el) => el.classList.remove('is-center'));
      if (nearest) nearest.classList.add('is-center');
    };

    updateCenter();
    const onScroll = () => requestAnimationFrame(updateCenter);
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCenter);
    setTimeout(updateCenter, 100);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateCenter);
    };
  }, [showGallery]);

  // Enable click-drag scrolling in gallery
  useEffect(() => {
    if (!showGallery) return;
    const container = document.querySelector('.gallery-horizontal');
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.classList.add('dragging');
    };

    const onMouseLeave = () => {
      isDown = false;
      container.classList.remove('dragging');
    };

    const onMouseUp = () => {
      isDown = false;
      container.classList.remove('dragging');
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX);
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    // Smooth wheel-to-horizontal scroll + seamless loop via teleport
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      container.scrollLeft += delta;

      const totalWidth = container.scrollWidth;
      const viewWidth = container.clientWidth;
      const third = totalWidth / 3;

      // Teleport between clones when passing boundaries
      if (container.scrollLeft < third - viewWidth) {
        container.scrollLeft += third;
      } else if (container.scrollLeft > third * 2) {
        container.scrollLeft -= third;
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('wheel', onWheel);
    };
  }, [showGallery]);

  // Animate project content with smoother transitions
  useEffect(() => {
    if (!isVisible) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    
    // Reset all elements and immediately hide them
    gsap.set(containerRef.current, { clearProps: "all" });
    
         // Immediately hide all elements to prevent overlap
     const allElements = containerRef.current?.querySelectorAll('.project-pronunciation, .project-tags .tag, .project-technologies h3, .project-technologies .tech-item, .project-year span');
    if (allElements) {
      gsap.set(allElements, { opacity: 0, y: 10, scale: 0.98 });
    }
    
         // Animate title with ScrambleText (keep as is)
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



                   // Smooth fade in for all other elements with faster timing
     const elementsToAnimate = [
       '.project-pronunciation',
       '.project-tags .tag',
       '.project-technologies h3',
       '.project-technologies .tech-item',
       '.project-year span'
     ];

    elementsToAnimate.forEach((selector, index) => {
      const elements = containerRef.current?.querySelectorAll(selector);
      if (elements) {
        tl.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: selector.includes('.tag') || selector.includes('.tech-item') ? 0.02 : 0,
          ease: "power2.out"
        }, index * 0.03 + 0.2);
      }
    });

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
             <div className="project-content">
                  {/* Project Title */}
          <div className="project-title">
            {currentProject.liveUrl ? (
              <a href={currentProject.liveUrl} target="_blank" rel="noreferrer">
                <h2>{currentProject.title}</h2>
              </a>
            ) : (
              <h2>{currentProject.title}</h2>
            )}
          </div>

         {/* Pronunciation */}
         <div className="project-pronunciation">
           <p>{currentProject.pronunciation}</p>
         </div>

          {/* Description */}
          <div className="project-description">
            <p>{currentProject.description}</p>
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

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dots">
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
          </div>
        </div>

      </div>

      
    </div>
  );
};

export default ProjectSlider; 