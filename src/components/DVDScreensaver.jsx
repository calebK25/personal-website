"use client";

import { useEffect, useRef, useState } from "react";

const DVDScreensaver = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [selectedGif, setSelectedGif] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // DVD screensaver state
  const dvdRef = useRef({
    x: 0,
    y: 0,
    dx: 2,
    dy: 2,
    width: 200,
    height: 200,
    rotation: 0,
    rotationSpeed: 0.02,
  });

  const gifs = [
    "/gifs/_.gif",
    "/gifs/ddlr08v-9a00be7c-0626-4895-83fc-b155f94e5451.gif"
  ];

  useEffect(() => {
    // Select random GIF
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    setSelectedGif(randomGif);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Load the GIF image
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      
      // Initialize DVD position
      dvdRef.current.x = Math.random() * (canvas.width - dvdRef.current.width);
      dvdRef.current.y = Math.random() * (canvas.height - dvdRef.current.height);
      
      // Random initial direction
      dvdRef.current.dx = (Math.random() > 0.5 ? 1 : -1) * 2;
      dvdRef.current.dy = (Math.random() > 0.5 ? 1 : -1) * 2;
    };
    img.src = randomGif;

    const animate = () => {
      if (!isLoaded) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update position
      dvdRef.current.x += dvdRef.current.dx;
      dvdRef.current.y += dvdRef.current.dy;

      // Check for corner hits (perfect corner bounces)
      const hitCorner = 
        (dvdRef.current.x <= 0 && dvdRef.current.y <= 0) ||
        (dvdRef.current.x + dvdRef.current.width >= canvas.width && dvdRef.current.y <= 0) ||
        (dvdRef.current.x <= 0 && dvdRef.current.y + dvdRef.current.height >= canvas.height) ||
        (dvdRef.current.x + dvdRef.current.width >= canvas.width && dvdRef.current.y + dvdRef.current.height >= canvas.height);

      // Check for wall bounces
      if (dvdRef.current.x <= 0 || dvdRef.current.x + dvdRef.current.width >= canvas.width) {
        dvdRef.current.dx = -dvdRef.current.dx;
      }
      if (dvdRef.current.y <= 0 || dvdRef.current.y + dvdRef.current.height >= canvas.height) {
        dvdRef.current.dy = -dvdRef.current.dy;
      }

      // Update rotation
      dvdRef.current.rotation += dvdRef.current.rotationSpeed;

      // Draw the GIF
      ctx.save();
      ctx.translate(
        dvdRef.current.x + dvdRef.current.width / 2,
        dvdRef.current.y + dvdRef.current.height / 2
      );
      ctx.rotate(dvdRef.current.rotation);
      ctx.drawImage(
        img,
        -dvdRef.current.width / 2,
        -dvdRef.current.height / 2,
        dvdRef.current.width,
        dvdRef.current.height
      );
      ctx.restore();

      // Corner hit effect (flash screen)
      if (hitCorner) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoaded]);

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      backgroundColor: "black",
      zIndex: 9999 
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default DVDScreensaver; 