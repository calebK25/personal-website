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
    const spotifyTitle = container.querySelector('.spotify-title');
    if (!spotifyTitle) return;

    try {
      // For now, we'll use a placeholder since we need Spotify API credentials
      // In a real implementation, you'd need to set up Spotify API authentication
      spotifyTitle.textContent = "Not Playing";
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      spotifyTitle.textContent = "Not Playing";
    }
  };

  const createSlideElement = (slideData, slideIndex) => {
    const content = document.createElement("div");
    content.className = "slider-content";
    content.style.opacity = "0";

    // Add profile picture for About Me slide (slideIndex === 1)
    let profilePictureHTML = '';
    if (slideIndex === 1 && slideData.slideImg) {
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
    if (slideIndex === 1) {
      fullNameHTML = `
        <div class="full-name">
          <h1>Caleb Kha-Uong</h1>
        </div>
      `;
    }

    content.innerHTML = `
      ${slideIndex === 1 && slideData.slideImg ? `
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
        <p>${slideIndex === 1 ? 'SOCIALS' : 'TAGS'}</p>
        ${slideIndex === 1 ? 
          '<p class="social-link" data-url="https://www.linkedin.com/in/calebk25/">LinkedIn</p>' +
          '<p class="social-link" data-url="https://github.com/calebK25">GitHub</p>' +
          '<p class="social-link" data-url="mailto:uongcaleb@gmail.com">Email</p>' +
                      '<div class="spotify-container"><p class="spotify-title">Loading...</p><div class="spotify-visualizer"><div class="visualizer-bar"></div><div class="visualizer-bar"></div><div class="visualizer-bar"></div></div></div>'
          : 
          slideData.slideTags.map(tag => `<p>${tag}</p>`).join('')
        }
      </div>
      <div class="slide-index-wrapper">
        <p>${slideIndex.toString().padStart(2, "0")}</p>
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
        const newContent = createSlideElement(slides[nextIndex], nextIndex + 1);

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
      // If gallery or projects are active, completely ignore wheel events - let them handle their own
      if (galleryActive || projectsActive) {
        return; // Don't prevent default, don't stop propagation, just ignore
      }
      
      // For all other cases, prevent default and handle slide changes
      e.preventDefault();
      if (e.deltaY > 0) {
        handleSlideChange("next");
      } else if (e.deltaY < 0) {
        handleSlideChange("prev");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
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
          <p className="social-link" data-url="mailto:uongcaleb@gmail.com">Email</p>
          <div className="spotify-container">
            <p className="spotify-title">Loading...</p>
            <div className="spotify-visualizer">
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
            </div>
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