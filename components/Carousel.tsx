import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://framerusercontent.com/images/mloIhuklrhI5BFUacMMCzhmZHxQ.jpg",
    "https://framerusercontent.com/images/PPEllho3AF9c2nOji5oLm3FNx0s.jpg",
    "https://framerusercontent.com/images/noGm4cyaXzYmGjjRJvR1Yjcg.jpg",
    "https://framerusercontent.com/images/bABuIXzTPD8PxqWUg0bWyneTpc.jpg",
    "https://framerusercontent.com/images/LW4HjXF0shedHVgnqtiGVWQGgKI.jpg"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((currentSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  const handlePrev = () => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
  const handleNext = () => setCurrentSlide((currentSlide + 1) % slides.length);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative', background: '#f0f0f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: `${slides.length * 100}%`, height: '100%', transition: 'transform 0.5s ease', transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((src, index) => (
          <div key={index} style={{ width: `${100 / slides.length}%`, height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
            <img src={src} alt={`Slide ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
      <button
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '10px', width: '40px', height: '40px', background: 'rgba(0, 0, 0, 0.5)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '20px', cursor: 'pointer', zIndex: 1 }}
        onClick={handlePrev}
      >
        &lt;
      </button>
      <button
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '10px', width: '40px', height: '40px', background: 'rgba(0, 0, 0, 0.5)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '20px', cursor: 'pointer', zIndex: 1 }}
        onClick={handleNext}
      >
        &gt;
      </button>
      <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)', border: 'none', margin: '0 5px', cursor: 'pointer', padding: 0 }}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;