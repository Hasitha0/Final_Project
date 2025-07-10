import React from 'react';

export const ShimmerButton = ({ children, disabled, className = '', ...props }) => {
  return (
    <button
      disabled={disabled}
      className={`relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-green-500 to-blue-500 px-8 py-2 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_2rem_-0.5rem_#3b82f6] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent"
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    </button>
  );
}; 