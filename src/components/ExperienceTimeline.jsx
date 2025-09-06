"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const ExperienceTimeline = ({ isExiting = false }) => {
  const timelineRef = useRef(null);
  const animationRef = useRef(null);

  const experiences = [
    {
      company: "Princeton IPA Lab",
      position: "AI Researcher",
      duration: "Dec 2024 - Present",
      location: "Princeton, NJ",
      description: "Investigating hallucinations in large language models and video language models."
    },
    {
      company: "Remora Capital",
      position: "Quantitative Developer", 
      duration: "May 2025 - Present",
      location: "Remote",
      description: "Working on quant firm startup."
    },
    {
      company: "MyChance",
      position: "Founding Engineer", 
      duration: "May 2025 - Present",
      location: "Remote",
      description: "Building centralized AI college counselor."
    },
    {
      company: "Princeton Computing Imaging Lab", 
      position: "ML/CV Researcher",
      duration: "Sep 2025",
      location: "Princeton, NJ",
      description: "Computer vision research under Prof. Felix Heide."
    }
  ];

  useEffect(() => {
    if (!timelineRef.current) return;

    // Animate timeline items with simple GSAP animations
    const timelineItems = timelineRef.current.querySelectorAll('.timeline-item');
    
    const tl = gsap.timeline();
    
    timelineItems.forEach((item, index) => {
      const company = item.querySelector('.company');
      const position = item.querySelector('.position');
      const duration = item.querySelector('.duration');
      const location = item.querySelector('.location');
      const description = item.querySelector('.description');

      if (company && position && duration && location && description) {
        // Set initial state for all text elements
        gsap.set([company, position, duration, location, description], {
          opacity: 0,
          y: 30,
          scale: 0.95
        });

        // Animate each text element in sequence with different effects
        tl.to(company, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }, index * 0.4)
        .to(position, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }, index * 0.4 + 0.2)
        .to(duration, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }, index * 0.4 + 0.4)
        .to(location, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }, index * 0.4 + 0.6)
        .to(description, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out"
        }, index * 0.4 + 0.8);
      }
    });

    animationRef.current = tl;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <div className={`experience-timeline ${isExiting ? 'timeline-exit' : ''}`} ref={timelineRef}>
      <div className="timeline-line"></div>
      {experiences.map((exp, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <h3 className="company">{exp.company}</h3>
            <p className="position">{exp.position}</p>
            <p className="duration">{exp.duration}</p>
            <p className="location">{exp.location}</p>
            <p className="description">{exp.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline; 