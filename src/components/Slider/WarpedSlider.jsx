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

  const addPrincetonHighlight = (container) => {
    try {
      const desc = container.querySelector('.slide-description p');
      if (!desc) return;
      // Only show on About Me (slide index 0)
      const host = container.closest('.slider-content') || container;
      const isAbout = host && host.getAttribute('data-slide-index') === '0';
      const existingList = container.querySelector('.papers-list');
      if (!isAbout) {
        if (existingList) existingList.remove();
        return;
      }
      // Always rebuild from original slide description to avoid stale wrappers
      let text = desc.textContent || '';
      const hostIndexStr = host ? host.getAttribute('data-slide-index') : null;
      const hostIndex = hostIndexStr != null ? parseInt(hostIndexStr, 10) : -1;
      if (!Number.isNaN(hostIndex) && slides[hostIndex] && slides[hostIndex].slideDescription) {
        text = String(slides[hostIndex].slideDescription);
      }
      const replacements = [
        { key: 'Princeton University', cls: 'hl-orange' },
        { key: 'Princeton Vision & Learning Lab', cls: 'hl-orange hl-soft-pink' },
        { key: 'Princeton IPA Lab', cls: 'hl-orange hl-soft-blue' },
        { key: 'Computer Science', cls: 'hl-orange hl-soft-cream' },
        { key: 'Statistics & Machine Learning', cls: 'hl-orange hl-soft-sage' },
        { key: 'Statistics and Machine Learning', cls: 'hl-orange hl-soft-sage' },
      
        { key: 'Nondeterminism', cls: 'paper-chip hl-paper-lilac', href: 'https://arxiv.org/abs/2407.XXXXX' },
        { key: 'Jet-Nemotron', cls: 'paper-chip hl-paper-mint', href: 'https://arxiv.org/abs/2405.XXXXX' },
      ];

      let html = text;
      const paperEntries = [];
      const papersData = [
        { title: 'Nondeterminism', href: 'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/', cls: 'paper-chip hl-paper-lilac' },
        { title: 'Jet-Nemotron', href: 'https://arxiv.org/html/2508.15884v1', cls: 'paper-chip hl-paper-mint' },
        { title: 'Pokemon Red via RL', href: 'https://arxiv.org/pdf/2502.19920', cls: 'paper-chip hl-paper-lilac' },
      ];
      // Stats phrase handled by replacements to mirror other highlight logic

      // Rebuild other highlights from plain text each time so re-entry always wraps correctly
      replacements.forEach(rep => {
        if (!html.includes(rep.key)) return;
        const safeKey = rep.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(safeKey);
        if (rep.cls.includes('paper-chip')) {
          paperEntries.push({ title: rep.key, href: rep.href, cls: rep.cls });
          html = html.replace(re, '');
        } else {
          html = html.replace(re, `<span class="${rep.cls}" data-text="${rep.key}">${rep.key}</span>`);
        }
      });

      // Reset to plain text then inject to avoid old wrappers accumulating
      desc.textContent = text;
      desc.innerHTML = html;
      // Build sleek papers list: merge dynamic matches with defaults and dedupe by title
      // Ensure Pokemon Red via RL is always present
      const ensure = [...paperEntries];
      const hasPokemon = ensure.some(e => e.title === 'Pokemon Red via RL');
      if (!hasPokemon) {
        ensure.push({ title: 'Pokemon Red via RL', href: 'https://arxiv.org/pdf/2502.19920', cls: 'paper-chip hl-paper-lilac' });
      }
      const merged = [...ensure, ...papersData];
      const toRender = Array.from(new Map(merged.map(item => [item.title, item])).values());
      if (toRender.length > 0) {
        let list = container.querySelector('.papers-list');
        if (!list) {
          list = document.createElement('div');
          list.className = 'papers-list';
          const tabs = document.createElement('div');
          tabs.className = 'papers-tabs';
          const papersTab = document.createElement('span');
          papersTab.className = 'papers-tab';
          papersTab.textContent = 'cool readings';
          tabs.appendChild(papersTab);
          const reveals = document.createElement('div');
          reveals.className = 'papers-reveal';
          list.appendChild(tabs);
          list.appendChild(reveals);
          const descWrapper = desc.parentElement;
          if (descWrapper) descWrapper.appendChild(list);
        }
        const reveals = list.querySelector('.papers-reveal');
        if (reveals) {
          reveals.innerHTML = '';
          toRender.forEach(pe => {
            const a = document.createElement('a');
            a.className = pe.cls;
            a.href = pe.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = pe.title;
            reveals.appendChild(a);
          });
          const papersTab = list.querySelector('.papers-tab');
          if (papersTab) {
            papersTab.onclick = () => {
              // Toggle cool readings reveal
              const isShown = reveals.classList.contains('show');
              if (isShown) {
                reveals.classList.remove('show');
              } else {
                reveals.classList.add('show');
              }
            };
            // Mark as bound to avoid double-binding on re-entry
            papersTab.dataset.bound = '1';
          }
        }
      }

      // highlight reveal and list timing handled by slide animation code
    } catch {}
  };

  const processTextElements = (container) => {
    // Split title into words (reference behavior)
    const title = container.querySelector(".slide-title h1");
    if (title) splitTitleToWords(title);

    // Split full name into words
    const name = container.querySelector(".full-name h1");
    if (name) {
      splitTitleToWords(name);
    }

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

    // Removed artist hover modal behavior per request
  };

  // Attach listeners to slide arrows
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
    // bind once per container to avoid breaking SplitText
    if (wrapper.dataset.marqueeBound === '1') return;
    wrapper.dataset.marqueeBound = '1';
    // Prefer animating the SplitText line node if available; re-query on each hover to avoid stale refs
    const getInner = () => wrapper.querySelector('.spotify-line .line') || line;
    const measure = () => { const el = getInner(); return { w: el.scrollWidth, max: wrapper.clientWidth, el }; };
    const onEnter = () => {
      const { w, max, el } = measure();
      if (w <= max + 2) return; // no need to scroll
      // Scroll the excess width plus a small pad so the end becomes visible but stays within container
      const distance = Math.min(w - max + 12, w - max + 12);
      el.style.willChange = 'transform';
      el.style.transition = 'transform 0s linear';
      el.style.transform = 'translateX(0)';
      requestAnimationFrame(() => {
        el.style.transition = `transform ${Math.max(3, distance/80)}s linear`;
        el.style.transform = `translateX(-${distance}px)`;
      });
    };
    const onLeave = () => {
      const el = getInner();
      el.style.transition = 'transform 0.2s ease-out';
      el.style.transform = 'translateX(0)';
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
          // Leave existing SplitText structure intact
          return;
        }
        throw new Error('Failed to fetch current track');
      }
      
      const data = await response.json();
      // Only update when actively playing to avoid breaking SplitText structure
      if (data && data.isPlaying && data.title) {
        const text = `${data.title} - ${data.artist}`;
        const lineEl = p.querySelector('.line') || p;
        if (lineEl.textContent !== text) {
          lineEl.textContent = text;
        }
      } else {
        // Keep initial NOT PLAYING text and its SplitText wrappers
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      // Keep existing content; do not replace SplitText structure
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
            '<div class="spotify-container" aria-label="Now Playing"><p class="spotify-line">NOT PLAYING</p></div>'
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

    const exitTL = gsap.timeline({
      onComplete: () => {
        const newContent = createSlideElement(slides[nextIndex], nextIndex);

        currentContent.remove();
        slider.appendChild(newContent);

        // Will prepare animated elements after splitting

        setTimeout(() => {
              // Ensure highlight span exists before splitting lines
              addPrincetonHighlight(newContent);
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
          gsap.set([...newTitleWords, ...newDescLines, ...newTagLines, ...newCounterLines], { y: "100%", filter: 'blur(6px)', opacity: 0 });
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

          // Wire slide controls
          setupSlideControls(newContent);
          setupSpotifyMarquee(newContent);
          
          // Set counter initial state
          if (newCounterLines && newCounterLines.length > 0) {
            gsap.set(newCounterLines, { y: "100%", opacity: 1 });
          }

          // Initial profile picture/full name state
          const profileStatsContainer = newContent.querySelector(".profile-stats-container");
          if (profileStatsContainer) {
            gsap.set(profileStatsContainer, {
              opacity: 1,
            });
            
            // Initial state for profile picture
            const profileImg = profileStatsContainer.querySelector(".profile-img");
            if (profileImg) {
              gsap.set(profileImg, {
                opacity: 0,
              });
            }
            
            // Initial state for full name words
            const fullNameWordsInit = profileStatsContainer.querySelectorAll(".full-name .word");
            if (fullNameWordsInit && fullNameWordsInit.length > 0) {
              gsap.set(fullNameWordsInit, { y: "100%", filter: 'blur(6px)', opacity: 0 });
            }
          }

          const entryTL = gsap.timeline({
              onComplete: () => {
                isTransitioningRef.current = false;
                currentSlideIndexRef.current = nextIndex;
                // Fade overlay out at end
                gsap.to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.inOut' });
                // After animation completes, safely update spotify text without breaking animation structure
                updateSpotifyInfo(newContent);
              },
          });

          // Animate title words
          if (newTitleWords && newTitleWords.length > 0) {
            const validTitleWords = Array.from(newTitleWords).filter(el => el && el.nodeType === 1);
            if (validTitleWords.length > 0) {
              entryTL.to(validTitleWords, {
              y: "0%",
                opacity: 1,
                duration: 0.75,
                ease: "power2.out",
                stagger: { amount: 0.2 },
                filter: 'blur(0px)',
              }, 0.5);
            }
          }

          // Animate full name words
          const newFullNameWords = newContent.querySelectorAll(".full-name .word");
          if (newFullNameWords && newFullNameWords.length > 0) {
            const validFullNameWords = Array.from(newFullNameWords).filter(el => el && el.nodeType === 1);
            if (validFullNameWords.length > 0) {
              entryTL.to(validFullNameWords, {
                y: "0%",
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.06,
                filter: 'blur(0px)',
              }, 0.5);
            }
          }

          // Animate description lines
          if (newDescLines && newDescLines.length > 0) {
            const validDescLines = Array.from(newDescLines).filter(el => el && el.nodeType === 1);
            if (validDescLines.length > 0) {
              entryTL.to(validDescLines, {
                y: "0%",
                opacity: 1,
                duration: 0.75,
                ease: "power2.out",
                stagger: { amount: 0.25 },
                filter: 'blur(0px)',
              }, "<+0.01");
              // re-trigger highlight animation on slide entry after lines render
              entryTL.call(() => {
                // spans were injected before splitting; just replay their animation
                const all = newContent.querySelectorAll('.hl-orange, .hl-soft-pink, .hl-soft-blue, .hl-soft-cream, .hl-soft-sage');
                all.forEach(s => s.classList.remove('hl-show'));
                // force reflow
                // eslint-disable-next-line no-unused-expressions
                newContent.offsetWidth;
                // trigger all highlights together after desc reveal
                all.forEach(s => s.classList.add('hl-show'));

                // Ensure papers tab is visible and wired on re-entry
                const list = newContent.querySelector('.papers-list');
                if (list) {
                  // delay cool readings reveal until after desc & highlights
                  setTimeout(() => {
                    list.classList.add('papers-in');
                  }, 120);
                  const papersTab = list.querySelector('.papers-tab');
                  const reveals = list.querySelector('.papers-reveal');
                  if (papersTab && !papersTab.dataset.bound) {
                    papersTab.dataset.bound = '1';
                    papersTab.onclick = () => {
                      const isShown = reveals && reveals.classList.contains('show');
                      if (reveals) {
                        if (isShown) reveals.classList.remove('show');
                        else reveals.classList.add('show');
                      }
                    };
                  }
                }
              // Immediately after desc+highlights, reveal slide-specific UIs
              entryTL.call(() => {
                if (nextIndex === 2) { setShowProjects(true); setProjectsActive(true); }
                if (nextIndex === 3) { setShowGallery(true); setGalleryActive(true); }
                if (nextIndex === 1) { setShowTimeline(true); setTimelineExiting(false); }
              });
              }, null, ">-=0.02");
            }
          }

          // Animate tag lines
          if (newTagLines && newTagLines.length > 0) {
            const validTagLines = Array.from(newTagLines).filter(el => el && el.nodeType === 1);
            if (validTagLines.length > 0) {
              entryTL.to(validTagLines, {
                y: "0%",
                opacity: 1,
                duration: 0.75,
                ease: "power2.out",
                stagger: { amount: 0.2 },
                filter: 'blur(0px)',
              }, "-=0.4");
            }
          }

          // spotify animates as part of tag lines (no special casing)



          // Animate counter
          if (newCounterLines && newCounterLines.length > 0) {
            entryTL.to(newCounterLines, {
              y: "0%",
                opacity: 1,
              duration: 0.7,
                ease: "power2.out",
              stagger: { amount: 0.18 },
              filter: 'blur(0px)',
            }, "<");
          }

          // Animate From/To, only on About slide
          if (nextIndex === 0 && newFromToRows.length > 0) {
            if (newFromTo) {
              entryTL.to(newFromTo, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.9);
              entryTL.call(() => newFromTo.style.setProperty('--lineScale', '1'), null, 0.95);
            }
            entryTL.to(newFromToRows, {
              opacity: 1,
              duration: 0.5,
              stagger: 0.08,
                ease: "power2.out",
            }, 0.9);
          }

          // Animate profile stats container with full name
          if (profileStatsContainer) {
            // Animate profile picture
            const profileImg = profileStatsContainer.querySelector(".profile-img");
            if (profileImg) {
              entryTL.to(profileImg, {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.6,
                ease: "power2.out",
              }, 0.4);
            }
            
            // Animate full name characters
            const fullNameChars = profileStatsContainer.querySelectorAll(".full-name .char span");
            if (fullNameChars && fullNameChars.length > 0) {
              entryTL.to(fullNameChars, {
                y: "0%",
                duration: 0.8,
                stagger: 0.025,
                ease: "power3.out",
              }, 0.5);
            }
          }

          // After title/description, reveal Projects and Gallery when on their slides
          // and reveal Experience timeline similarly for consistent timing
          if (nextIndex === 2) { entryTL.call(() => { setShowProjects(true); setProjectsActive(true); }); }
          if (nextIndex === 3) { entryTL.call(() => { setShowGallery(true); setGalleryActive(true); }); }
          if (nextIndex === 1) { entryTL.call(() => { setShowTimeline(true); setTimelineExiting(false); }); }

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
              gsap.set(title, { opacity: 0, y: 15, filter: 'blur(6px)' });
            });

            // Set initial state for tech items
            const techItems = techStack.querySelectorAll(".tech-item");
            if (techItems.length > 0) {
              gsap.set(techItems, {
                opacity: 0,
                scale: 0.8,
                y: 10,
                rotationX: 15,
                filter: 'blur(6px)'
              });
            }

            // Animate tech stack container
            entryTL.to(techStack, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
            }, 0.7);

            // Animate category titles with growing lines first
            categoryTitles.forEach((title, index) => {
              entryTL.to(title, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => {
                  // Add class to trigger growing line animation
                  title.classList.add('animate-line');
                  title.classList.add('visible');
                }
              }, 1.0 + (index * 0.15));
            });

            // Animate tech items after lines are fully extended
            if (techItems.length > 0) {
              entryTL.to(techItems, {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationX: 0,
                filter: 'blur(0px)',
                duration: 0.5,
                stagger: 0.03,
                ease: "back.out(1.5)",
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
              }, 1.6); // Reduced delay - wait less for category titles
            }
          }
        }, 40);
      }
    });

    // Page transition overlay (transparent)
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }
    gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });
    // Remove dark flash: keep overlay transparent (no fade in)

    // Ensure description lines exist to fade out cleanly
    const currentDescPForSplit = currentContent.querySelector('.slide-description p');
    const hasLines = currentContent.querySelectorAll('.slide-description .line').length > 0;
    if (currentDescPForSplit && !hasLines) {
      try { createLineElements(currentDescPForSplit); } catch {}
    }
    // Animate counter exit
    const currentCounterLines = currentContent.querySelectorAll(".slide-index-wrapper .line");
    if (currentCounterLines && currentCounterLines.length > 0) {
      exitTL.to(currentCounterLines, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.35,
        stagger: { amount: 0.18 },
        ease: "power2.inOut",
      }, 0);
    }

    // Animate title characters exit
    const currentTitleWords = currentContent.querySelectorAll(".slide-title .word");
    if (currentTitleWords.length > 0) {
      exitTL.to(currentTitleWords, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.7,
        stagger: { amount: 0.28 },
        ease: "power2.inOut",
      }, 0.1);
    }

    // Animate full name words exit (left-to-right)
    const currentFullNameWords = currentContent.querySelectorAll(".full-name .word");
    if (currentFullNameWords.length > 0) {
      exitTL.to(currentFullNameWords, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.5,
        stagger: { amount: 0.24, from: 0 },
        ease: "power2.inOut",
      }, 0.1);
    }


    // Animate description lines exit
    const currentDescLines = currentContent.querySelectorAll(".slide-description .line");
    if (currentDescLines.length > 0) {
      exitTL.to(currentDescLines, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.85,
        stagger: { amount: 0.36 },
        ease: "power2.inOut",
      }, 0.1);
    }

    // Animate tags exit
    const currentTagLines = currentContent.querySelectorAll(".slide-tags .line");
    if (currentTagLines.length > 0) {
      exitTL.to(currentTagLines, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.85,
        stagger: { amount: 0.36 },
        ease: "power2.inOut",
      }, 0.1);
    }

    // Animate Cool Readings out like text
    const currentPapersTab = currentContent.querySelector('.papers-list .papers-tab');
    if (currentPapersTab) {
      exitTL.to(currentPapersTab, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.5,
        ease: 'power2.inOut'
      }, 0.12);
    }
    const currentPaperLinks = currentContent.querySelectorAll('.papers-reveal a');
    if (currentPaperLinks && currentPaperLinks.length > 0) {
      exitTL.to(currentPaperLinks, {
        y: "-100%",
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.inOut'
      }, 0.12);
    }
    exitTL.call(() => { const l = currentContent.querySelector('.papers-list'); if (l) l.classList.remove('papers-in'); }, null, 0.1);



    // Animate profile picture and statistics exit
    const currentProfileStatsContainer = currentContent.querySelector(".profile-stats-container");
    if (currentProfileStatsContainer) {
      const currentProfileImg = currentProfileStatsContainer.querySelector(".profile-img");
      const currentStatLabels = currentProfileStatsContainer.querySelectorAll(".stat-label");
      const currentStatValues = currentProfileStatsContainer.querySelectorAll(".stat-value");
      
      // Animate profile picture exit
      if (currentProfileImg) {
        exitTL.to(currentProfileImg, {
          opacity: 0,
          filter: 'blur(6px)',
          duration: 0.5,
          ease: "power2.inOut",
        }, 0.1);
      }
      
      // Animate statistics exit
      if (currentStatLabels.length > 0) {
        exitTL.to(currentStatLabels, {
          y: "-100%",
          filter: 'blur(4px)',
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.inOut",
        }, 0.1);
      }
      
      if (currentStatValues.length > 0) {
        exitTL.to(currentStatValues, {
          y: "-100%",
          filter: 'blur(4px)',
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.inOut",
        }, 0.1);
      }
    }
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
    
    // Defer content fade until after initial states are set to avoid pop-in

    // Select split elements produced earlier in processTextElements
    const titleWords = content.querySelectorAll(".slide-title .word");
    const descLines = content.querySelectorAll(".slide-description .line");
    const tagLines = content.querySelectorAll(".slide-tags .line");
    const counterLines = content.querySelectorAll(".slide-index-wrapper .line");
    const fullNameWords = content.querySelectorAll(".full-name .word");
    const fromToRows = content.querySelectorAll(".fromto .ft-row");
    const fromTo = content.querySelector('.fromto');

  // Set initial state with blur but hidden to avoid pre-appearance glow
  const fullNameWordsFiltered = Array.from(fullNameWords).filter(el => el && el.nodeType === 1);
  gsap.set([...titleWords, ...descLines, ...tagLines, ...counterLines, ...fullNameWordsFiltered], { y: "100%", filter: 'blur(6px)', opacity: 0 });
    if (fromToRows.length > 0) {
      gsap.set(fromToRows, { opacity: 0 });
      if (fromTo) {
        gsap.set(fromTo, { opacity: 0 });
        fromTo.style.setProperty('--lineScale', '0');
      }
    }

    // Animate title words and fade in content container to avoid abrupt pop
    if (titleWords.length > 0) {
      // slightly longer pre-delay and fade for smoother entry
      gsap.to(content, { opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.3 });
      gsap.to(titleWords, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: "power2.out", stagger: 0.08, delay: 0.9 });
      // reveal underline after text comes in (only for opted-in titles)
      const h1 = content.querySelector('.slide-title h1.underline');
      if (h1) setTimeout(() => h1.classList.add('title-show'), 900);
    }

    // Animate description lines using the same timeline approach as slide transitions
    if (descLines.length > 0) {
      // Insert highlights and build papers first, then re-split lines to ensure consistent markup
      addPrincetonHighlight(content);
      // Recreate line splits on the paragraph after innerHTML changes
      const descP = content.querySelector('.slide-description p');
      if (descP) {
        // Clear previous line wrappers if any
        descP.querySelectorAll('.line').forEach(l => l.replaceWith(...l.childNodes));
        createLineElements(descP);
      }
      const updated = content.querySelectorAll('.slide-description .line');
      gsap.set(updated, { y: '100%', opacity: 0, filter: 'blur(6px)' });
      const tl = gsap.timeline();
      tl.to(updated, { y: '0%', opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out', stagger: 0.08, delay: 0.7 });
      // After description fully reveals, trigger ALL highlights simultaneously
      tl.call(() => {
        const allHl = content.querySelectorAll('.hl-orange, .hl-soft-pink, .hl-soft-blue, .hl-soft-cream, .hl-soft-sage');
        allHl.forEach(s => s.classList.add('hl-show'));
      });
      // Dropdown wiring for cool readings
      const list = content.querySelector('.papers-list');
      if (list) {
        // blur-in shortly after highlights
        tl.call(() => list.classList.add('papers-in'), null, '+=0.1');
        const key = list.querySelector('.papers-key');
        if (key && !key.dataset.bound) {
          key.dataset.bound = '1';
          key.addEventListener('click', () => list.classList.toggle('open'));
        }
      }
    }

    // Remove micro-meta on initial slide to keep hero spacing consistent
    const existingMeta = content.querySelector('.micro-meta');
    if (existingMeta) existingMeta.remove();

    // Animate tag lines
    if (tagLines.length > 0) {
      gsap.to(tagLines, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: "power2.out", stagger: 0.08, delay: 1.1 });
    }

    // spotify animates via tagLines

    // Animate counter lines
    if (counterLines.length > 0) {
      gsap.to(counterLines, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: "power2.out", stagger: 0.08, delay: 1.2 });
    }

    // Animate full name words
    if (fullNameWordsFiltered.length > 0) {
      const nameTL = gsap.timeline({ delay: 1.05 });
      nameTL.to(fullNameWordsFiltered, { y: "0%", opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: "power3.out", stagger: 0.06 });
    }

    // Animate From/To rows after tags
    if (fromToRows.length > 0) {
      if (fromTo) {
        gsap.to(fromTo, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.9 });
        setTimeout(() => fromTo.style.setProperty('--lineScale', '1'), 950);
      }
      gsap.to(fromToRows, { opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.9 });
    }

    // Animate profile picture and full name container on initial load
    const profileStatsContainer = content.querySelector(".profile-stats-container");
    if (profileStatsContainer) {
      // Initial state
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
          duration: 0.6,
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

      // Animate tech stack container
      gsap.to(techStack, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        delay: 0.7,
      });

      // Animate category titles with growing lines first
      const categoryTitles = techStack.querySelectorAll(".tech-category-title");
      categoryTitles.forEach((title, index) => {
        gsap.set(title, { opacity: 0, y: 15 });
        
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 1.0 + (index * 0.15),
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
          duration: 0.5,
          stagger: 0.03,
          ease: "back.out(1.5)",
          delay: 1.6, // Reduced delay - wait less for category titles
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
    
    // Handle gallery visibility (defer reveal to entry timeline)
    if (nextIndex === 3) {
      setShowGallery(false);
      setGalleryActive(false);
    } else if (previousIndex === 3) {
      // If leaving photography slide, animate out smoothly
      setShowGallery(false);
      setGalleryActive(false);
    } else {
      setShowGallery(false);
      setGalleryActive(false);
    }

    // Handle timeline animation (defer reveal to entry timeline for uniformity)
    if (nextIndex === 1) {
      setShowTimeline(false);
        setTimelineExiting(false);
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

    // Handle projects visibility (defer reveal to entry timeline)
    if (nextIndex === 2) {
      setShowProjects(false);
      setProjectsActive(false);
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
      addPrincetonHighlight(initialContent);
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
      setTimeout(() => {
        // Only update Spotify here; highlight timing is controlled via GSAP timeline
    updateSpotifyInfo(initialContent);
      }, 1100);
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

      // Experience list no longer scroll-captured; remove special-case

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