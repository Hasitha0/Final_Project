import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export const AnimatedGridPattern = ({
  width = 40,
  height = 40,
  numSquares = 50,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  className,
  ...props
}) => {
  const id = React.useId();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const squares = container.querySelectorAll('.animated-square');
    
    squares.forEach((square, index) => {
      const delay = (index * duration) / numSquares + Math.random() * repeatDelay;
      square.style.animationDelay = `${delay}s`;
    });
  }, [duration, numSquares, repeatDelay]);

  const generateSquares = () => {
    const squares = [];
    for (let i = 0; i < numSquares; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      squares.push(
        <rect
          key={i}
          className="animated-square"
          width={width}
          height={height}
          x={`${x}%`}
          y={`${y}%`}
          fill="currentColor"
          opacity="0"
          style={{
            animation: `fadeInOut ${duration}s ease-in-out infinite`,
          }}
        />
      );
    }
    return squares;
  };

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        className="h-full w-full"
        style={{
          maskImage: 'radial-gradient(ellipse at center, white, transparent 70%)',
        }}
      >
        <defs>
          <pattern
            id={`${id}-pattern`}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={width}
              height={height}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-pattern)`}
          className="text-gray-400"
        />
        {generateSquares()}
      </svg>
      
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: ${maxOpacity}; }
        }
      `}</style>
    </div>
  );
}; 