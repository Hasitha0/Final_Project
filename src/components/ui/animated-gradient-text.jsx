import React from 'react';

export const AnimatedGradientText = ({ children, className = '' }) => {
  return (
    <h1
      className={`bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-gradient ${className}`}
      style={{
        backgroundSize: '300% 300%',
        animation: 'gradient 8s ease infinite',
      }}
    >
      {children}
    </h1>
  );
}; 