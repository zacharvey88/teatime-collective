import React, { useState } from 'react';
import Image from 'next/image';

const images = [
  '/images/carousel-01.jpg',
  '/images/carousel-02.jpg',
  '/images/carousel-03.jpg',
  '/images/carousel-04.jpg',
  '/images/carousel-05.jpg',
];

const getScale = (offset: number) => {
  if (offset === 0) return 1;
  if (Math.abs(offset) === 1) return 0.85;
  if (Math.abs(offset) === 2) return 0.7;
  return 0.6;
};

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(2);
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);

  const handleClick = (idx: number) => setCurrent(idx);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % images.length);

  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => {
    return (current - half + i + images.length) % images.length;
  });

  return (
    <div style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)', position: 'relative', marginTop: '5rem', marginBottom: '5rem' }}>
      {/* Left Button */}
      <button
        aria-label="Previous"
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '18%',
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
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        {visibleIndices.map((imgIdx, i) => {
          const offset = i - half;
          const scale = getScale(offset);
          const width = `${24 * scale}vw`;
          const height = `${65 * scale}vh`;
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
                src={images[imgIdx]}
                alt={`Carousel Image ${imgIdx + 1}`}
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
          right: '18%',
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