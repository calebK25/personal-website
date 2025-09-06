"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import slides from "./slides.js";
import ThreeJSSlider from "./ThreeJSSlider.jsx";
import ExperienceTimeline from "../ExperienceTimeline.jsx";
import ProjectSlider from "./ProjectSlider.jsx";


// Register GSAP plugins
gsap.registerPlugin(SplitText);
gsap.config({ nullTargetWarn: false });

const WarpedSlider = () => {
  const sliderRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineExiting, setTimelineExiting] = useState(false);
  const [galleryActive, setGalleryActive] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [projectsActive, setProjectsActive] = useState(false);
  
  // State refs
  const currentSlideIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const galleryActiveRef = useRef(false);
  const projectsActiveRef = useRef(false);


  const createCharacterElements = (element) => {
    if (element.querySelectorAll(".char").length > 0) return;

    const words = element.textContent.split(" ");
    element.innerHTML = "";

    words.forEach((word, index) => {
      const wordDiv = document.createElement("div");
      wordDiv.className = "word";

      [...word].forEach((char) => {
        const charDiv = document.createElement("div");
        charDiv.className = "char";
        charDiv.innerHTML = `<span>${char}</span>`;
        wordDiv.appendChild(charDiv);
      });

      element.appendChild(wordDiv);

      if (index < words.length - 1) {
        const spaceChar = document.createElement("div");
        spaceChar.className = "word";
        spaceChar.innerHTML = '<div class="char"><span> </span></div>';
        element.appendChild(spaceChar);
      }
    });
  };

  const createLineElements = (element) => {
    new SplitText(element, { type: "lines", linesClass: "line" });
    element.querySelectorAll(".line").forEach((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
    });
  };

  const processTextElements = (container) => {
    // Restore character splitting for title
    const title = container.querySelector(".slide-title h1");
    if (title) createCharacterElements(title);

    // Apply character splitting for full name
    const fullName = container.querySelector(".full-name h1");
    if (fullName) createCharacterElements(fullName);

    // Apply SplitText to description paragraphs
    container
      .querySelectorAll(".slide-description p")
      .forEach(createLineElements);

    // Apply SplitText to tags
    container
      .querySelectorAll(".slide-tags p")
      .forEach(createLineElements);
  };



  const setupSocialLinks = (container) => {
    const socialLinks = container.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });
  };

  const updateSpotifyInfo = async (container) => {
    const spotifyContainer = container.querySelector('.spotify-container');
    if (!spotifyContainer) return;

    try {
      const response = await fetch('/api/spotify/now-playing');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Spotify access token not configured') {
          spotifyContainer.innerHTML = '<p>NOT PLAYING</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div>';
          return;
        }
        throw new Error('Failed to fetch current track');
      }
      
      const data = await response.json();
      
      if (data.isPlaying) {
        spotifyContainer.innerHTML = `<p>${data.title} - ${data.artist}</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div>`;
      } else {
        spotifyContainer.innerHTML = '<p>NOT PLAYING</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div>';
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      spotifyContainer.innerHTML = '<p>NOT PLAYING</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div>';
    }
  };

  const createSlideElement = (slideData, slideIndex) => {
    const content = document.createElement("div");
    content.className = "slider-content";
    content.style.opacity = "0";

    // Add profile picture for About Me slide (slideIndex === 0)
    let profilePictureHTML = '';
    if (slideIndex === 0 && slideData.slideImg) {
      profilePictureHTML = `
        <div class="profile-container">
          <div class="profile-img">
            <img src="${slideData.slideImg}" alt="Caleb Kha-Uong" />
          </div>
        </div>
      `;
    }

    // Add full name for About Me slide
    let fullNameHTML = '';
    if (slideIndex === 0) {
      fullNameHTML = `
        <div class="full-name">
          <h1>Caleb Kha-Uong</h1>
        </div>
      `;
    }

    // Tech stack removed from front page
    let techStackHTML = '';

    content.innerHTML = `
      ${slideIndex === 0 ? `
        <div class="profile-stats-container">
          ${fullNameHTML}
          ${profilePictureHTML}
        </div>
      ` : ''}
      <div class="slide-title"><h1>${slideData.slideTitle}</h1></div>
      <div class="slide-description">
        <p>${slideData.slideDescription}</p>
        <div class="slide-info">
          <p>Section. ${slideData.slideUrl}</p>
        </div>
      </div>
      <div class="slide-tags">
        <p>${Number(slideIndex) === 0 ? 'SOCIALS' : Number(slideIndex) === 1 ? 'INTERESTS' : Number(slideIndex) === 2 ? 'LEARNING' : Number(slideIndex) === 3 ? 'GEAR' : 'TAGS'}</p>
        ${slideIndex === 0 ? 
                     '<p class="social-link" data-url="https://www.linkedin.com/in/calebk25/">LinkedIn</p>' +
           '<p class="social-link" data-url="https://github.com/calebK25">GitHub</p>' +
           '<p class="social-link" data-url="/resume">Resume</p>' +
                       '<div class="spotify-container"><p>LOADING...</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div></div>'
          : 
          slideData.slideTags.map(tag => `<p>${tag}</p>`).join('')
        }
      </div>
      ${techStackHTML}
              <div class="slide-index-wrapper">
          <p>${(slideIndex + 1).toString().padStart(2, "0")}</p>
          <p>/</p>
          <p>${slides.length.toString().padStart(2, "0")}</p>
        </div>
    `;

    return content;
  };



  const animateSlideTransition = (nextIndex) => {
    const currentContent = document.querySelector(".slider-content");
    const slider = sliderRef.current;

    const timeline = gsap.timeline();

    // Animate counter exit
    const currentCounter = currentContent.querySelector(".slide-index-wrapper");
    if (currentCounter) {
      timeline.to(currentCounter, {
        y: "-20px",
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      }, 0);
    }

    // Animate title characters exit
    const currentTitleChars = currentContent.querySelectorAll(".slide-title .char span");
    if (currentTitleChars.length > 0) {
      timeline.to(currentTitleChars, {
        y: "-100%",
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.inOut",
      }, 0);
    }

    // Animate full name characters exit
    const currentFullNameChars = currentContent.querySelectorAll(".full-name .char span");
    if (currentFullNameChars.length > 0) {
      timeline.to(currentFullNameChars, {
        y: "-100%",
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.inOut",
      }, 0);
    }

    // Animate description lines exit
    timeline.to(
      [...currentContent.querySelectorAll(".slide-description .line span")],
      {
        y: "-100%",
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.inOut",
      },
      0.1
    );

    // Animate tags exit
    timeline.to(
      [...currentContent.querySelectorAll(".slide-tags .line span")],
      {
        y: "-100%",
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.inOut",
      },
      0.1
    );



    // Animate profile picture and statistics exit
    const currentProfileStatsContainer = currentContent.querySelector(".profile-stats-container");
    if (currentProfileStatsContainer) {
      const currentProfileImg = currentProfileStatsContainer.querySelector(".profile-img");
      const currentStatLabels = currentProfileStatsContainer.querySelectorAll(".stat-label");
      const currentStatValues = currentProfileStatsContainer.querySelectorAll(".stat-value");
      
      // Animate profile picture exit
      if (currentProfileImg) {
        timeline.to(currentProfileImg, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        }, 0.1);
      }
      
      // Animate statistics exit
      if (currentStatLabels.length > 0) {
        timeline.to(currentStatLabels, {
          y: "-100%",
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.inOut",
        }, 0.1);
      }
      
      if (currentStatValues.length > 0) {
        timeline.to(currentStatValues, {
          y: "-100%",
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.inOut",
        }, 0.1);
      }
    }

    timeline.call(
      () => {
        const newContent = createSlideElement(slides[nextIndex], nextIndex);

        timeline.kill();
        currentContent.remove();
        slider.appendChild(newContent);

        gsap.set(newContent.querySelectorAll("span"), { y: "100%" });

        setTimeout(() => {
              processTextElements(newContent);
    setupSocialLinks(newContent);
    updateSpotifyInfo(newContent);

          const newTitleChars = newContent.querySelectorAll(".slide-title .char span");
          const newDescLines = newContent.querySelectorAll(".slide-description .line span");
          const newTagLines = newContent.querySelectorAll(".slide-tags .line span");
          const newCounter = newContent.querySelector(".slide-index-wrapper");

          // Only set animation for elements that exist and are valid
          const elementsToAnimate = [];
          if (newTitleChars && newTitleChars.length > 0) {
            newTitleChars.forEach(el => {
              if (el && el.nodeType === 1) elementsToAnimate.push(el);
            });
          }
          if (newDescLines && newDescLines.length > 0) {
            newDescLines.forEach(el => {
              if (el && el.nodeType === 1) elementsToAnimate.push(el);
            });
          }
          if (newTagLines && newTagLines.length > 0) {
            newTagLines.forEach(el => {
              if (el && el.nodeType === 1) elementsToAnimate.push(el);
            });
          }

          
          if (elementsToAnimate.length > 0) {
            gsap.set(elementsToAnimate, { y: "100%" });
          }
          gsap.set(newContent, { opacity: 1 });
          
          // Set counter initial state
          if (newCounter) {
            gsap.set(newCounter, {
              y: "20px",
              opacity: 0,
            });
          }

          // Set initial state for profile picture and full name container
          const profileStatsContainer = newContent.querySelector(".profile-stats-container");
          if (profileStatsContainer) {
            gsap.set(profileStatsContainer, {
              opacity: 1,
            });
            
            // Set initial state for profile picture
            const profileImg = profileStatsContainer.querySelector(".profile-img");
            if (profileImg) {
              gsap.set(profileImg, {
                opacity: 0,
              });
            }
            
            // Set initial state for full name characters
            const fullNameChars = profileStatsContainer.querySelectorAll(".full-name .char span");
            if (fullNameChars.length > 0) {
              gsap.set(fullNameChars, {
                y: "100%",
              });
            }
          }

          const timeline = gsap.timeline({
              onComplete: () => {
                isTransitioningRef.current = false;
                currentSlideIndexRef.current = nextIndex;
              },
          });

          // Animate title characters
          if (newTitleChars && newTitleChars.length > 0) {
            const validTitleChars = Array.from(newTitleChars).filter(el => el && el.nodeType === 1);
            if (validTitleChars.length > 0) {
              timeline.to(validTitleChars, {
              y: "0%",
              duration: 0.5,
              stagger: 0.025,
              ease: "power2.inOut",
              });
            }
          }

          // Animate full name characters
          const newFullNameChars = newContent.querySelectorAll(".full-name .char span");
          if (newFullNameChars && newFullNameChars.length > 0) {
            const validFullNameChars = Array.from(newFullNameChars).filter(el => el && el.nodeType === 1);
            if (validFullNameChars.length > 0) {
              timeline.to(validFullNameChars, {
                y: "0%",
                duration: 0.5,
                stagger: 0.025,
                ease: "power2.inOut",
              }, 0.2);
            }
          }

          // Animate description lines
          if (newDescLines && newDescLines.length > 0) {
            const validDescLines = Array.from(newDescLines).filter(el => el && el.nodeType === 1);
            if (validDescLines.length > 0) {
              timeline.to(
                validDescLines,
              { y: "0%", duration: 0.5, stagger: 0.1, ease: "power2.inOut" },
              0.3
              );
            }
          }

          // Animate tag lines
          if (newTagLines && newTagLines.length > 0) {
            const validTagLines = Array.from(newTagLines).filter(el => el && el.nodeType === 1);
            if (validTagLines.length > 0) {
              timeline.to(
                validTagLines,
              { y: "0%", duration: 0.5, stagger: 0.05, ease: "power2.inOut" },
              0.4
              );
            }
          }



          // Animate counter
          if (newCounter) {
            timeline.to(
              newCounter,
              {
                y: "0px",
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
              },
              0.5
            );
          }

          // Animate profile stats container with full name
          if (profileStatsContainer) {
            // Animate profile picture
            const profileImg = profileStatsContainer.querySelector(".profile-img");
            if (profileImg) {
              timeline.to(profileImg, {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
              }, 0.4);
            }
            
            // Animate full name characters
            const fullNameChars = profileStatsContainer.querySelectorAll(".full-name .char span");
            if (fullNameChars && fullNameChars.length > 0) {
              timeline.to(fullNameChars, {
                y: "0%",
                duration: 0.8,
                stagger: 0.025,
                ease: "power3.out",
              }, 0.5);
            }
          }

          // Animate tech stack with growing lines
          const techStack = newContent.querySelector(".tech-stack");
          if (techStack) {
            // Set initial state for tech stack
            gsap.set(techStack, {
              opacity: 0,
              scale: 0.95,
              y: 20,
            });

            // Set initial state for category titles
            const categoryTitles = techStack.querySelectorAll(".tech-category-title");
            categoryTitles.forEach(title => {
              gsap.set(title, { opacity: 0, y: 15 });
            });

            // Set initial state for tech items
            const techItems = techStack.querySelectorAll(".tech-item");
            if (techItems.length > 0) {
              gsap.set(techItems, {
                opacity: 0,
                scale: 0.8,
                y: 10,
                rotationX: 15,
              });
            }

            // Animate tech stack container
            timeline.to(techStack, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1.2,
              ease: "power3.out",
            }, 0.8);

            // Animate category titles with growing lines first
            categoryTitles.forEach((title, index) => {
              timeline.to(title, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => {
                  // Add class to trigger growing line animation
                  title.classList.add('animate-line');
                  title.classList.add('visible');
                }
              }, 1.2 + (index * 0.2));
            });

            // Animate tech items after lines are fully extended
            if (techItems.length > 0) {
              timeline.to(techItems, {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                stagger: 0.04,
                ease: "back.out(1.7)",
                onComplete: () => {
                  // Ensure tech items are visible after animation
                  gsap.set(techItems, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    clearProps: "all"
                  });
                  // Add visible class to all tech items
                  techItems.forEach(item => item.classList.add('visible'));
                  

                }
              }, 2.0); // Reduced delay - wait less for category titles
            }
          }
        }, 100);
      },
      null,
      0.5
    );
  };

  const setupInitialSlide = () => {
    const content = document.querySelector(".slider-content");
    
    // First fade in the entire content
    gsap.to(content, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    });

    const titleChars = content.querySelectorAll(".slide-title .char span");
    const descLines = content.querySelectorAll(".slide-description .line span");
    const tagLines = content.querySelectorAll(".slide-tags .line span");
    const fullNameChars = content.querySelectorAll(".full-name .char span");
    const counter = content.querySelector(".slide-index-wrapper");

    // Animate title characters
    if (titleChars.length > 0) {
    gsap.fromTo(
      titleChars,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" }
    );
    }

    // Animate description lines
    if (descLines.length > 0) {
    gsap.fromTo(
      descLines,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.2 }
    );
    }

    // Animate tag lines
    if (tagLines.length > 0) {
    gsap.fromTo(
      tagLines,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.4 }
    );
    }

        // Animate full name characters
    if (fullNameChars.length > 0) {
    gsap.fromTo(
      fullNameChars,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.3 }
    );
    }
    
    // Animate counter on initial load
    if (counter) {
      gsap.fromTo(
        counter,
        { y: "20px", opacity: 0 },
        { y: "0px", opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.8 }
      );
    }

    // Animate profile picture and full name container on initial load
    const profileStatsContainer = content.querySelector(".profile-stats-container");
    if (profileStatsContainer) {
      // Set initial state
      const profileImg = profileStatsContainer.querySelector(".profile-img");
      
      if (profileImg) {
        gsap.set(profileImg, {
          opacity: 0,
        });
      }
      
      // Animate profile picture
      if (profileImg) {
        gsap.to(profileImg, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.5,
        });
      }
    }

    // Animate tech stack with growing lines
    const techStack = content.querySelector(".tech-stack");
    if (techStack) {
      // Set initial state
      gsap.set(techStack, {
        opacity: 0,
        scale: 0.95,
        y: 20
      });

      // Animate the tech stack container with smooth entrance
      gsap.to(techStack, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
      });

      // Animate category titles with growing lines first
      const categoryTitles = techStack.querySelectorAll(".tech-category-title");
      categoryTitles.forEach((title, index) => {
        gsap.set(title, { opacity: 0, y: 15 });
        
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 1.2 + (index * 0.2),
          onComplete: () => {
            // Add class to trigger growing line animation
            title.classList.add('animate-line');
            title.classList.add('visible');
          }
        });
      });

      // Animate tech items after lines are fully extended
      const techItems = techStack.querySelectorAll(".tech-item");
      if (techItems.length > 0) {
        gsap.set(techItems, {
          opacity: 0,
          scale: 0.8,
          y: 10,
          rotationX: 15
        });

        gsap.to(techItems, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: "back.out(1.7)",
          delay: 2.0, // Reduced delay - wait less for category titles
          onComplete: () => {
            // Ensure tech items are visible after animation
            gsap.set(techItems, {
              opacity: 1,
              scale: 1,
              y: 0,
              rotationX: 0,
              clearProps: "all"
            });
            // Add visible class to all tech items
            techItems.forEach(item => item.classList.add('visible'));
            

          }
        });

        // Fallback: ensure tech items are visible after 4 seconds
        setTimeout(() => {
          gsap.set(techItems, {
            opacity: 1,
            scale: 1,
            y: 0,
            rotationX: 0,
            clearProps: "all"
          });
        }, 4000);
      }
    }
  };

  const handleSlideChange = (direction = "next") => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    let nextIndex;
    
    if (direction === "next") {
      nextIndex = (currentSlideIndexRef.current + 1) % slides.length;
    } else {
      nextIndex = currentSlideIndexRef.current === 0 ? slides.length - 1 : currentSlideIndexRef.current - 1;
    }

    // Store the previous index before updating
    const previousIndex = currentSlideIndexRef.current;
    
    currentSlideIndexRef.current = nextIndex;
    setCurrentSlideIndex(nextIndex);
    
    // Handle gallery animation
    if (nextIndex === 3) {
      // Delay gallery appearance to sync with slide transition and text reveal
      setTimeout(() => {
        setShowGallery(true);
        setGalleryActive(true);
      }, 800); // Increased delay to wait for text reveal
    } else if (previousIndex === 3) {
      // If leaving photography slide, animate out smoothly
      setShowGallery(false);
      setGalleryActive(false);
    } else {
      setShowGallery(false);
      setGalleryActive(false);
    }

    // Handle timeline animation
    if (nextIndex === 1) {
      // Delay timeline appearance to sync with slide transition
      setTimeout(() => {
        setShowTimeline(true);
        setTimelineExiting(false);
      }, 600);
    } else if (previousIndex === 1) {
      // If leaving experience slide, animate out smoothly
      setTimelineExiting(true);
      setTimeout(() => {
        setShowTimeline(false);
        setTimelineExiting(false);
      }, 400);
    } else {
      setShowTimeline(false);
      setTimelineExiting(false);
    }

    // Handle projects animation
    if (nextIndex === 2) {
      // Delay projects appearance to sync with slide transition
      setTimeout(() => {
        setShowProjects(true);
        setProjectsActive(true);
      }, 600);
    } else if (previousIndex === 2) {
      // If leaving projects slide, animate out smoothly
      setShowProjects(false);
      setProjectsActive(false);
    } else {
      setShowProjects(false);
      setProjectsActive(false);
    }
    
    animateSlideTransition(nextIndex);
  };

  useEffect(() => {
    // Set client state
    setIsClient(true);
  }, []);

  // Keep refs in sync so global listeners read fresh values
  useEffect(() => { galleryActiveRef.current = galleryActive; }, [galleryActive]);
  useEffect(() => { projectsActiveRef.current = projectsActive; }, [projectsActive]);

  useEffect(() => {
    if (!isClient) return;
    
    const slider = sliderRef.current;
    if (!slider) return;

    // Process initial slide content first
    const initialContent = slider.querySelector(".slider-content");
    if (initialContent) {
          processTextElements(initialContent);
    setupSocialLinks(initialContent);
    updateSpotifyInfo(initialContent);
    }

    // Set up periodic Spotify updates
    const spotifyInterval = setInterval(() => {
      const currentContent = document.querySelector(".slider-content");
      if (currentContent) {
        updateSpotifyInfo(currentContent);
      }
    }, 30000); // Update every 30 seconds

    // Setup initial slide animations
    setupInitialSlide();
    
    // Handle initial gallery state
    if (currentSlideIndex === 3) {
      setTimeout(() => {
        setShowGallery(true);
        setGalleryActive(true);
      }, 500);
    } else {
      setGalleryActive(false);
    }

    // Handle initial timeline state
    if (currentSlideIndex === 1) {
      setTimeout(() => {
        setShowTimeline(true);
      }, 500);
    }

    // Handle initial projects state
    if (currentSlideIndex === 2) {
      setTimeout(() => {
        setShowProjects(true);
        setProjectsActive(true);
      }, 500);
    }

    // Add event listeners
    const handleWheel = (e) => {
      const projectOverlayOpen = typeof document !== 'undefined' && document.body.classList.contains('gallery-active');

      // If a full-screen overlay gallery (projects) is open, block slide changes
      if (projectOverlayOpen) {
        e.preventDefault();
        return;
      }

      // While on Photography, only block when the pointer is over the gallery area
      if (galleryActiveRef.current) {
        const canvas = document.querySelector('.threejs-slider-container canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const insetX = rect.width * 0.1;   // shrink capture area by 10% horizontally
          const insetY = rect.height * 0.1;  // shrink capture area by 10% vertically
          const x = e.clientX;
          const y = e.clientY;
          const inside = x >= rect.left + insetX && x <= rect.right - insetX && y >= rect.top + insetY && y <= rect.bottom - insetY;
          if (inside) {
            // Let the ThreeJS slider consume the event
            e.preventDefault();
            return;
          }
        }
      }

      // While on Projects, only block global slide changes when the pointer is over the projects area
      if (projectsActiveRef.current) {
        const projectsContainer = document.querySelector('.projects-container.projects-visible');
        if (projectsContainer) {
          const rect = projectsContainer.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
          if (isInside) {
            // Let ProjectSlider handle scrolling within its area
            e.preventDefault();
            return;
          }
        }
      }

      // Otherwise, handle slide change normally
      e.preventDefault();
      if (e.deltaY > 0) {
        handleSlideChange("next");
      } else if (e.deltaY < 0) {
        handleSlideChange("prev");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    // Allow ProjectSlider to request slide changes when at edges
    const onProjectsEdgeScroll = (e) => {
      const dir = e?.detail?.direction;
      if (!dir) return;
      handleSlideChange(dir === 'next' ? 'next' : 'prev');
    };
    window.addEventListener('projects-edge-scroll', onProjectsEdgeScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener('projects-edge-scroll', onProjectsEdgeScroll);
      clearInterval(spotifyInterval);
    };
  }, [isClient]);

  return (
    <div ref={sliderRef} className="slider">
      <div className="slider-content" style={{ opacity: 0 }}>
        {/* Full Name and Profile Picture for About Me slide */}
        {slides[0].slideImg && (
          <div className="profile-stats-container">
            {/* Full Name with Didot styling for B and G */}
            <div className="full-name">
              <h1>Caleb Kha-Uong</h1>
            </div>
            
            <div className="profile-container">
              <div className="profile-img">
                <img src={slides[0].slideImg} alt="Caleb Kha-Uong" />
              </div>
            </div>
          </div>
        )}
        
        <div className="slide-title">
          <h1>{slides[0].slideTitle}</h1>
        </div>
        <div className="slide-description">
          <p>{slides[0].slideDescription}</p>
          
          <div className="slide-info">
            <p>Section. {slides[0].slideUrl}</p>
          </div>
        </div>
      <div className="slide-tags">
           <p>SOCIALS</p>
           <p className="social-link" data-url="https://www.linkedin.com/in/calebk25/">LinkedIn</p>
           <p className="social-link" data-url="https://github.com/calebK25">GitHub</p>
           <p className="social-link" data-url="/resume">Resume</p>
           <div className="spotify-container">
             <p>LOADING...</p>
           </div>
         </div>
      
        <div className="slide-index-wrapper">
          <p>01</p>
          <p>/</p>
          <p>{slides.length.toString().padStart(2, "0")}</p>
        </div>
      </div>
      
      {/* ThreeJS Slider for Photography section */}
      <div 
        className={`threejs-gallery-container ${showGallery ? 'gallery-visible' : 'gallery-hidden'}`}
        data-gallery-active={galleryActive ? 'true' : 'false'}
      >
        <ThreeJSSlider />
      </div>
      
      {/* Experience Timeline for Experience section */}
      {showTimeline && <ExperienceTimeline isExiting={timelineExiting} />}
      
      {/* Project Slider for Projects section */}
      <div 
        className={`projects-container ${showProjects ? 'projects-visible' : 'projects-hidden'}`}
        data-projects-active={projectsActive ? 'true' : 'false'}
      >
        <ProjectSlider />
      </div>
    </div>
  );
};

export default WarpedSlider; 