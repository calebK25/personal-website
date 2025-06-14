"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const ContactPage = () => {
  const titleRef = useRef();
  const contentRef = useRef();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Animate elements on mount
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )
    .fromTo(".contact-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );

    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const contactMethods = [
    {
      icon: "✉",
      label: "Email",
      value: "hello@caleb.dev", 
      href: "mailto:hello@caleb.dev",
      description: "For project inquiries and collaborations",
      availability: "Response within 24 hours"
    },
    {
      icon: "💼",
      label: "LinkedIn",
      value: "linkedin.com/in/calebsmith",
      href: "https://linkedin.com/in/calebsmith",
      description: "Professional network and experience",
      availability: "Professional inquiries"
    },
    {
      icon: "🔗",
      label: "GitHub",
      value: "github.com/calebsmith",
      href: "https://github.com/calebsmith",
      description: "Code repositories and open source",
      availability: "Always available"
    },
    {
      icon: "📍",
      label: "Location",
      value: "San Francisco, CA",
      href: null,
      description: "Pacific Time Zone (UTC-8)",
      availability: `${time.toLocaleTimeString('en-US', { 
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })} PST`
    }
  ];

  const interests = [
    "Creative Technology",
    "Design Systems", 
    "Digital Art",
    "Music Production",
    "Sustainable Tech",
    "Open Source"
  ];

  return (
    <div className="contact-page">
      <div className="page-content">
        <motion.h1 
          ref={titleRef}
          className="contact-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Contact
        </motion.h1>
        
        <motion.div 
          className="contact-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="intro-text">
            Currently open to freelance projects, collaborations, and full-time opportunities. 
            Let's create something remarkable together.
          </p>
        </motion.div>
        
        <motion.div 
          className="contact-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="contact-grid">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                className={`contact-card ${hoveredCard === index ? 'hovered' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {method.href ? (
                  <a 
                    href={method.href}
                    className="card-link"
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <div className="card-content">
                      <div className="card-header">
                        <span className="card-icon">{method.icon}</span>
                        <span className="card-label">{method.label}</span>
                      </div>
                      <div className="card-value">{method.value}</div>
                      <div className="card-description">{method.description}</div>
                      <div className="card-availability">{method.availability}</div>
                    </div>
                  </a>
                ) : (
                  <div className="card-content">
                    <div className="card-header">
                      <span className="card-icon">{method.icon}</span>
                      <span className="card-label">{method.label}</span>
                    </div>
                    <div className="card-value">{method.value}</div>
                    <div className="card-description">{method.description}</div>
                    <div className="card-availability">{method.availability}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="interests-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h3 className="interests-title">Areas of Interest</h3>
            <div className="interests-grid">
              {interests.map((interest, index) => (
                <motion.span
                  key={index}
                  className="interest-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="contact-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
        >
          <div className="footer-line" />
          <p className="footer-text">
            Ready to start a conversation? Drop me a line and let's explore the possibilities.
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .contact-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #000000;
          overflow-y: auto;
          max-height: 100vh;
        }
        
        .page-content {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 4rem 4rem 4rem;
        }
        
        .contact-title {
          margin: 0 0 2rem 0;
          opacity: 0;
        }
        
        .contact-intro {
          margin-bottom: 3rem;
          max-width: 600px;
        }
        
        .intro-text {
          font-size: 1rem;
          color: var(--contact-accent);
          margin: 0;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        
        .contact-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0;
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        
        .contact-card:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 169, 110, 0.3);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        
        .card-content {
          padding: 1.25rem;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .card-icon {
          font-size: 1.5rem;
          filter: grayscale(1);
          transition: filter 0.3s ease;
        }
        
        .contact-card:hover .card-icon {
          filter: grayscale(0);
        }
        
        .card-label {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--contact-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .card-value {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          transition: color 0.3s ease;
        }
        
        .contact-card:hover .card-value {
          color: var(--contact-accent);
        }
        
        .card-description {
          font-size: 0.8rem;
          color: #cccccc;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .card-availability {
          font-family: "Akkurat Mono", monospace;
          font-size: 0.7rem;
          font-weight: 500;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: inline-block;
        }
        
        .interests-section {
          margin-bottom: 2rem;
        }
        
        .interests-title {
          font-weight: 400;
          margin: 0 0 1.25rem 0;
          text-align: center;
        }
        
        .interests-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }
        
        .interest-tag {
          font-size: 0.8rem;
          font-weight: 400;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .interest-tag:hover {
          background: rgba(201, 169, 110, 0.1);
          border-color: rgba(201, 169, 110, 0.3);
          color: var(--contact-accent);
          transform: translateY(-2px);
        }
        
        .contact-footer {
          text-align: center;
          padding-top: 2rem;
          margin-top: 2rem;
        }
        
        .footer-line {
          width: 60px;
          height: 1px;
          background: var(--contact-accent);
          margin: 0 auto 2rem auto;
        }
        
        .footer-text {
          font-size: 0.9rem;
          color: #666666;
          font-style: italic;
          margin: 0;
          max-width: 400px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .page-content {
            padding: 4rem 2rem 6rem 2rem;
          }
          
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          
          .card-content {
            padding: 1.5rem;
          }
          
          .contact-intro {
            margin-bottom: 4rem;
          }
          
          .interests-grid {
            gap: 0.75rem;
          }
          
          .interest-tag {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
          }
        }
        
        @media (max-width: 480px) {
          .page-content {
            padding: 3rem 1rem 4rem 1rem;
          }
          
          .card-content {
            padding: 1.25rem;
          }
          
          .card-header {
            gap: 0.75rem;
          }
          
          .card-icon {
            font-size: 1.25rem;
          }
          
          .card-value {
            font-size: 1rem;
          }
          
          .interests-grid {
            gap: 0.5rem;
          }
          
          .interest-tag {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage; 