import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://framerusercontent.com/images/mloIhuklrhI5BFUacMMCzhmZHxQ.jpg",
    "https://framerusercontent.com/images/PPEllho3AF9c2nOji5oLm3FNx0s.jpg",
    "https://framerusercontent.com/images/noGm4cyaXzYmGjjRJvR1Yjcg.jpg",
    "https://framerusercontent.com/images/bABuIXzTPD8PxqWUg0bWyneTpc.jpg",
    "https://framerusercontent.com/images/LW4HjXF0shedHVgnqtiGVWQGgKI.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((currentSlide + 1) % (slides.length - 4));
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  const handlePrev = () => setCurrentSlide((currentSlide - 1 + (slides.length - 4)) % (slides.length - 4));
  const handleNext = () => setCurrentSlide((currentSlide + 1) % (slides.length - 4));

  const getScale = (index: number) => {
    const centerIndex = 2; // Central image is the 3rd of 5 visible
    const distance = Math.abs(index - centerIndex);
    return 1 - (distance * 0.2); // Reduces by 20% per step from center
  };

  return (
    <div style={{ width: '100%', height: '547px', position: 'relative', background: '#f0f0f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', transition: 'transform 0.5s ease', transform: `translateX(-${currentSlide * (375 + 10)}px)` }}>
        {slides.map((src, index) => {
          const isVisible = index >= currentSlide && index < currentSlide + 5;
          const adjustedIndex = index - currentSlide;
          const scale = isVisible ? getScale(adjustedIndex) : 0;
          const opacity = isVisible ? 1 : 0;
          const width = 375 * scale;
          const leftOffset = adjustedIndex * (375 + 10);

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${leftOffset}px`,
                width: `${width}px`,
                height: '547px',
                borderRadius: '20px',
                overflow: 'hidden',
                transform: `scale(${scale})`,
                opacity: opacity,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }}
            >
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(to right, transparent ${adjustedIndex <= 1 ? '60%' : '0'}, rgba(255, 255, 255, 0.9) ${adjustedIndex <= 2 ? '80%' : '20%'})`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
      <button
        style={{
          position: 'absolute',
          top: '50%',
          left: '385px',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.7)',
          border: 'none',
          borderRadius: '50%',
          color: '#000',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'background 0.3s ease, transform 0.3s ease',
        }}
        onClick={handlePrev}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'rgba(255, 255, 255, 0.9)';
          target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'rgba(255, 255, 255, 0.7)';
          target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        {'<'}
      </button>
      <button
        style={{
          position: 'absolute',
          top: '50%',
          right: '385px',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.7)',
          border: 'none',
          borderRadius: '50%',
          color: '#000',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'background 0.3s ease, transform 0.3s ease',
        }}
        onClick={handleNext}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'rgba(255, 255, 255, 0.9)';
          target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.background = 'rgba(255, 255, 255, 0.7)';
          target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        {'>'}
      </button>
      <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        {[...Array(slides.length - 4)].map((_, index) => (
          <button
            key={index}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
              border: 'none',
              margin: '0 5px',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;