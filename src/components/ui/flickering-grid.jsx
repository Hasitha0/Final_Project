import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export const FlickeringGrid = ({
  className,
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(34, 197, 94)",
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    const cols = Math.floor(canvas.width / (squareSize + gridGap));
    const rows = Math.floor(canvas.height / (squareSize + gridGap));

    const squares = [];
    for (let i = 0; i < cols; i++) {
      squares[i] = [];
      for (let j = 0; j < rows; j++) {
        squares[i][j] = {
          opacity: Math.random() * maxOpacity,
          flickering: false,
        };
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const square = squares[i][j];
          
          // Random flickering
          if (Math.random() < flickerChance * 0.01) {
            square.flickering = !square.flickering;
            square.opacity = square.flickering 
              ? Math.random() * maxOpacity 
              : Math.random() * maxOpacity * 0.3;
          }

          if (square.opacity > 0) {
            ctx.fillStyle = color.replace('rgb(', 'rgba(').replace(')', `, ${square.opacity})`);
            ctx.fillRect(
              i * (squareSize + gridGap),
              j * (squareSize + gridGap),
              squareSize,
              squareSize
            );
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
      {...props}
    />
  );
}; 