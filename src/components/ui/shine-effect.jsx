import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

export const ShineEffect = ({
  children,
  className,
  containerClassName,
  shine = true,
  ...props
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const ref = useRef(null);
  const isMoving = useRef(false);
  
  // Use requestAnimationFrame for smooth hover effect
  const handleMouseMove = (e) => {
    if (!shine || isMoving.current) return;
    
    isMoving.current = true;
    
    requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
      setOpacity(0.7);
      isMoving.current = false;
    });
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Clean up any animation frames
  useEffect(() => {
    return () => {
      isMoving.current = false;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden rounded-2xl", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Shine effect with hardware acceleration */}
      <div
        className="pointer-events-none absolute -inset-px will-change-opacity"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.2), transparent 40%)`,
          zIndex: 20,
          transform: 'translateZ(0)',
          transition: 'opacity 0.2s ease-out',
        }}
      />
      
      {/* Content */}
      <div className={cn("relative h-full", containerClassName)}>
        {children}
      </div>
    </div>
  );
}; 