import React, { useState, useEffect } from 'react';

export const WordRotate = ({ words = [], className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className={`relative h-8 overflow-hidden ${className}`}>
      {words.map((word, index) => (
        <div
          key={index}
          className="absolute w-full text-center transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateY(${(index - currentIndex) * 100}%)`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          {word}
        </div>
      ))}
    </div>
  );
}; 