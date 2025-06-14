"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const ProjectsPage = () => {
  const titleRef = useRef();

  useEffect(() => {
    // Animate title on mount
    if (!titleRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    // Cleanup function
    return () => {
      tl.kill();
    };
  }, []);

  const projects = [
    {
      id: 1,
      title: "Digital Experience Platform",
      description: "A comprehensive web application built with Next.js and modern animation libraries",
      image: "/img1.jpeg",
      technologies: ["Next.js", "GSAP", "Three.js"],
      year: "2024"
    },
    {
      id: 2,
      title: "Interactive Portfolio",
      description: "Creative portfolio showcasing photography and development work",
      image: "/img2.jpeg", 
      technologies: ["React", "Framer Motion", "WebGL"],
      year: "2023"
    },
    {
      id: 3,
      title: "E-commerce Platform",
      description: "Modern e-commerce solution with advanced user experience",
      image: "/img3.jpeg",
      technologies: ["TypeScript", "Node.js", "PostgreSQL"],
      year: "2023"
    }
  ];

  return (
    <div className="projects-page">
      {/* Content */}
      <div className="page-content">
        <h1 className="page-title projects-title">Projects</h1>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              className="project-item"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15 + 0.5,
                ease: "easeOut" 
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <div className="project-year">{project.year}</div>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-technologies">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .projects-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #000000;
        }
        .page-content {
          position: relative;
          z-index: 10;
          text-align: left;
          max-width: 1200px;
          margin-left: 10rem;
          margin-top: 7rem;
          padding: 0 2rem;
        }
        .page-title {
          text-align: left;
        }
        
        .projects-title {
          font-family: var(--font-geist-sans);
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 3rem 0;
          letter-spacing: -0.02em;
        }
        @media (max-width: 1024px) {
          .page-content {
            margin-left: 6rem;
          }
        }
        @media (max-width: 768px) {
          .page-content {
            margin-left: 0;
            margin-top: 5rem;
            text-align: center;
            padding: 4rem 1rem 0 1rem;
          }
          .page-title {
            text-align: center;
          }
          .projects-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin: 1rem auto 0 auto;
          }
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2.5rem;
          max-width: 1200px;
          margin: 2rem auto 0 auto;
        }
        
        .project-item {
          background: transparent;
          border-radius: 0;
          overflow: hidden;
          border: none;
          opacity: 1;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .project-item:hover {
          background: transparent;
          transform: translateX(4px);
        }
        
        .project-image {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
        }
        
        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .project-item:hover .project-image img {
          transform: scale(1.05);
        }
        
        .project-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .project-year {
          background: rgba(0, 0, 0, 0.7);
          color: var(--projects-accent);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-family: var(--font-geist-mono);
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .project-info {
          padding: 2rem;
        }
        
        .project-title {
          font-family: var(--font-geist-sans);
          font-size: 1.5rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 1rem 0;
          line-height: 1.3;
        }
        
        .project-description {
          font-family: var(--font-geist-sans);
          font-size: 0.95rem;
          font-weight: 300;
          color: #cccccc;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
        }
        
        .project-technologies {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .tech-tag {
          background: rgba(168, 200, 168, 0.2);
          color: var(--projects-accent);
          padding: 0.3rem 0.8rem;
          border-radius: 1rem;
          font-family: var(--font-geist-mono);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage; 