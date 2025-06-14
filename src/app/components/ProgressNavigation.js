"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const Navigation = ({ items, currentPage, onPageChange, isTransitioning, scrollProgress, scrollDirection }) => {
  const navRef = useRef();

  // Get page-specific accent color
  const getPageAccentColor = (pageId) => {
    const colorMap = {
      'home': 'var(--home-accent)',
      'work': 'var(--work-accent)', 
      'projects': 'var(--projects-accent)',
      'archive': 'var(--archive-accent)',
      'music': 'var(--music-accent)',
      'contact': 'var(--contact-accent)'
    };
    return colorMap[pageId] || 'var(--home-accent)';
  };

  useEffect(() => {
    // Animate navigation items on mount
    gsap.fromTo(
      ".nav-item",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5
      }
    );
  }, []);

  const getCurrentIndex = () => {
    return items.findIndex(item => item.id === currentPage);
  };

  const getTargetIndex = () => {
    const currentIndex = getCurrentIndex();
    if (scrollDirection > 0) {
      return currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else if (scrollDirection < 0) {
      return currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    }
    return currentIndex;
  };

  return (
    <nav 
      ref={navRef}
      className="main-navigation"
      style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 1000,
        fontFamily: 'var(--font-geist-mono)'
      }}
    >
      {items.map((item, index) => {
        const isActive = currentPage === item.id;
        const isTarget = index === getTargetIndex() && scrollProgress > 0;
        
        return (
          <motion.div 
            key={item.id}
            className="nav-item"
            onClick={() => onPageChange(item.id)}
            style={{
              position: 'relative',
              padding: '0.25rem',
              borderRadius: '0.15rem',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: 0
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Current Page Background */}
            <motion.div 
              className="nav-progress"
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: isActive ? 1 : 0,
                backgroundColor: getPageAccentColor(currentPage)
              }}
              transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transformOrigin: 'left',
                willChange: 'transform'
              }}
            />
            
            {/* Scroll Progress Background */}
            {isTarget && (
              <motion.div 
                className="nav-scroll-progress"
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: scrollProgress,
                  backgroundColor: `color-mix(in srgb, ${getPageAccentColor(items[getTargetIndex()].id)} 60%, transparent 40%)`
                }}
                transition={{ duration: 0.1, ease: "linear" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'left',
                  willChange: 'transform',
                  zIndex: 1
                }}
              />
            )}
            
            {/* Navigation Link */}
            <div 
              className="nav-link"
              style={{
                position: 'relative',
                zIndex: 2,
                transition: 'color 0.3s ease',
                color: '#ffffff',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                lineHeight: '120%',
                fontWeight: 400
              }}
            >
              <span 
                style={{
                  fontSize: '0.6rem',
                  paddingRight: '0.4rem',
                  paddingLeft: '0.2rem',
                  opacity: 0.7
                }}
              >
                {item.number}
              </span>
              {item.title}
            </div>
          </motion.div>
        );
      })}



      <style jsx>{`
        .nav-item:hover .nav-link {
          color: ${getPageAccentColor(currentPage)};
        }
        
        .main-navigation {
          user-select: none;
        }
        
        @media (max-width: 768px) {
          .main-navigation {
            top: 1rem;
            left: 1rem;
          }
          
          .nav-link {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation; 