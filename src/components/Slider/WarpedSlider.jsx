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
  // Used earlier to sync animations; kept for potential future use


  const splitTitleToWords = (element) => {
    if (!element) return;
    try {
      // Prefer the static helper if available
      SplitText.create(element, {
        type: "words",
        wordsClass: "word",
        mask: "words",
      });
    } catch {
      // Fallback to constructor API
      try {
        // eslint-disable-next-line no-new
        new SplitText(element, { type: "words", wordsClass: "word" });
      } catch {}
    }
  };

  const createLineElements = (element) => {
    if (!element) return;
    try {
      SplitText.create(element, {
        type: "lines",
        linesClass: "line",
        mask: "lines",
        reduceWhiteSpace: false,
      });
    } catch {
      try {
        // eslint-disable-next-line no-new
        new SplitText(element, { type: "lines", linesClass: "line" });
      } catch {}
    }
  };

  const processTextElements = (container) => {
    // Split title into words (reference behavior)
    const title = container.querySelector(".slide-title h1");
    if (title) splitTitleToWords(title);

    // Split full name into words
    const name = container.querySelector(".full-name h1");
    if (name) splitTitleToWords(name);

    // Split description, tags, and index into lines
    container.querySelectorAll(".slide-description p").forEach(createLineElements);
    container.querySelectorAll(".slide-tags p").forEach(createLineElements);
    container.querySelectorAll(".slide-index-wrapper p").forEach(createLineElements);
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

  // Attach listeners to dynamically injected slide arrows
  const setupSlideControls = (container) => {
    const arrowButtons = container.querySelectorAll('.slide-arrow-btn');
    arrowButtons.forEach((btn) => {
      const dir = btn.getAttribute('data-dir');
      if (!dir) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (dir === 'prev') {
          handleSlideChange('prev');
        } else if (dir === 'next') {
          handleSlideChange('next');
        }
      });
    });
  };

  const setupSpotifyMarquee = (container) => {
    const wrapper = container.querySelector('.spotify-container');
    const line = container.querySelector('.spotify-line');
    if (!wrapper || !line) return;
    // remove prior listeners to avoid stacking
    const clone = line.cloneNode(true);
    line.parentNode.replaceChild(clone, line);
    const maxWidth = wrapper.clientWidth;
    const measure = () => ({ w: clone.scrollWidth, max: wrapper.clientWidth });
    const onEnter = () => {
      const { w, max } = measure();
      if (w <= max + 2) return; // no need to scroll
      const distance = w - max;
      clone.style.transition = 'transform 0s linear';
      clone.style.transform = 'translateX(0)';
      requestAnimationFrame(() => {
        clone.style.transition = `transform ${Math.max(6, distance/30)}s linear`;
        clone.style.transform = `translateX(-${distance}px)`;
      });
    };
    const onLeave = () => {
      clone.style.transition = 'transform 0.25s ease-out';
      clone.style.transform = 'translateX(0)';
    };
    wrapper.addEventListener('mouseenter', onEnter);
    wrapper.addEventListener('mouseleave', onLeave);
  };

  const updateSpotifyInfo = async (container) => {
    const spotifyContainer = container.querySelector('.spotify-container');
    if (!spotifyContainer) return;
    const p = spotifyContainer.querySelector('.spotify-line');
    if (!p) return;

    try {
      const response = await fetch('/api/spotify/now-playing');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Spotify access token not configured') {
          // Leave current text/animation intact
          return;
        }
        throw new Error('Failed to fetch current track');
      }
      
      const data = await response.json();
      // Only update when actively playing to avoid breaking SplitText structure
      if (data && data.isPlaying && data.title) {
        const text = `${data.title} - ${data.artist}`;
        p.textContent = text;
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      // Keep existing content; don't disrupt animation
      return;
    }
  };

  const createSlideElement = (slideData, slideIndex) => {
    const content = document.createElement("div");
    content.className = "slider-content";
    content.style.opacity = "0";
    content.setAttribute('data-slide-index', String(slideIndex));

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
      
      <div class="slide-header">
        <div class="slide-title"><h1>${slideData.slideTitle}</h1></div>
        <div class="slide-description">
          <p>${slideData.slideDescription}</p>
        </div>
      </div>
      <div class="slide-info">
        <div class="slide-tags">
          <p>${Number(slideIndex) === 0 ? 'SOCIALS' : Number(slideIndex) === 1 ? 'INTERESTS' : Number(slideIndex) === 2 ? 'LEARNING' : Number(slideIndex) === 3 ? 'GEAR' : 'TAGS'}</p>
          ${slideIndex === 0 ? 
            '<p class="social-link" data-url="https://www.linkedin.com/in/calebk25/">LinkedIn</p>' +
            '<p class="social-link" data-url="https://github.com/calebK25">GitHub</p>' +
            '<p class="social-link" data-url="/resume">Resume</p>' +
            '<div class="spotify-container"><p class="spotify-line">NOT PLAYING</p></div>'
          : 
            slideData.slideTags.map(tag => `<p>${tag}</p>`).join('')
          }
        </div>
        <div class="slide-index-group">
          <button class="slide-arrow-btn" data-dir="prev" aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="slide-index-inner">
            <div class="slide-index-wrapper">
              <p>${(slideIndex + 1).toString().padStart(2, "0")}</p>
              <p>/</p>
              <p>${slides.length.toString().padStart(2, "0")}</p>
            </div>
          </div>
          <button class="slide-arrow-btn" data-dir="next" aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      ${techStackHTML}
    `;

    return content;
  };



  const animateSlideTransition = (nextIndex) => {
    const currentContent = document.querySelector(".slider-content");
    const slider = sliderRef.current;

    const timeline = gsap.timeline();

    // Minimal page transition overlay
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }
    gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });
    // Remove dark flash: keep overlay transparent (no fade in)

    // Animate counter exit
    const currentCounterLines = currentContent.querySelectorAll(".slide-index-wrapper .line");
    if (currentCounterLines && currentCounterLines.length > 0) {
      timeline.to(currentCounterLines, {
        y: "-100%",
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.inOut",
      }, 0);
    }

    // Animate title characters exit
    const currentTitleWords = currentContent.querySelectorAll(".slide-title .word");
    if (currentTitleWords.length > 0) {
      timeline.to(currentTitleWords, {
        y: "-100%",
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.inOut",
      }, 0.1);
    }

    // Animate full name words exit
    const currentFullNameWords = currentContent.querySelectorAll(".full-name .word");
    if (currentFullNameWords.length > 0) {
      timeline.to(currentFullNameWords, {
        y: "-100%",
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.inOut",
      }, 0.1);
    }

    // Animate description lines exit
    const currentDescLines = currentContent.querySelectorAll(".slide-description .line");
    if (currentDescLines.length > 0) {
      timeline.to(currentDescLines, {
        y: "-100%",
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.inOut",
      }, 0.1);
    }

    // Animate tags exit
    const currentTagLines = currentContent.querySelectorAll(".slide-tags .line");
    if (currentTagLines.length > 0) {
      timeline.to(currentTagLines, {
        y: "-100%",
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.inOut",
      }, 0.1);
    }



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

        // Inject receipt overlay for About slide if missing before splitting
        if (nextIndex === 0 && newContent && !newContent.querySelector('.receipt-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'receipt-overlay';
          overlay.innerHTML = `
            <div class="corner-logo"></div>
            <div class="serial-code">ABT-01</div>
            <div class="crop crop-tl"></div>
            <div class="crop crop-tr"></div>
            <div class="crop crop-bl"></div>
            <div class="crop crop-br"></div>
            <div class="watermark">${new Date().toISOString().slice(0,10)}-001</div>
          `;
          newContent.appendChild(overlay);
        }

        // Will prepare animated elements after splitting

        setTimeout(() => {
              processTextElements(newContent);
    setupSocialLinks(newContent);

          const newTitleWords = newContent.querySelectorAll(".slide-title .word");
          const newDescLines = newContent.querySelectorAll(".slide-description .line");
          const newTagLines = newContent.querySelectorAll(".slide-tags .line");
          const newCounterLines = newContent.querySelectorAll(".slide-index-wrapper .line");
          const newFromToRows = newContent.querySelectorAll(".fromto .ft-row");
          const newFromTo = newContent.querySelector('.fromto');

          // Do not inject micro-meta on About to maintain fixed header spacing

          // Prepare animated elements now that they exist
          gsap.set([...newTitleWords, ...newDescLines, ...newTagLines, ...newCounterLines], { y: "100%" });
          if (newFromToRows.length > 0) {
            gsap.set(newFromToRows, { opacity: 0 });
            if (newFromTo) {
              gsap.set(newFromTo, { opacity: 0 });
              newFromTo.style.setProperty('--lineScale', '0');
            }
          }

          // Only set animation for elements that exist and are valid
          const elementsToAnimate = [];
          if (newTitleWords && newTitleWords.length > 0) {
            newTitleWords.forEach(el => {
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

          // Ensure arrow controls are wired for the newly created slide
          setupSlideControls(newContent);
          setupSpotifyMarquee(newContent);
          
          // Set counter initial state
          if (newCounterLines && newCounterLines.length > 0) {
            gsap.set(newCounterLines, { y: "100%", opacity: 1 });
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
            
            // Set initial state for full name words
            const fullNameWordsInit = profileStatsContainer.querySelectorAll(".full-name .word");
            if (fullNameWordsInit && fullNameWordsInit.length > 0) {
              gsap.set(fullNameWordsInit, { y: "100%" });
            }
          }

          const timeline = gsap.timeline({
              onComplete: () => {
                isTransitioningRef.current = false;
                currentSlideIndexRef.current = nextIndex;
                // Fade overlay out at end
                gsap.to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.inOut' });
                // After animation completes, safely update spotify text without breaking animation structure
                updateSpotifyInfo(newContent);
              },
          });

          // Animate title words (reference timing)
          if (newTitleWords && newTitleWords.length > 0) {
            const validTitleWords = Array.from(newTitleWords).filter(el => el && el.nodeType === 1);
            if (validTitleWords.length > 0) {
              timeline.to(validTitleWords, {
                y: "0%",
                duration: 1.1,
                ease: "power3.out",
                stagger: 0.1,
              }, 0.75);
            }
          }

          // Animate full name words
          const newFullNameWords = newContent.querySelectorAll(".full-name .word");
          if (newFullNameWords && newFullNameWords.length > 0) {
            const validFullNameWords = Array.from(newFullNameWords).filter(el => el && el.nodeType === 1);
            if (validFullNameWords.length > 0) {
              timeline.to(validFullNameWords, {
                y: "0%",
                duration: 1,
                ease: "power4.out",
                stagger: 0.08,
              }, 0.8);
            }
          }

          // Animate description lines
          if (newDescLines && newDescLines.length > 0) {
            const validDescLines = Array.from(newDescLines).filter(el => el && el.nodeType === 1);
            if (validDescLines.length > 0) {
              timeline.to(validDescLines, {
                y: "0%",
                duration: 1.1,
                ease: "power3.out",
                stagger: 0.1,
              }, "<");
            }
          }

          // Animate tag lines
          if (newTagLines && newTagLines.length > 0) {
            const validTagLines = Array.from(newTagLines).filter(el => el && el.nodeType === 1);
            if (validTagLines.length > 0) {
              timeline.to(validTagLines, {
                y: "0%",
                duration: 1.1,
                ease: "power3.out",
                stagger: 0.1,
              }, "-=0.75");
            }
          }

          // spotify animates as part of tag lines (no special casing)



          // Animate counter
          if (newCounterLines && newCounterLines.length > 0) {
            timeline.to(newCounterLines, {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            }, "<");
          }

          // Animate From/To, only on About slide
          if (nextIndex === 0 && newFromToRows.length > 0) {
            if (newFromTo) {
              timeline.to(newFromTo, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.9);
              timeline.call(() => newFromTo.style.setProperty('--lineScale', '1'), null, 0.95);
            }
            timeline.to(newFromToRows, {
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
            }, 0.95);
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
    // Ensure paper texture is ready then reveal overlay
    const img = new Image();
    img.onload = () => {
      document.documentElement.style.setProperty('--paperBg', `url('/White Concrete Background.jpg')`);
      document.documentElement.classList.add('paper-loaded');
    };
    img.src = '/White Concrete Background.jpg';
    
    // First fade in the entire content
    gsap.to(content, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    });

    // Add receipt overlay elements once on initial slide
    if (content && !content.querySelector('.receipt-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'receipt-overlay';
      overlay.innerHTML = `
        <div class="corner-logo"></div>
        <div class="serial-code">ABT-01</div>
        <div class="crop crop-tl"></div>
        <div class="crop crop-tr"></div>
        <div class="crop crop-bl"></div>
        <div class="crop crop-br"></div>
        <div class="watermark">${new Date().toISOString().slice(0,10)}-001</div>
      `;
      content.appendChild(overlay);
    }

    // Select split elements produced earlier in processTextElements
    const titleWords = content.querySelectorAll(".slide-title .word");
    const descLines = content.querySelectorAll(".slide-description .line");
    const tagLines = content.querySelectorAll(".slide-tags .line");
    const counterLines = content.querySelectorAll(".slide-index-wrapper .line");
    const fullNameWords = content.querySelectorAll(".full-name .word");
    const fromToRows = content.querySelectorAll(".fromto .ft-row");
    const fromTo = content.querySelector('.fromto');

    // Set initial state
    gsap.set([...titleWords, ...descLines, ...tagLines, ...counterLines, ...fullNameWords], { y: "100%" });
    if (fromToRows.length > 0) {
      gsap.set(fromToRows, { opacity: 0 });
      if (fromTo) {
        gsap.set(fromTo, { opacity: 0 });
        fromTo.style.setProperty('--lineScale', '0');
      }
    }

    // Animate title words
    if (titleWords.length > 0) {
      gsap.to(titleWords, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.75 });
      // reveal underline after text comes in (only for opted-in titles)
      const h1 = content.querySelector('.slide-title h1.underline');
      if (h1) setTimeout(() => h1.classList.add('title-show'), 900);
    }

    // Animate description lines
    if (descLines.length > 0) {
      gsap.to(descLines, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.75 });
    }

    // Remove micro-meta on initial slide to keep hero spacing consistent
    const existingMeta = content.querySelector('.micro-meta');
    if (existingMeta) existingMeta.remove();

    // Animate tag lines
    if (tagLines.length > 0) {
      gsap.to(tagLines, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.75 });
    }

    // spotify animates via tagLines

    // Animate counter lines
    if (counterLines.length > 0) {
      gsap.to(counterLines, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.75 });
    }

    // Animate full name words at same time as title/tags
    if (fullNameWords.length > 0) {
      gsap.to(fullNameWords, { y: "0%", duration: 1, ease: "power4.out", stagger: 0.08, delay: 0.75 });
    }

    // Animate From/To rows after tags
    if (fromToRows.length > 0) {
      if (fromTo) {
        gsap.to(fromTo, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.9 });
        setTimeout(() => fromTo.style.setProperty('--lineScale', '1'), 950);
      }
      gsap.to(fromToRows, { opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.95 });
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
      }, 1600);
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
      setupSlideControls(initialContent);
      setupSpotifyMarquee(initialContent);
      // Prepare full-name words
      const nameWords = initialContent.querySelectorAll('.full-name .word');
      if (nameWords && nameWords.length > 0) { gsap.set(nameWords, { y: '100%' }); }
      // Fetch and animate when data arrives so it doesn't remain hidden if late
      // Keep timing with other tags by letting SplitText on LOADING... handle entry.
      // Update the text after animation completes to avoid early entrance.
      setTimeout(() => updateSpotifyInfo(initialContent), 1100);
    }

    // Set up periodic Spotify updates
    const spotifyInterval = setInterval(() => {
      const currentContent = document.querySelector(".slider-content");
      if (currentContent) {
        // Update the text only; no re-animation to avoid jumping ahead
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
      }, 1600); // wait for experience title/description to animate first
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
      <div className="slider-content" data-slide-index="0" style={{ opacity: 0 }}>
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
        {/* From/To removed per request */}
        <div className="slide-header">
          <div className="slide-title">
            <h1>{slides[0].slideTitle}</h1>
          </div>
          <div className="slide-description">
            <p>{slides[0].slideDescription}</p>
          </div>
        </div>
        <div className="slide-info">
          <div className="slide-tags">
            <p>SOCIALS</p>
            <p className="social-link" data-url="https://www.linkedin.com/in/calebk25/">LinkedIn</p>
            <p className="social-link" data-url="https://github.com/calebK25">GitHub</p>
            <p className="social-link" data-url="/resume">Resume</p>
            <div className="spotify-container">
              <p className="spotify-line">NOT PLAYING</p>
            </div>
          </div>
          <div className="slide-index-group">
            <button className="slide-arrow-btn" aria-label="Previous" onClick={() => handleSlideChange('prev')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 6l-6 6 6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="slide-index-inner">
              <div className="slide-index-wrapper">
                <p>01</p>
                <p>/</p>
                <p>{slides.length.toString().padStart(2, "0")}</p>
              </div>
            </div>
            <button className="slide-arrow-btn" aria-label="Next" onClick={() => handleSlideChange('next')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
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