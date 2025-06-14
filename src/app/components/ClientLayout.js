"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navigation from "./ProgressNavigation";
import SiteHeader from "./SiteHeader";
import PageTransition from "./PageTransition";
import HomePage from "./pages/HomePage";
import WorkPage from "./pages/WorkPage";
import ProjectsPage from "./pages/ProjectsPage";
import ArchivePage from "./pages/ArchivePage";
import ContactPage from "./pages/ContactPage";
import MusicPage from "./pages/MusicPage";
import gsap from "gsap";

const ClientLayout = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(0);
  const contentRef = useRef();
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef(null);

  const navigationItems = [
    { id: "home", title: "Info", number: "01" },
    { id: "work", title: "Work", number: "02" },
    { id: "projects", title: "Projects", number: "03" },
    { id: "archive", title: "Archive", number: "04" },
    { id: "music", title: "Music", number: "05" },
    { id: "contact", title: "Contact", number: "06" }
  ];

  const getNextPage = (current) => {
    const currentIndex = navigationItems.findIndex(item => item.id === current);
    if (currentIndex < navigationItems.length - 1) {
      return navigationItems[currentIndex + 1].id;
    }
    return navigationItems[0].id; // Loop back to first
  };

  const getPrevPage = (current) => {
    const currentIndex = navigationItems.findIndex(item => item.id === current);
    if (currentIndex > 0) {
      return navigationItems[currentIndex - 1].id;
    }
    return navigationItems[navigationItems.length - 1].id; // Loop to last
  };

  // Handle scroll with progress accumulation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning || pendingPage) return;
      
      // Special handling for archive page
      if (currentPage === 'archive') {
        const container = document.querySelector('.app-container');
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Only trigger transition when we're at the absolute bottom (within 5px) and scrolling down
        const isAtAbsoluteBottom = scrollTop + clientHeight >= scrollHeight - 5;
        
        if (isAtAbsoluteBottom && e.deltaY > 0) {
          // Use the same accumulation logic as other pages
          e.preventDefault();
          const now = Date.now();
          const deltaY = e.deltaY;
          
          // Reset accumulator if direction changes or too much time passed
          if ((deltaY > 0 && scrollDirection < 0) || 
              (deltaY < 0 && scrollDirection > 0) || 
              (now - lastScrollTime.current > 150)) {
            scrollAccumulator.current = 0;
            setScrollProgress(0);
          }
          
          // Update direction and time
          setScrollDirection(deltaY > 0 ? 1 : -1);
          lastScrollTime.current = now;
          
          // Accumulate scroll
          scrollAccumulator.current += Math.abs(deltaY);
          
          // Calculate progress (need about 1200px of scroll to trigger - more than other pages)
          const progress = Math.min(scrollAccumulator.current / 1200, 1);
          setScrollProgress(progress);
          
          // Clear existing timeout
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }
          
          // Trigger page change when progress reaches 100%
          if (progress >= 1) {
            handlePageChange(getNextPage(currentPage));
            scrollAccumulator.current = 0;
            setScrollProgress(0);
          } else {
            // Reset progress after inactivity
            scrollTimeout.current = setTimeout(() => {
              scrollAccumulator.current = 0;
              setScrollProgress(0);
            }, 1000);
          }
        } else {
          // Reset progress when not at absolute bottom
          scrollAccumulator.current = 0;
          setScrollProgress(0);
        }
        return;
      }
      
      e.preventDefault();
      const now = Date.now();
      const deltaY = e.deltaY;
      
      // Reset accumulator if direction changes or too much time passed
      if ((deltaY > 0 && scrollDirection < 0) || 
          (deltaY < 0 && scrollDirection > 0) || 
          (now - lastScrollTime.current > 150)) {
        scrollAccumulator.current = 0;
        setScrollProgress(0);
      }
      
      // Update direction and time
      setScrollDirection(deltaY > 0 ? 1 : -1);
      lastScrollTime.current = now;
      
      // Accumulate scroll
      scrollAccumulator.current += Math.abs(deltaY);
      
      // Calculate progress (need about 800px of scroll to trigger)
      const progress = Math.min(scrollAccumulator.current / 800, 1);
      setScrollProgress(progress);
      
      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Trigger page change when progress reaches 100%
      if (progress >= 1) {
        const nextPage = deltaY > 0 ? getNextPage(currentPage) : getPrevPage(currentPage);
        handlePageChange(nextPage);
        scrollAccumulator.current = 0;
        setScrollProgress(0);
      } else {
        // Reset progress after inactivity
        scrollTimeout.current = setTimeout(() => {
          scrollAccumulator.current = 0;
          setScrollProgress(0);
        }, 1000);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [currentPage, isTransitioning, pendingPage, scrollDirection]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "work":
        return <WorkPage />;
      case "projects":
        return <ProjectsPage />;
      case "archive":
        return <ArchivePage />;
      case "music":
        return <MusicPage />;
      case "contact":
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  // GSAP animation for section transitions
  useEffect(() => {
    if (!pendingPage) return;
    if (!contentRef.current) return;
    // Animate out
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        setCurrentPage(pendingPage);
        setPendingPage(null);
        // Animate in
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }
    });
  }, [pendingPage]);

  const handlePageChange = (pageId) => {
    if (pageId === currentPage || isTransitioning || pendingPage) return;
    setIsTransitioning(true);
    setPendingPage(pageId);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // matches GSAP total duration
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navigation 
        items={navigationItems}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isTransitioning={isTransitioning}
        scrollProgress={scrollProgress}
        scrollDirection={scrollDirection}
      />
      
      {/* Site Header */}
      <SiteHeader />
      
      {/* Page Transition Overlay */}
      <PageTransition isActive={isTransitioning} />
      
      {/* Main Content */}
      <main className="main-content">
        <div ref={contentRef} className="page-content">
          {renderCurrentPage()}
        </div>
      </main>

      <style jsx>{`
        .app-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: ${currentPage === 'archive' ? 'auto' : 'hidden'};
          background: #000000;
        }
        
        .main-content {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: ${currentPage === 'archive' ? 'auto' : 'hidden'};
        }
        
        .page-content {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default ClientLayout; 