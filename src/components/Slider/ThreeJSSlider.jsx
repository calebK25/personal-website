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
  const locationRowRef = useRef(null);

  // Photography images from the public/photography directory
  const photographySlides = [
    { title: "San Juan", location: "San Juan, Puerto Rico", image: "/photography/San Juan, Puerto Rico.jpg" },
    { title: "Kyoto", location: "Kyoto, Japan", image: "/photography/Kyoto.jpg" },
    { title: "Shibuya Crossing", location: "Shibuya, Japan", image: "/photography/Shibuya Crossing.jpg" },
    { title: "Jersey Shore", location: "Jersey Shore, New New Jersey", image: "/photography/Jersey Shore.jpg" },
    { title: "Diamond Lake", location: "Eldora, Colorado", image: "/photography/Diamond Lake.JPG" },
  ];

  const [currentImageTitle, setCurrentImageTitle] = useState(photographySlides[0].title);
  const [currentLocation, setCurrentLocation] = useState(photographySlides[0].location || photographySlides[0].title);
  const [showImageTitle, setShowImageTitle] = useState(false);
  // Lightbox removed per request
  const [palette, setPalette] = useState([]); // array of {hex, r,g,b}
  const prevPaletteRef = useRef([]);
  const [shotSettings, setShotSettings] = useState({
    location: "",
    date: "",
    camera: "",
    lens: "",
    iso: "—",
    aperture: "—",
    shutter: "—",
    resolution: ""
  });
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

  // Palette extraction: bin colors on a downsized canvas, pick top 5
  const extractPaletteFromImage = (img, topN = 5) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = 80;
      const h = Math.max(1, Math.round((img.height / img.width) * w));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const bins = new Map();
      const step = 24; // bin size
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        const r = Math.floor(data[i] / step) * step;
        const g = Math.floor(data[i + 1] / step) * step;
        const b = Math.floor(data[i + 2] / step) * step;
        const key = `${r},${g},${b}`;
        bins.set(key, (bins.get(key) || 0) + 1);
      }
      const sorted = Array.from(bins.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN);
      const palette = sorted.map(([k]) => {
        const [r, g, b] = k.split(',').map(n => parseInt(n, 10));
        const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
        return { r, g, b, hex };
      });
      return palette;
    } catch {
      return [];
    }
  };

  const computeShotSettings = (img, title) => {
    const res = img ? `${img.naturalWidth || img.width}×${img.naturalHeight || img.height}` : "";
    // Minimal, we can extend if EXIF parsing is added later
    return {
      location: title || "",
      date: new Date().toISOString().slice(0, 10),
      camera: "",
      lens: "",
      iso: "—",
      aperture: "—",
      shutter: "—",
      resolution: res,
    };
  };

  // Compute leader mask holes for a single row (skip under key/value)
  const setLeaderMaskForRow = (rowEl) => {
    if (!rowEl) return;
    try {
      const key = rowEl.querySelector('.kv-key');
      const value = rowEl.querySelector('.kv-value');
      if (!key || !value) return;
      const rect = rowEl.getBoundingClientRect();
      const keyRect = key.getBoundingClientRect();
      const valRect = value.getBoundingClientRect();
      const width = rect.width || 1;
      const hole1Start = ((keyRect.left - rect.left) / width) * 100;
      const hole1End = ((keyRect.right - rect.left) / width) * 100;
      const hole2Start = ((valRect.left - rect.left) / width) * 100;
      const hole2End = ((valRect.right - rect.left) / width) * 100;
      rowEl.style.setProperty('--hole1-start', `${hole1Start}%`);
      rowEl.style.setProperty('--hole1-end', `${hole1End}%`);
      rowEl.style.setProperty('--hole2-start', `${hole2Start}%`);
      rowEl.style.setProperty('--hole2-end', `${hole2End}%`);
    } catch {}
  };

  const positionPaletteRow = () => {
    try {
      const container = containerRef.current;
      if (!container) return;
      const canvas = container.querySelector('canvas');
      const paletteRow = container.querySelector('.palette-row');
      if (!canvas || !paletteRow) return;
      const cr = container.getBoundingClientRect();
      const rr = canvas.getBoundingClientRect();
      const left = rr.left - cr.left;
      const top = rr.bottom - cr.top + 8; // 8px gap below gallery
      const width = rr.width;
      paletteRow.style.left = `${left}px`;
      paletteRow.style.top = `${top}px`;
      paletteRow.style.width = `${width}px`;
      paletteRow.style.right = 'auto';
    } catch {}
  };

  // Lightweight EXIF reader for JPEGs (ISO, FNumber, ExposureTime)
  const fetchAndParseEXIF = async (src) => {
    try {
      const res = await fetch(src);
      const buf = await res.arrayBuffer();
      const dv = new DataView(buf);
      // find 'Exif\0\0'
      const exifSig = [0x45,0x78,0x69,0x66,0x00,0x00];
      let start = -1;
      for (let i = 0; i < dv.byteLength - 10; i += 1) {
        if (dv.getUint8(i) === 0xFF && dv.getUint8(i+1) === 0xE1) {
          // APP1 length
          const len = dv.getUint16(i+2);
          let ok = true;
          for (let k = 0; k < 6; k += 1) if (dv.getUint8(i+4+k) !== exifSig[k]) ok = false;
          if (ok) { start = i + 10; break; }
          i += len;
        }
      }
      if (start < 0) return {};
      const endian = dv.getUint16(start) === 0x4949 ? 'II' : 'MM';
      const isLE = endian === 'II';
      const getU16 = (o) => dv.getUint16(o, isLE);
      const getU32 = (o) => dv.getUint32(o, isLE);
      const base = start;
      const ifd0Offset = getU32(base + 4) + base;
      const readIFD = (offset) => {
        const num = getU16(offset);
        const map = new Map();
        for (let n = 0; n < num; n += 1) {
          const entry = offset + 2 + n * 12;
          const tag = getU16(entry);
          const type = getU16(entry + 2);
          const count = getU32(entry + 4);
          let valueOffset = entry + 8;
          const valSize = (type === 3 ? 2 : type === 4 ? 4 : type === 5 ? 8 : 1) * count;
          if (valSize > 4) valueOffset = getU32(entry + 8) + base;
          let value;
          if (type === 3) { // SHORT
            value = count === 1 ? getU16(valueOffset) : getU16(valueOffset);
          } else if (type === 4) { // LONG
            value = getU32(valueOffset);
          } else if (type === 5) { // RATIONAL
            const nume = getU32(valueOffset);
            const deno = getU32(valueOffset + 4) || 1;
            value = [nume, deno];
          }
          map.set(tag, value);
        }
        const next = getU32(offset + 2 + num * 12);
        return { map, next: next ? next + base : 0 };
      };
      // IFD0 then EXIF IFD via tag 0x8769
      const ifd0 = readIFD(ifd0Offset);
      const exifIFDOffset = ifd0.map.get(0x8769);
      if (!exifIFDOffset) return {};
      const exif = readIFD(exifIFDOffset + base);
      const iso = exif.map.get(0x8827);
      const fnum = exif.map.get(0x829D); // [num, den]
      const exp = exif.map.get(0x829A); // [num, den]
      const fmtF = fnum ? `f/${(fnum[0]/fnum[1]).toFixed(1)}` : '—';
      let fmtExp = '—';
      if (exp) {
        const val = exp[0] / (exp[1] || 1);
        fmtExp = val >= 1 ? `${val.toFixed(1)}s` : `1/${Math.round(1/val)}s`;
      }
      return { iso: iso || '—', aperture: fmtF, shutter: fmtExp };
    } catch {
      return {};
    }
  };

  // Animate palette changes: color tween + hex digit flip
  const animateHexFlip = (el, fromHex, toHex) => {
    if (!el) return;
    const prevTag = el.getAttribute('data-prev');
    if (prevTag === toHex) return;
    el.setAttribute('data-prev', toHex || '');
    const from = (fromHex || '').replace('#','').padStart(6, '0').slice(0,6);
    const to = (toHex || '').replace('#','').padStart(6, '0').slice(0,6);
    const targetChars = to.split('');
    // Build reels per char (0-9, a-f)
    const digits = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    el.innerHTML = `<span class="hash">#</span>` + targetChars.map((t, i) => {
      const reel = digits.concat([]); // copy
      // ensure target at end to scroll to
      if (reel[reel.length - 1] !== t.toLowerCase()) reel[reel.length - 1] = t.toLowerCase();
      const reelHTML = reel.map(d => `<span>${d}</span>`).join('');
      return `<span class="slot" data-i="${i}"><span class="reel">${reelHTML}</span></span>`;
    }).join('');
    const slots = el.querySelectorAll('.slot .reel');
    requestAnimationFrame(() => {
      slots.forEach((reel, i) => {
        const height = reel.querySelector('span')?.offsetHeight || 16;
        const duration = 0.6 + i * 0.05;
        gsap.to(reel, { y: -(height * 15), duration, ease: 'power3.inOut' });
      });
    });
  };

  const animatePaletteTransition = (prev, next) => {
    const row = containerRef.current?.querySelector('.palette-row');
    if (!row) return;
    const swatches = row.querySelectorAll('.palette-swatch');
    for (let i = 0; i < next.length; i += 1) {
      const sw = swatches[i];
      if (!sw) continue;
      const dot = sw.querySelector('.dot');
      const hexEl = sw.querySelector('.hex');
      const from = prev[i]?.hex || prev[0]?.hex || '#000000';
      const to = next[i].hex;
      if (!/^#?[0-9a-fA-F]{6}$/.test(to)) continue; // sanity
      // color tween
      if (dot) {
        const fromRGB = gsap.utils.splitColor(from);
        const toRGB = gsap.utils.splitColor(to);
        const col = { r: fromRGB[0], g: fromRGB[1], b: fromRGB[2] };
        gsap.to(col, {
          r: toRGB[0], g: toRGB[1], b: toRGB[2], duration: 0.6, ease: 'power2.out',
          onUpdate: () => { dot.style.background = `rgb(${col.r|0}, ${col.g|0}, ${col.b|0})`; }
        });
      }
      // hex flip
      if (hexEl) animateHexFlip(hexEl, from, to);
    }
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
      const slide = photographySlides[indices.currentIndex];
      const newTitle = slide.title;
      setCurrentImageTitle(newTitle);
      setCurrentLocation(slide.location || slide.title);
      // compute palette + settings from current texture image if available
      const img = texturesRef.current[indices.currentIndex]?.image;
      if (img) {
        // Defer animations to stabilize; snap handler will handle final update
        // Only update title/location here to avoid double palette animation
        setShotSettings(computeShotSettings(img, slide.location || slide.title));
      }
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
          // Only update palette/exif when locked
          const idx = determineTextureIndices(scrollPositionRef.current).currentIndex;
          const img = texturesRef.current[idx]?.image;
          if (img) {
            const slide = photographySlides[idx];
            const nextPal = extractPaletteFromImage(img);
            // Rebuild slot reels fresh before animating to ensure clean state
            const row = containerRef.current?.querySelector('.palette-row');
            if (row) {
              const swatches = row.querySelectorAll('.palette-swatch .hex');
              swatches.forEach((hexEl, i) => {
                const from = prevPaletteRef.current[i]?.hex || prevPaletteRef.current[0]?.hex || '#000000';
                const toHex = nextPal[i]?.hex || from;
                if (hexEl && toHex) {
                  hexEl.removeAttribute('data-prev');
                  animateHexFlip(hexEl, from, toHex);
                }
              });
            }
            prevPaletteRef.current = nextPal;
            setPalette(nextPal);
            fetchAndParseEXIF(slide.image).then((meta) => {
              setShotSettings((prev) => ({ ...prev, ...meta }));
            });
            // Recompute leader mask for location row when locked
            setLeaderMaskForRow(locationRowRef.current);
          }
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
    // Initial palette/settings when textures finish loading async
    setTimeout(() => {
      const img0 = texturesRef.current[0]?.image;
      if (img0) {
        const nextPal = extractPaletteFromImage(img0);
        prevPaletteRef.current = nextPal;
        setPalette(nextPal);
        setShotSettings(computeShotSettings(img0, photographySlides[0].location || photographySlides[0].title));
        fetchAndParseEXIF(photographySlides[0].image).then((meta) => {
          setShotSettings((prev) => ({ ...prev, ...meta }));
        });
        // Animate reels immediately on first load and position palette
        requestAnimationFrame(() => {
          positionPaletteRow();
          const palRow = containerRef.current?.querySelector('.palette-row');
          if (palRow) {
            const swatches = palRow.querySelectorAll('.palette-swatch .hex');
            swatches.forEach((hexEl, i) => {
              const toHex = nextPal?.[i]?.hex;
              if (hexEl && toHex) animateHexFlip(hexEl, '#000000', toHex);
            });
          }
        });
      }
      requestAnimationFrame(() => {
        setLeaderMaskForRow(locationRowRef.current);
        positionPaletteRow();
      });
      // ripple in location row once
      const row = locationRowRef.current;
      if (row) {
        row.classList.remove('animate','show-key','show-value');
        // eslint-disable-next-line no-unused-expressions
        row.offsetWidth;
        row.classList.add('animate');
        setTimeout(() => row.classList.add('show-key'), 260);
        setTimeout(() => row.classList.add('show-value'), 520);
      }
    }, 200);

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
      positionPaletteRow();
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
    <div ref={containerRef} className="threejs-slider-container paper">
      <div className="receipt-overlay">
        <div className="corner-logo"></div>
        <div className="serial-code">PHO-04</div>
        <div className="crop crop-tl"></div>
        <div className="crop crop-tr"></div>
        <div className="crop crop-bl"></div>
        <div className="crop crop-br"></div>
        <div className="watermark">{new Date().toISOString().slice(0,10)}-PHO</div>
      </div>
      <div ref={locationRowRef} className="kv-row with-leaders location-row" style={{ marginBottom: '8px' }}>
        <span className="kv-key">Location</span>
        <span className="kv-value">{currentLocation}</span>
      </div>
      {/* Palette row (right aligned) */}
      {palette && palette.length > 0 && (
        <div className="palette-row">
          {palette.map((c, i) => (
            <div key={i} className="palette-swatch" title={c.hex}>
              <span className="dot" style={{ background: c.hex }} />
              <span className="hex" data-idx={i}>
                <span className="hash">#</span>
                {[0,1,2,3,4,5].map((d) => (
                  <span key={d} className="slot"><span className="reel">{['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'].map((ch, k) => (<span key={k}>{ch}</span>))}</span></span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Image title overlay - only show after first scroll */}
      {showImageTitle && (
        <div className="threejs-image-title">
          <h3 ref={titleRef}>{currentImageTitle}</h3>
        </div>
      )}
      {/* Inline shot settings under palette (ISO / Aperture / Shutter) */}
      <div className="shot-settings" style={{ maxWidth: '900px', margin: '0 auto 8px' }}>
        <div className="kv-row with-leaders"><span className="kv-key">ISO</span><span className="kv-value">{shotSettings.iso}</span></div>
        <div className="kv-row with-leaders"><span className="kv-key">Aperture</span><span className="kv-value">{shotSettings.aperture}</span></div>
        <div className="kv-row with-leaders"><span className="kv-key">Shutter</span><span className="kv-value">{shotSettings.shutter}</span></div>
      </div>
      {/* Three.js canvas will be appended here */}
    </div>
  );
};

export default ThreeJSSlider; 