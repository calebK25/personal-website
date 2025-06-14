"use client";
import { useEffect, useState } from "react";

const SiteHeader = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timeZoneAbbr = timeZone.split("/").pop().replace("_", " ");

      const timeOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      const timeStr = now.toLocaleTimeString("en-US", timeOptions) + ` [${timeZoneAbbr}]`;
      setCurrentTime(timeStr);

      const dateOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      const dateStr = now.toLocaleDateString("en-US", dateOptions);
      setCurrentDate(dateStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`site-header ${isDark ? 'dark' : 'light'}`}
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        width: '35%',
        maxWidth: '400px',
        zIndex: 100,
        fontFamily: 'var(--font-geist-mono)'
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <div style={{ flex: 1 }}>
          <p 
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              lineHeight: '120%',
              marginBottom: '0.2rem',
              transition: 'color 0.3s ease'
            }}
          >
            Caleb
          </p>
          <p 
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              lineHeight: '120%',
              opacity: 0.6,
              transition: 'color 0.3s ease'
            }}
          >
            Digital Designer
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p 
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              lineHeight: '120%',
              marginBottom: '0.2rem',
              transition: 'color 0.3s ease'
            }}
          >
            {currentTime}
          </p>
          <p 
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              lineHeight: '120%',
              opacity: 0.6,
              transition: 'color 0.3s ease'
            }}
          >
            {currentDate}
          </p>
        </div>
      </div>

      <style jsx>{`
        .site-header.dark p {
          color: #ffffff;
        }
        
        .site-header.light p {
          color: #000000;
        }
      `}</style>
    </div>
  );
};

export default SiteHeader; 