"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./threejs-shaders.js";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const ThreeJSSlider = () => {
  // Register GSAP plugins
  gsap.registerPlugin(SplitText);
  
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const planeRef = useRef(null);
  const materialRef = useRef(null);
  const texturesRef = useRef([]);
  const animationIdRef = useRef(null);
  const titleRef = useRef(null);
  const titleAnimationRef = useRef(null);

  // Photography images from the public directory
  const photographySlides = [
    {
      title: "Chromatic Loopscape",
      image: "/img1.jpg",
    },
    {
      title: "Solar Bloom",
      image: "/img2.jpg",
    },
    {
      title: "Neon Handscape",
      image: "/img3.jpg",
    },
    {
      title: "Echo Discs",
      image: "/img4.jpg",
    },
    {
      title: "Void Gaze",
      image: "/img5.jpg",
    },
    {
      title: "Gravity Sync",
      image: "/img6.jpg",
    },
    {
      title: "Heat Core",
      image: "/img7.jpg",
    },
  ];

  const [currentImageTitle, setCurrentImageTitle] = useState(photographySlides[0].title);
  const [showImageTitle, setShowImageTitle] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Watch for title changes and trigger animation
  useEffect(() => {
    if (currentImageTitle && titleRef.current) {
      animateTitle(currentImageTitle);
    }
  }, [currentImageTitle]);

  // Watch for visibility changes from parent
  useEffect(() => {
    const checkVisibility = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        const isGalleryVisible = parent && parent.classList.contains('gallery-visible');
        const isGalleryActive = parent && parent.getAttribute('data-gallery-active') === 'true';
        
        if (isGalleryVisible && isGalleryActive) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // Check immediately
    checkVisibility();

    // Set up observer to watch for class changes
    const observer = new MutationObserver(checkVisibility);
    if (containerRef.current && containerRef.current.parentElement) {
      observer.observe(containerRef.current.parentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-gallery-active']
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // Handle wheel events on the gallery container (reverted to local listener)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event) => {
      const galleryContainer = container.parentElement;
      const isGalleryVisible = galleryContainer?.classList.contains('gallery-visible');
      const isGalleryActive = galleryContainer?.getAttribute('data-gallery-active') === 'true';
      if (!isGalleryVisible || !isGalleryActive) return;

      // Only consume wheel when cursor is over the canvas within a tightened inset
      const canvas = container.querySelector('canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const insetX = rect.width * 0.1;   // shrink capture area by 10% on left/right
      const insetY = rect.height * 0.1;  // shrink capture area by 10% on top/bottom
      const x = event.clientX;
      const y = event.clientY;
      const inside = x >= rect.left + insetX && x <= rect.right - insetX && y >= rect.top + insetY && y <= rect.bottom - insetY;
      if (!inside) {
        // Let parent slider handle scrolling
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (!showImageTitle) setShowImageTitle(true);

      isSnappingRef.current = false;
      isStableRef.current = false;

      targetScrollIntensityRef.current += event.deltaY * 0.001;
      targetScrollIntensityRef.current = Math.max(
        -maxScrollIntensity,
        Math.min(maxScrollIntensity, targetScrollIntensityRef.current)
      );

      targetScrollPositionRef.current += event.deltaY * 0.001;
      isMovingRef.current = true;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isVisible, showImageTitle]);

  // Animation state
  const scrollIntensityRef = useRef(0);
  const targetScrollIntensityRef = useRef(0);
  const scrollPositionRef = useRef(0);
  const targetScrollPositionRef = useRef(0);
  const isMovingRef = useRef(false);
  const isSnappingRef = useRef(false);
  const isStableRef = useRef(false);
  const stableCurrentIndexRef = useRef(0);
  const stableNextIndexRef = useRef(1);

  const maxScrollIntensity = 1.0;
  const scrollSmoothness = 0.5;
  const scrollPositionSmoothness = 0.05;
  const movementThreshold = 0.001;

  const calculatePlaneDimensions = () => {
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const viewportHeight = 2 * Math.tan(fov / 2) * cameraRef.current.position.z;
    const viewportWidth = viewportHeight * cameraRef.current.aspect;

    const widthFactor = window.innerWidth < 900 ? 0.9 : 0.5;
    const planeWidth = viewportWidth * widthFactor;
    const planeHeight = planeWidth * (9 / 16);

    return { width: planeWidth, height: planeHeight };
  };

  const loadTextures = () => {
    const textureLoader = new THREE.TextureLoader();
    return photographySlides.map((slide) => {
      const texture = textureLoader.load(slide.image);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    });
  };

  const determineTextureIndices = (position) => {
    const totalImages = photographySlides.length;
    const baseIndex = Math.floor(position % totalImages);
    const positiveBaseIndex =
      baseIndex >= 0 ? baseIndex : (totalImages + baseIndex) % totalImages;
    const nextIndex = (positiveBaseIndex + 1) % totalImages;

    let normalizedPosition = position % 1;
    if (normalizedPosition < 0) normalizedPosition += 1;

    return {
      currentIndex: positiveBaseIndex,
      nextIndex: nextIndex,
      normalizedPosition: normalizedPosition,
    };
  };

  const updateTextureIndices = () => {
    if (isStableRef.current) {
      materialRef.current.uniforms.uCurrentTexture.value = texturesRef.current[stableCurrentIndexRef.current];
      materialRef.current.uniforms.uNextTexture.value = texturesRef.current[stableNextIndexRef.current];
      return;
    }

    const indices = determineTextureIndices(scrollPositionRef.current);
    materialRef.current.uniforms.uCurrentTexture.value = texturesRef.current[indices.currentIndex];
    materialRef.current.uniforms.uNextTexture.value = texturesRef.current[indices.nextIndex];
  };

  const animateTitle = (newTitle) => {
    if (titleAnimationRef.current) {
      titleAnimationRef.current.kill();
    }
    
    const titleElement = titleRef.current;
    if (!titleElement) return;
    
    // Update the text content
    titleElement.textContent = newTitle;
    
    // Reset opacity to ensure it's visible
    gsap.set(titleElement, { opacity: 1 });
    
    // Create SplitText
    const splitText = new SplitText(titleElement, { type: "chars" });
    const chars = splitText.chars;
    
    // Set initial state
    gsap.set(chars, { opacity: 0, y: 20 });
    
    // Animate in
    titleAnimationRef.current = gsap.timeline()
      .to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "power2.out"
      })
      .to(titleElement, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      }, "+=2"); // Wait 2 seconds before fading out
  };

  const snapToNearestImage = () => {
    if (!isSnappingRef.current) {
      isSnappingRef.current = true;
      const roundedPosition = Math.round(scrollPositionRef.current);
      targetScrollPositionRef.current = roundedPosition;

      const indices = determineTextureIndices(roundedPosition);
      stableCurrentIndexRef.current = indices.currentIndex;
      stableNextIndexRef.current = indices.nextIndex;
      
      // Update the current image title
      const newTitle = photographySlides[indices.currentIndex].title;
      setCurrentImageTitle(newTitle);
    }
  };



  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);

    scrollIntensityRef.current +=
      (targetScrollIntensityRef.current - scrollIntensityRef.current) * scrollSmoothness;
    materialRef.current.uniforms.uScrollIntensity.value = scrollIntensityRef.current;

    scrollPositionRef.current +=
      (targetScrollPositionRef.current - scrollPositionRef.current) * scrollPositionSmoothness;

    let normalizedPosition = scrollPositionRef.current % 1;
    if (normalizedPosition < 0) normalizedPosition += 1;

    if (isStableRef.current) {
      materialRef.current.uniforms.uScrollPosition.value = 0;
    } else {
      materialRef.current.uniforms.uScrollPosition.value = normalizedPosition;
    }

    updateTextureIndices();

    const baseScale = 1.0;
    const scaleIntensity = 0.1;

    if (scrollIntensityRef.current > 0) {
      const scale = baseScale + scrollIntensityRef.current * scaleIntensity;
      planeRef.current.scale.set(scale, scale, 1);
    } else {
      const scale = baseScale - Math.abs(scrollIntensityRef.current) * scaleIntensity;
      planeRef.current.scale.set(scale, scale, 1);
    }

    targetScrollIntensityRef.current *= 0.98;

    const scrollDelta = Math.abs(targetScrollPositionRef.current - scrollPositionRef.current);

    if (scrollDelta < movementThreshold) {
      if (isMovingRef.current && !isSnappingRef.current) {
        snapToNearestImage();
      }

      if (scrollDelta < 0.0001) {
        if (!isStableRef.current) {
          isStableRef.current = true;
          scrollPositionRef.current = Math.round(scrollPositionRef.current);
          targetScrollPositionRef.current = scrollPositionRef.current;
        }

        isMovingRef.current = false;
        isSnappingRef.current = false;
      }
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current.setClearColor(0x000000, 0);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Load textures
    texturesRef.current = loadTextures();

    // Create plane geometry
    const dimensions = calculatePlaneDimensions();
    const geometry = new THREE.PlaneGeometry(dimensions.width, dimensions.height, 32, 32);

    // Create material
    materialRef.current = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uScrollIntensity: { value: scrollIntensityRef.current },
        uScrollPosition: { value: scrollPositionRef.current },
        uCurrentTexture: { value: texturesRef.current[0] },
        uNextTexture: { value: texturesRef.current[1] },
      },
    });

    // Create plane mesh
    planeRef.current = new THREE.Mesh(geometry, materialRef.current);
    sceneRef.current.add(planeRef.current);

    // Wheel events are handled on the container element in the useEffect above

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const newDimensions = calculatePlaneDimensions();
      planeRef.current.geometry.dispose();
      planeRef.current.geometry = new THREE.PlaneGeometry(
        newDimensions.width,
        newDimensions.height,
        32,
        32
      );
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (titleAnimationRef.current) {
        titleAnimationRef.current.kill();
      }
      // Wheel event listeners are cleaned up in the useEffect above
      window.removeEventListener("resize", handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (planeRef.current) {
        planeRef.current.geometry.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      
      texturesRef.current.forEach(texture => {
        texture.dispose();
      });
    };
  }, [containerRef]);

  return (
    <div ref={containerRef} className="threejs-slider-container">
      {/* Image title overlay - only show after first scroll */}
      {showImageTitle && (
        <div className="threejs-image-title">
          <h3 ref={titleRef}>{currentImageTitle}</h3>
        </div>
      )}
      {/* Three.js canvas will be appended here */}
    </div>
  );
};

export default ThreeJSSlider; 