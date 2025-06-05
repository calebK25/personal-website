"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";

const PhotoCarousel = ({ photos }) => {
  const sliderRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && sliderRef.current) {
      initializeCards();
    }
  }, [isClient, sliderRef]);

  const initializeCards = () => {
    const cards = Array.from(sliderRef.current.querySelectorAll(".photo-card"));
    gsap.to(cards, {
      y: (i) => 0 + 20 * i + "%",
      z: (i) => 15 * i,
      duration: 1,
      ease: "power3.out",
      stagger: -0.1,
    });
  };

  const handleCarouselClick = useCallback((e) => {
    // Only rotate if clicking on the carousel container or hint, not on individual photos
    if (e.target.closest('.photo-card')) return;
    
    if (isAnimating || !photos?.length) return;
    setIsAnimating(true);

    const slider = sliderRef.current;
    const cards = Array.from(slider.querySelectorAll(".photo-card"));
    const lastCard = cards.pop();

    gsap.to(lastCard, {
      y: "+=150%",
      duration: 0.75,
      ease: "power3.inOut",
      onStart: () => {
        setTimeout(() => {
          slider.prepend(lastCard);
          initializeCards();
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }, 300);
      },
    });
  }, [isAnimating, photos?.length]);

  const handlePhotoClick = useCallback((photo, e) => {
    e.stopPropagation();
    setSelectedPhoto(photo);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  if (!photos?.length) {
    return <div className="photo-carousel-placeholder">No photos available</div>;
  }

  return (
    <>
      <div className="photo-carousel-container" onClick={handleCarouselClick}>
        <div className="photo-slider" ref={sliderRef}>
          {photos.map((photo, index) => (
            <div className="photo-card" key={`${photo.id}-${index}`}>
              <div className="photo-card-info">
                <div className="photo-card-item">
                  <p>{photo.date}</p>
                </div>
                <div className="photo-card-item">
                  <p>{photo.title}</p>
                </div>
                <div className="photo-card-item">
                  <p>{photo.category}</p>
                </div>
              </div>

              <div 
                className="photo-image-container"
                onClick={(e) => handlePhotoClick(photo, e)}
              >
                <img 
                  src={photo.src} 
                  alt={photo.title}
                  className="photo-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="photo-overlay">
                  <span className="view-full-text">View Full</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="carousel-hint">
          <p>Click background to rotate • Click photos to view</p>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closeModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-image-container">
              <img 
                src={selectedPhoto.src} 
                alt={selectedPhoto.title}
                className="modal-image"
                loading="eager"
              />
            </div>
            <div className="modal-info">
              <h3>{selectedPhoto.title}</h3>
              <p>{selectedPhoto.category} • {selectedPhoto.date}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoCarousel; 