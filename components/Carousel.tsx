'use client'

import React, { useState, useEffect } from 'react';
import { FrontendImageService, FrontendImageItem } from '@/lib/frontendImageService';

const getScale = (offset: number) => {
  if (offset === 0) return 1;
  if (Math.abs(offset) === 1) return 0.85;
  if (Math.abs(offset) === 2) return 0.7;
  return 0.6;
};

const Carousel: React.FC = () => {
  const [images, setImages] = useState<FrontendImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(2);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Responsive visible count based on screen width
  const getVisibleCount = () => {
    if (windowWidth < 768) return 1; // Mobile: 1 image
    if (windowWidth < 1024) return 3; // Tablet: 3 images
    return 5; // Desktop: 5 images
  };
  
  const visibleCount = getVisibleCount();
  const half = Math.floor(visibleCount / 2);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const carouselImages = await FrontendImageService.getCarouselImages();
        setImages(carouselImages);
        // Set current to middle of loaded images
        if (carouselImages.length > 0) {
          setCurrent(Math.floor(carouselImages.length / 2));
        }
      } catch (error) {
        console.error('Failed to load carousel images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (idx: number) => setCurrent(idx);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % images.length);

  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => {
    return (current - half + i + images.length) % images.length;
  });

  if (loading) {
    return (
      <div style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)', position: 'relative', marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '65vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#666' }}>Loading carousel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)', position: 'relative', marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '65vh' }}>
          <p style={{ color: '#666' }}>No carousel images available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)', position: 'relative', marginTop: '2rem', marginBottom: windowWidth < 768 ? '0.5rem' : '2rem' }}>
      {/* Left Button */}
      <button
        aria-label="Previous"
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: windowWidth < 768 ? '5%' : '18%',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M 11.813 14.625 L 6.188 9 L 11.813 3.375" fill="transparent" strokeWidth="2" stroke="rgb(0,0,0)" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {visibleCount > 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            background: 'radial-gradient( 60% 100% at 50% 50%, rgba(255,255,255,0) 50%, var(--cream, #FFFBF0) 70%, var(--cream, #FFFBF0) 100%)',
          }}
        />
      ) : null}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        {visibleIndices.map((imgIdx, i) => {
          const offset = i - half;
          const scale = getScale(offset);
          // Make images wider and shorter based on visible count
          const baseWidth = visibleCount === 1 ? 85 : visibleCount === 3 ? 32 : 24; // 85vw for single, 32vw for 3 images, 24vw for multiple
          const baseHeight = visibleCount === 1 ? 50 : visibleCount === 3 ? 45 : 65; // 50vh for single, 45vh for 3 images, 65vh for multiple
          const width = `${baseWidth * scale}vw`;
          const height = `${baseHeight * scale}vh`;
          return (
            <div
              key={imgIdx}
              style={{
                width,
                height,
                flex: '0 0 auto',
                borderRadius: 32,
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => handleClick(imgIdx)}
              tabIndex={0}
              aria-label={`Show image ${imgIdx + 1}`}
            >
              <img
                src={images[imgIdx]?.url || ''}
                alt={images[imgIdx]?.alt_text || `Carousel Image ${imgIdx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'inherit',
                  display: 'block',

                }}
              />
            </div>
          );
        })}
      </div>
      {/* Right Button */}
      <button
        aria-label="Next"
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: windowWidth < 768 ? '5%' : '18%',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ transform: 'rotate(180deg)' }}><path d="M 11.813 14.625 L 6.188 9 L 11.813 3.375" fill="transparent" strokeWidth="2" stroke="rgb(0,0,0)" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
};

export default Carousel;