"use client";
import { useRef, useState, useEffect } from "react";
import ReactLenis from "@studio-freight/react-lenis";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import SpotifyPlayer from "./components/SpotifyPlayer";
import CurrentlyPlaying from "./components/CurrentlyPlaying";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const container = useRef();
  const vinylRef = useRef();
  const [activeTrack, setActiveTrack] = useState(null);
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const tracks = [
    { id: 1, title: "About Me", section: "about" },
    { id: 2, title: "Projects", section: "projects" },
    { id: 3, title: "Experience", section: "timeline" },
    { id: 4, title: "Photography", section: "photography" }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useGSAP(
    () => {
      if (!isClient) return;

      // Animate vinyl record entrance
      gsap.set(vinylRef.current, {
        scale: 0,
        rotation: -90,
        opacity: 0
      });

      gsap.to(vinylRef.current, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 2,
        ease: "back.out(1.7)",
        delay: 0.5
      });

      // Animate track list
      gsap.set(".track-item", {
        x: 100,
        opacity: 0
      });

      gsap.to(".track-item", {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 1.5
      });

      // Animate title
      const heroText = new SplitType(".vinyl-title", { types: "chars" });
      gsap.set(heroText.chars, { y: 100, opacity: 0 });

      gsap.to(heroText.chars, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power4.out",
        delay: 1
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
        y: 50,
        opacity: 0
      });

      gsap.to(".bio-text", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 2
      });

      // Section animations on scroll
      gsap.utils.toArray(".content-section").forEach((section) => {
        const heading = section.querySelector("h2");
        const content = section.querySelectorAll(".about-text p, .project-item, .timeline-item, .photo-item");

        gsap.set(heading, { y: 100, opacity: 0 });
        gsap.to(heading, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });

        gsap.set(content, { y: 80, opacity: 0 });
        gsap.to(content, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        });
      });

      // Parallax effect for vinyl record
      gsap.to(".vinyl-record", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".vinyl-container",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

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
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleTrackHover = (trackId) => {
    if (!isClient) return;
    setActiveTrack(trackId);
    gsap.to(`.track-${trackId}`, {
      scale: 1.05,
      x: 10,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleTrackLeave = (trackId) => {
    if (!isClient) return;
    setActiveTrack(null);
    gsap.to(`.track-${trackId}`, {
      scale: 1,
      x: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const vinylImage = currentSpotifyTrack?.image || "/portrait.jpeg";
  const vinylAlt = currentSpotifyTrack ? currentSpotifyTrack.album : "Caleb";

  return (
    <ReactLenis root>
      <div className="vinyl-homepage" ref={container}>
        <div className="vinyl-container">
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
                  className={`track-item track-${track.id}`}
                  onMouseEnter={() => handleTrackHover(track.id)}
                  onMouseLeave={() => handleTrackLeave(track.id)}
                  onClick={() => handleTrackClick(track.section)}
                >
                  <span className="track-number">0{track.id}</span>
                  <span className="track-title">{track.title}</span>
                  <span className="track-duration">∞</span>
                </div>
              ))}
            </div>
            
            <div className="bio-section">
              <p className="bio-text">
                I'm a creative professional who captures striking and artistic 
                images. My work focuses on light, shadow, and movement, creating 
                pieces that feel both modern and timeless. With a minimal and 
                moody style, I bring out raw emotion and unique beauty in every project.
              </p>
            </div>
          </div>
        </div>

        <section id="about" className="content-section about-section">
          <div className="section-container">
            <h2>About Me</h2>
            <div className="about-content">
              <div className="about-text">
                <p>
                  I'm a passionate creative professional with expertise in photography, 
                  design, and development. My work spans across various disciplines, 
                  always focusing on creating meaningful and impactful experiences.
                </p>
                <p>
                  With an eye for detail and a love for storytelling, I strive to 
                  capture moments and create digital experiences that resonate with people.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="content-section projects-section">
          <div className="section-container">
            <h2>Projects</h2>
            <div className="projects-grid">
              <div className="project-item">
                <img src="/img1.jpeg" alt="Project 1" />
                <div className="project-info">
                  <h3>Project Alpha</h3>
                  <p>A creative endeavor focusing on visual storytelling.</p>
                </div>
              </div>
              <div className="project-item">
                <img src="/img2.jpeg" alt="Project 2" />
                <div className="project-info">
                  <h3>Project Beta</h3>
                  <p>Exploring the intersection of art and technology.</p>
                </div>
              </div>
              <div className="project-item">
                <img src="/img3.jpeg" alt="Project 3" />
                <div className="project-info">
                  <h3>Project Gamma</h3>
                  <p>A journey through light and shadow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="timeline" className="content-section timeline-section">
          <div className="section-container">
            <h2>Experience Timeline</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">2023 - Present</div>
                <div className="timeline-content">
                  <h3>Senior Creative Director</h3>
                  <p>Leading creative initiatives and managing cross-functional teams.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2021 - 2023</div>
                <div className="timeline-content">
                  <h3>Creative Specialist</h3>
                  <p>Developing innovative solutions for complex creative challenges.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2019 - 2021</div>
                <div className="timeline-content">
                  <h3>Junior Designer</h3>
                  <p>Building foundational skills in design and visual communication.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="photography" className="content-section photography-section">
          <div className="section-container">
            <h2>Photography</h2>
            <div className="photo-gallery">
              <div className="photo-item">
                <img src="/img1.jpeg" alt="Photography 1" />
              </div>
              <div className="photo-item">
                <img src="/img2.jpeg" alt="Photography 2" />
              </div>
              <div className="photo-item">
                <img src="/img3.jpeg" alt="Photography 3" />
              </div>
              <div className="photo-item">
                <img src="/img4.jpeg" alt="Photography 4" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </ReactLenis>
  );
}
