import React from 'react';
import { cn } from '../../utils/cn';

export const BorderBeam = ({ 
  children, 
  className, 
  containerClassName,
  duration = 2,
  borderClassName,
  ...props 
}) => {
  return (
    <div 
      className={cn("relative p-[1px] overflow-hidden rounded-xl group", className)}
      {...props}
    >
      {/* Border beam effect */}
      <div
        className={cn(
          "absolute inset-0 z-[1] h-full w-full rounded-xl [mask-image:linear-gradient(black,transparent)]",
          borderClassName
        )}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-70"
          style={{
            WebkitMaskImage: "conic-gradient(from 90deg at 50% 50%, #000 0%, transparent 35%, transparent 65%, #000 100%)",
            WebkitMaskSize: "300% 300%",
            WebkitMaskPosition: "50% 50%",
            WebkitAnimation: `borderBeam ${duration * 2}s infinite linear`,
            animation: `borderBeam ${duration * 2}s infinite linear`,
          }}
        />
      </div>

      {/* Content */}
      <div className={cn("relative z-10 w-full h-full", containerClassName)}>
        {children}
      </div>
    </div>
  );
}; 