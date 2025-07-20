import React, { useState, useEffect } from 'react';

const images = [
  "https://framerusercontent.com/images/mloIhuklrhI5BFUacMMCzhmZHxQ.jpg",
  "https://framerusercontent.com/images/PPEllho3AF9c2nOji5oLm3FNx0s.jpg",
  "https://framerusercontent.com/images/noGm4cyaXzYmGjjRJvR1Yjcg.jpg",
  "https://framerusercontent.com/images/bABuIXzTPD8PxqWUg0bWyneTpc.jpg",
  "https://framerusercontent.com/images/LW4HjXF0shedHVgnqtiGVWQGgKI.jpg"
];

const framerNames = [
  'Left2',
  'Left1',
  'Center',
  'Right1',
  'Right2',
];

const framerAppearIds = [
  'ggx6xi',
  '3qcaqp',
  'msdesd',
  'oqgtul',
  'rhfcax',
];

const borderRadius = 32;
const centerIndex = 2;

const getTransform = (i: number, current: number) => {
  const offset = i - current;
  let translateY = 0;
  let opacity = 1;
  if (offset === 0) {
    translateY = 40;
    opacity = 1;
  } else if (offset === -1 || offset === 1) {
    translateY = 80;
    opacity = 0.7;
  } else if (offset === -2 || offset === 2) {
    translateY = 120;
    opacity = 0.3;
  } else {
    opacity = 0;
  }
  return { translateY, opacity };
};

const Carousel = () => {
  const [current, setCurrent] = useState(centerIndex);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % images.length);

  // Calculate the visible indices (wrap around)
  const visibleIndices = [
    (current - 2 + images.length) % images.length,
    (current - 1 + images.length) % images.length,
    current,
    (current + 1) % images.length,
    (current + 2) % images.length,
  ];

  return (
    <div style={{ width: '100%', position: 'relative', background: 'var(--cream, #FFFBF0)', overflow: 'visible', minHeight: 600 }}>
      <div style={{ position: 'relative', width: '100%', height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {visibleIndices.map((imgIdx, i) => {
          const framerName = framerNames[i];
          const framerAppearId = framerAppearIds[i];
          const { translateY, opacity } = getTransform(i, centerIndex);
          const isCenter = i === centerIndex;
          const zIndex = isCenter ? 2 : 1;
          const boxShadow = isCenter ? '0px 1px 2px 0px rgba(0,0,0,0.25)' : undefined;
          return (
            <header
              key={framerName}
              className={`framer-${framerAppearId} framer-${framerName.toLowerCase()} framer-v-${framerName.toLowerCase()}`}
              data-framer-appear-id={framerAppearId}
              data-framer-name={framerName}
              style={{
                borderRadius: borderRadius,
                willChange: 'transform',
                opacity,
                transform: `translateY(${translateY}px)`,
                boxShadow,
                position: 'absolute',
                left: `calc(50% + ${(i - centerIndex) * 320}px - 200px)`,
                top: 0,
                width: isCenter ? 400 : 320,
                height: isCenter ? 540 : 480,
                zIndex,
                background: '#fff',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                borderBottomLeftRadius: borderRadius,
                borderBottomRightRadius: borderRadius,
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: borderRadius,
              }}
              tabIndex={isCenter || i === 1 || i === 3 ? 0 : undefined}
              data-highlight={isCenter || i === 1 || i === 3 ? true : undefined}
            >
              <div style={{ position: 'absolute', borderRadius: 'inherit', top: 0, right: 0, bottom: 0, left: 0 }}>
                <img
                  decoding="async"
                  src={images[imgIdx]}
                  alt=""
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    objectPosition: 'center',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </header>
          );
        })}
        {/* Overlay gradient */}
        <div
          className="framer-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(50% 85% at 50% 50%, rgba(255,255,255,0) 39%, rgba(255,254,253,0.13) 58%, var(--cream, #FFFBF0) 100%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
        {/* Left Arrow */}
        <button
          aria-label="Previous"
          style={{
            position: 'absolute',
            left: 'calc(50% - 320px - 40px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            color: '#000',
            fontSize: 24,
            cursor: 'pointer',
            zIndex: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s, transform 0.3s',
          }}
          onClick={handlePrev}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M 11.813 14.625 L 6.188 9 L 11.813 3.375" fill="transparent" strokeWidth="2" stroke="rgb(0,0,0)" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {/* Right Arrow */}
        <button
          aria-label="Next"
          style={{
            position: 'absolute',
            right: 'calc(50% - 320px - 40px)',
            top: '50%',
            transform: 'translateY(-50%) rotate(180deg)',
            width: 40,
            height: 40,
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            color: '#000',
            fontSize: 24,
            cursor: 'pointer',
            zIndex: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s, transform 0.3s',
          }}
          onClick={handleNext}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M 11.813 14.625 L 6.188 9 L 11.813 3.375" fill="transparent" strokeWidth="2" stroke="rgb(0,0,0)" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Carousel;