"use client";
import { useRef, useState, useEffect } from "react";
import ReactLenis from "@studio-freight/react-lenis";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import SplitType from "split-type";
import SpotifyPlayer from "./components/SpotifyPlayer";
import CurrentlyPlaying from "./components/CurrentlyPlaying";
import ScrollProgress from "./components/ScrollProgress";
import RightNavigation from "./components/SectionTransitions";
import PhotoCarousel from "./components/PhotoCarousel";
import { photos } from "./data/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export default function Home() {
  const container = useRef();
  const vinylRef = useRef();
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const tracks = [
    { id: 1, title: "About Me", section: "about" },
    { id: 2, title: "Projects", section: "projects" },
    { id: 3, title: "Experience", section: "timeline" },
    { id: 4, title: "Photography", section: "photography" }
  ];

  const sections = [
    { id: "home", title: "Home" },
    { id: "about", title: "About Me" },
    { id: "projects", title: "Projects" },
    { id: "timeline", title: "Experience" },
    { id: "photography", title: "Photography" }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useGSAP(
    () => {
      if (!isClient) return;

      // Smooth vinyl record entrance
      gsap.set(vinylRef.current, {
        scale: 0.8,
        y: 30,
        opacity: 0
      });

      gsap.to(vinylRef.current, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.3
      });

      // Animate track list
      gsap.set(".track-item", {
        x: 50,
        opacity: 0
      });

      gsap.to(".track-item", {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
        delay: 1
      });

      // Animate title
      const heroText = new SplitType(".vinyl-title", { types: "chars" });
      gsap.set(heroText.chars, { y: 50, opacity: 0 });

      gsap.to(heroText.chars, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.03,
        ease: "power2.out",
        delay: 0.8
      });

      // Continuous vinyl rotation
      const rotationSpeed = currentSpotifyTrack?.isPlaying ? 10 : 20;
      gsap.to(".vinyl-record", {
        rotation: 360,
        duration: rotationSpeed,
        ease: "none",
        repeat: -1
      });

      // Animate bio text
      gsap.set(".bio-text", {
        y: 30,
        opacity: 0
      });

      gsap.to(".bio-text", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 1.5
      });

      // Smooth Spotify/music section entrance
      gsap.set(".vinyl-music-section", {
        y: 20,
        opacity: 0
      });

      gsap.to(".vinyl-music-section", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 1.2
      });

      // Enhanced parallax effect for vinyl record
      gsap.to(".vinyl-record", {
        yPercent: -30,
        rotation: "+=180",
        ease: "none",
        scrollTrigger: {
          trigger: ".vinyl-container",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      // Subtle floating animation for vinyl when not scrolling
      gsap.to(".vinyl-record", {
        y: "+=5",
        duration: 4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Section animations
      const sections = [
        { id: "about", elements: ".about-text p" },
        { id: "projects", elements: ".project-item" },
        { id: "timeline", elements: ".timeline-item" },
        { id: "photography", elements: ".photography-metadata .gear-item" }
      ];

      // Set initial states for section headers
      gsap.set(".content-section h2", {
        y: 0,
        opacity: 1
      });

      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: `#${section.id}`,
          start: "top 70%",
          end: "bottom 30%",
          onEnter: () => {
            if (section.id === "timeline") {
              // Timeline specific animations
              const timelineItems = gsap.utils.toArray(".timeline-item");
              
              // Animate the central line drawing in
              gsap.set(".timeline::before", {
                scaleY: 0,
                transformOrigin: "top center"
              });
              
              gsap.to(".timeline::before", {
                scaleY: 1,
                duration: 1.5,
                ease: "power2.out",
                delay: 0.3
              });
              
              timelineItems.forEach((item, index) => {
                const dot = item.querySelector(".timeline-dot");
                const date = item.querySelector(".timeline-date");
                const info = item.querySelector(".timeline-info");
                const color = item.getAttribute("data-color");
                
                // Set initial states
                gsap.set([dot, date, info], {
                  opacity: 0
                });
                
                gsap.set(dot, { scale: 0 });
                gsap.set(date, { y: -30, scale: 0.8 });
                gsap.set(info, { 
                  x: index % 2 === 0 ? -50 : 50,
                  y: 20 
                });
                
                // Animate timeline item entrance
                const tl = gsap.timeline({
                  delay: 0.8 + (index * 0.3)
                });
                
                tl.to(dot, {
                  opacity: 1,
                  scale: 1,
                  duration: 0.4,
                  ease: "back.out(2)"
                })
                .to(date, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: "back.out(1.4)"
                }, "-=0.3")
                .to(info, {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out"
                }, "-=0.4");
                
                // Add pulse animation
                gsap.to(dot, {
                  boxShadow: `0 0 15px ${color}60`,
                  duration: 2.5,
                  repeat: -1,
                  yoyo: true,
                  ease: "power2.inOut",
                  delay: index * 0.4 + 2
                });
                
                // Hover animations
                const addHoverEffects = () => {
                  item.addEventListener('mouseenter', () => {
                    gsap.to(dot, {
                      scale: 1.3,
                      boxShadow: `0 0 25px ${color}80`,
                      duration: 0.3,
                      ease: "power2.out"
                    });
                  });
                  
                  item.addEventListener('mouseleave', () => {
                    gsap.to(dot, {
                      scale: 1,
                      boxShadow: `0 0 15px ${color}60`,
                      duration: 0.3,
                      ease: "power2.out"
                    });
                  });
                };
                
                addHoverEffects();
              });
            } else {
              // Other sections
              gsap.to(section.elements, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
                delay: 0.3
              });
            }
          }
        });
      });

      // Fallback: Ensure timeline is visible after page load
      setTimeout(() => {
        const timelineSection = document.getElementById("timeline");
        if (timelineSection) {
          const rect = timelineSection.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInView) {
            // Animate the central line if not already animated
            if (gsap.getProperty(".timeline::before", "scaleY") === 0) {
              gsap.to(".timeline::before", {
                scaleY: 1,
                duration: 1.5,
                ease: "power2.out"
              });
            }
            
            // Animate timeline items if not already animated
            const timelineItems = gsap.utils.toArray(".timeline-item");
            timelineItems.forEach((item, index) => {
              const dot = item.querySelector(".timeline-dot");
              const color = item.getAttribute("data-color");
              
              if (gsap.getProperty(dot, "opacity") === 0) {
                gsap.to(dot, {
                  opacity: 1,
                  scale: 1,
                  delay: index * 0.2,
                  duration: 0.4,
                  ease: "back.out(2)"
                });
                
                gsap.to(dot, {
                  boxShadow: `0 0 15px ${color}60`,
                  duration: 2.5,
                  repeat: -1,
                  yoyo: true,
                  ease: "power2.inOut",
                  delay: index * 0.4 + 1
                });
              }
            });
          }
        }
      }, 500);

    },
    { scope: container, dependencies: [currentSpotifyTrack, isClient] }
  );

  const handleSpotifyTrackChange = (track) => {
    setCurrentSpotifyTrack(track);
    
    if (track?.image && isClient) {
      gsap.to(".vinyl-image", {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(".vinyl-image", {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    }
  };

  const handleTrackClick = (sectionId) => {
    if (!isClient) return;
    const element = document.getElementById(sectionId);
    if (element) {
      gsap.to(window, {
        scrollTo: { 
          y: element, 
          offsetY: 0 
        },
        duration: 1.5,
        ease: "power2.inOut",
      });
    }
  };

  const handleTrackHover = (trackId, event) => {
    if (!isClient) return;
    event.stopPropagation();
    
    const trackElement = event.currentTarget;
    if (!trackElement) return;
    
    // Kill any existing animations
    gsap.killTweensOf(trackElement);
    
    gsap.to(trackElement, {
      scale: 1.02,
      x: 12,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleTrackLeave = (trackId, event) => {
    if (!isClient) return;
    event.stopPropagation();
    
    const trackElement = event.currentTarget;
    if (!trackElement) return;
    
    // Kill any existing animations
    gsap.killTweensOf(trackElement);
    
    gsap.to(trackElement, {
      scale: 1,
      x: 0,
      backgroundColor: "transparent",
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const vinylImage = currentSpotifyTrack?.image || "/portrait.jpeg";
  const vinylAlt = currentSpotifyTrack ? currentSpotifyTrack.album : "Caleb";

  return (
    <ReactLenis root>
      <div className="vinyl-homepage" ref={container}>
        <ScrollProgress />
        <RightNavigation sections={sections} />
        
        <section id="home" className="vinyl-container">
          <div className="section-bg"></div>
          <div className="vinyl-side" ref={vinylRef}>
            <div className="vinyl-record">
              <img src={vinylImage} alt={vinylAlt} className="vinyl-image" />
              <div className="vinyl-center">
                <div className="vinyl-label">
                  <span className="artist-name">CALEB</span>
                  <span className="album-title">PORTFOLIO</span>
                </div>
              </div>
              <div className="vinyl-grooves"></div>
            </div>
            
            <div className="vinyl-music-section">
              <CurrentlyPlaying track={currentSpotifyTrack} />
              
              <div className="spotify-widget compact">
                <SpotifyPlayer onTrackChange={handleSpotifyTrackChange} />
              </div>
            </div>
          </div>

          <div className="tracks-side">
            <h1 className="vinyl-title">Personal Portfolio</h1>
            <div className="track-list">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="track-item animate-in"
                  data-track={track.id}
                  onMouseEnter={(event) => handleTrackHover(track.id, event)}
                  onMouseLeave={(event) => handleTrackLeave(track.id, event)}
                  onClick={() => handleTrackClick(track.section)}
                >
                  <span className="track-number">0{track.id}</span>
                  <span className="track-title">{track.title}</span>
                  <span className="track-duration">∞</span>
                </div>
              ))}
            </div>
            
            <div className="bio-section">
              <p className="bio-text animate-in">
                blah
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="content-section about-section">
          <div className="section-bg"></div>
          <div className="section-container">
            <h2 className="animate-in">About Me</h2>
            <div className="about-content">
              <div className="about-text">
                <p className="animate-in">
                  blah blah blah
                </p>
                <p className="animate-in">
                  test
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="content-section projects-section">
          <div className="section-bg"></div>
          <div className="section-container">
            <h2 className="animate-in">Projects</h2>
            <div className="projects-grid">
              <div className="project-item animate-in">
                <img src="/img1.jpeg" alt="Project 1" />
                <div className="project-info">
                  <h3>blah</h3>
                  <p>blah blah blah</p>
                </div>
              </div>
              <div className="project-item animate-in">
                <img src="/img2.jpeg" alt="Project 2" />
                <div className="project-info">
                  <h3>blah</h3>
                  <p>blah blah blah</p>
                </div>
              </div>
              <div className="project-item animate-in">
                <img src="/img3.jpeg" alt="Project 3" />
                <div className="project-info">
                  <h3>dn</h3>
                  <p>blah blah</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="timeline" className="content-section timeline-section">
          <div className="section-bg"></div>
          <div className="section-container">
            <h2 className="animate-in">Experience Timeline</h2>
            <div className="timeline">
              <div className="timeline-item" data-color="#ff6b6b">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2023 - Present</div>
                <div className="timeline-info">
                  <h3>Senior Software Engineer</h3>
                  <p>Leading development of cutting-edge web applications with modern frameworks and cloud technologies</p>
                </div>
              </div>
              <div className="timeline-item" data-color="#4ecdc4">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2021 - 2023</div>
                <div className="timeline-info">
                  <h3>Full Stack Developer</h3>
                  <p>Built scalable web solutions and collaborated with cross-functional teams to deliver high-quality products</p>
                </div>
              </div>
              <div className="timeline-item" data-color="#45b7d1">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2019 - 2021</div>
                <div className="timeline-info">
                  <h3>Frontend Developer</h3>
                  <p>Specialized in creating responsive user interfaces and optimizing user experience across web platforms</p>
                </div>
              </div>
              <div className="timeline-item" data-color="#96ceb4">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2017 - 2019</div>
                <div className="timeline-info">
                  <h3>Junior Developer</h3>
                  <p>Started my journey in web development, learning modern technologies and best practices</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="photography" className="content-section photography-section">
          <div className="section-bg"></div>
          <div className="section-container">
            <h2 className="animate-in">Photography</h2>
            
            <div className="photography-metadata">
              <div className="photo-gear">
                <div className="gear-item animate-in">
                  <span className="gear-label">Camera</span>
                  <span className="gear-value">Fujifilm XT-30</span>
                </div>
                <div className="gear-item animate-in">
                  <span className="gear-label">Lenses</span>
                  <span className="gear-value">Fujinon XF 27mm F2.8</span>
                </div>
                <div className="gear-item animate-in">
                  <span className="gear-label"></span>
                  <span className="gear-value">Fujifilm XF 18-55mm f/2.8-4 R LM OIS</span>
                </div>
              </div>
            </div>
            
            <PhotoCarousel photos={photos} />
          </div>
        </section>
      </div>
    </ReactLenis>
  );
}
