"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const ArchivePage = () => {
  const titleRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);

  const experiences = [
    {
      year: "2024",
      period: "Present",
      title: "Senior Software Engineer",
      company: "Tech Innovation Labs",
      location: "San Francisco, CA",
      description: "Leading development of cutting-edge web applications with modern frameworks. Mentoring junior developers and architecting scalable solutions.",
      skills: ["React", "Node.js", "AWS", "TypeScript"]
    },
    {
      year: "2021",
      period: "2024",
      title: "Full Stack Developer", 
      company: "Digital Solutions Inc",
      location: "Remote",
      description: "Built scalable web solutions and collaborated with cross-functional teams to deliver high-quality products for Fortune 500 clients.",
      skills: ["Vue.js", "Python", "Docker", "PostgreSQL"]
    },
    {
      year: "2019",
      period: "2021",
      title: "Frontend Developer",
      company: "Creative Web Studio", 
      location: "New York, NY",
      description: "Specialized in creating responsive user interfaces and optimizing user experience across web platforms.",
      skills: ["JavaScript", "SCSS", "Webpack", "Figma"]
    },
    {
      year: "2017",
      period: "2019", 
      title: "Computer Science Degree",
      company: "University of California",
      location: "Berkeley, CA",
      description: "Bachelor of Science in Computer Science with focus on software engineering and human-computer interaction.",
      skills: ["Algorithms", "Data Structures", "Research"]
    },
    {
      year: "2016",
      period: "2017",
      title: "Web Development Intern",
      company: "StartUp Ventures",
      location: "Palo Alto, CA", 
      description: "Started my journey in web development, learning modern technologies and contributing to startup products.",
      skills: ["HTML", "CSS", "jQuery", "PHP"]
    }
  ];

  return (
    <div className="page-container">
      <motion.h1 
        ref={titleRef}
        className="title"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Archive
      </motion.h1>

      <div className="intro-section">
        <p className="intro">
          A collection of experiences that have shaped my journey in technology.
        </p>
      </div>

      <div className="experiences-grid">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            className="experience-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="card-timeline">
              <span className="year">{exp.year}</span>
              <div className="timeline-connector"></div>
              <span className="period">{exp.period}</span>
            </div>
            
            <div className="card-content">
              <h3 className="position">{exp.title}</h3>
              <div className="company-info">
                <span className="company">{exp.company}</span>
                <span className="location">{exp.location}</span>
              </div>
              <p className="description">{exp.description}</p>
              
              <div className="skills-section">
                {exp.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .page-container {
          padding: 3rem 2rem;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        .intro-section {
          margin-bottom: 3rem;
          text-align: center;
        }

        .intro {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .experiences-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr;
        }

        .experience-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(184, 197, 209, 0.1);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .experience-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--archive-accent), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .experience-card:hover {
          transform: translateY(-8px);
          border-color: rgba(184, 197, 209, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .experience-card:hover::before {
          opacity: 1;
        }

        .card-timeline {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .year {
          color: var(--archive-accent);
          background: rgba(184, 197, 209, 0.1);
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(184, 197, 209, 0.2);
        }

        .timeline-connector {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--archive-accent), transparent);
          opacity: 0.3;
        }

        .period {
          color: var(--text-muted);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .position {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin: 0;
          line-height: 1.3;
        }

        .company-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .company {
          font-size: 1.1rem;
          color: var(--text-color);
          font-weight: 600;
        }

        .location {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .description {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
        }

        .skills-section {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 0.5rem;
        }

        .skill-badge {
          background: rgba(184, 197, 209, 0.08);
          color: var(--archive-accent);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(184, 197, 209, 0.15);
          transition: all 0.3s ease;
        }

        .skill-badge:hover {
          background: rgba(184, 197, 209, 0.15);
          transform: translateY(-1px);
        }

        @media (min-width: 768px) {
          .experiences-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 2rem 1rem;
          }

          .experience-card {
            padding: 1.5rem;
          }

          .position {
            font-size: 1.3rem;
          }

          .card-timeline {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .timeline-connector {
            display: none;
          }

          .description {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .experience-card {
            padding: 1.25rem;
          }

          .position {
            font-size: 1.2rem;
          }

          .skills-section {
            gap: 0.375rem;
          }

          .skill-badge {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ArchivePage; 