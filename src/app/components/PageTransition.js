"use client";
import { motion, AnimatePresence } from "framer-motion";

const PageTransition = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Main sweep transition */}
          <motion.div
            initial={{ x: "-100%", skewX: 5 }}
            animate={{ x: "100%", skewX: 0 }}
            exit={{ x: "100%", skewX: -5 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '120%',
              height: '100%',
              background: 'linear-gradient(120deg, transparent 0%, rgba(0, 0, 0, 0.97) 20%, rgba(20, 20, 20, 0.98) 50%, rgba(0, 0, 0, 0.97) 80%, transparent 100%)',
              zIndex: 9999,
              transformOrigin: 'center',
            }}
          />
          
          {/* Subtle accent line */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "100%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: 0,
              width: '120%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, var(--accent-mint) 30%, var(--accent-sky) 50%, var(--accent-lavender) 70%, transparent 100%)',
              transform: 'translateY(-50%)',
              zIndex: 10000,
            }}
          />
          
          {/* Particles/dots effect */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: -50, 
                y: `${30 + i * 20}%`,
                scale: 0,
                opacity: 0 
              }}
              animate={{ 
                x: window?.innerWidth ? window.innerWidth + 50 : 1200, 
                y: `${30 + i * 20}%`,
                scale: 1,
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2 + i * 0.1
              }}
              style={{
                position: 'fixed',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: i === 0 ? 'var(--accent-mint)' : 
                           i === 1 ? 'var(--accent-sky)' : 'var(--accent-lavender)',
                zIndex: 10001,
                boxShadow: `0 0 10px ${i === 0 ? 'var(--accent-mint)' : 
                                     i === 1 ? 'var(--accent-sky)' : 'var(--accent-lavender)'}`,
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

export default PageTransition; 