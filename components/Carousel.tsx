import React, { useState } from 'react';

const images = [
  "https://framerusercontent.com/images/mloIhuklrhI5BFUacMMCzhmZHxQ.jpg",
  "https://framerusercontent.com/images/PPEllho3AF9c2nOji5oLm3FNx0s.jpg",
  "https://framerusercontent.com/images/noGm4cyaXzYmGjjRJvR1Yjcg.jpg",
  "https://framerusercontent.com/images/bABuIXzTPD8PxqWUg0bWyneTpc.jpg",
  "https://framerusercontent.com/images/LW4HjXF0shedHVgnqtiGVWQGgKI.jpg"
];

const getScale = (offset: number) => {
  // Center: 1, next to center: 0.7, outermost: 0.5, further: 0.3
  if (offset === 0) return 1;
  if (Math.abs(offset) === 1) return 0.7;
  if (Math.abs(offset) === 2) return 0.5;
  return 0.3;
};

const getZIndex = (offset: number) => 10 - Math.abs(offset);

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(2);
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);

  const handleClick = (idx: number) => setCurrent(idx);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % images.length);

  // Get indices of images to show
  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => {
    return (current - half + i + images.length) % images.length;
  });

  return (
    <div style={{ width: '100%', background: 'var(--cream, #FFFBF0)', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
      <button
        aria-label="Previous"
        onClick={handlePrev}
        style={{
          marginRight: 24,
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
      <div style={{ position: 'relative', width: '80vw', height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
        {visibleIndices.map((imgIdx, i) => {
          const offset = i - half;
          const scale = getScale(offset);
          const zIndex = getZIndex(offset);
          const isCenter = offset === 0;
          const baseWidth = 45; // as vw
          const baseHeight = 60; // as vh
          const width = `${baseWidth * scale}vw`;
          const height = `${baseHeight * scale}vh`;
          const translateY = isCenter ? '-5vh' : '0';
          return (
            <div
              key={imgIdx}
              style={{
                position: 'absolute',
                left: `calc(50% + ${(offset) * 22}vw - ${baseWidth * scale / 2}vw)`,
                top: 0,
                width,
                height,
                zIndex,
                borderRadius: 32,
                boxShadow: isCenter ? '0px 1px 2px 0px rgba(0,0,0,0.25)' : undefined,
                overflow: 'hidden',
                background: '#fff',
                cursor: 'pointer',
                transform: `translateY(${translateY}) scale(${scale})`,
                transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isCenter ? '3px solid #E57634' : 'none',
              }}
              onClick={() => handleClick(imgIdx)}
              tabIndex={0}
              aria-label={`Show image ${imgIdx + 1}`}
            >
              <img
                src={images[imgIdx]}
                alt="Carousel"
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
      <button
        aria-label="Next"
        onClick={handleNext}
        style={{
          marginLeft: 24,
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
    </div>
  );
};

export default Carousel;