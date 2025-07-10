import React from 'react';

export const MagicCard = ({ children, className = '' }) => {
  return (
    <div
      className={`group relative rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-xl ${className}`}
      style={{
        boxShadow: '0 0 100px 10px rgba(0, 0, 0, 0.15)',
        '--transition-duration': '0.3s',
      }}
    >

      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 