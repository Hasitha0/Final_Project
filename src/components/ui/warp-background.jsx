import React from "react";
import { cn } from "../../utils/cn";

export const WarpBackground = ({ 
  className, 
  bgColors = ["from-green-900/20", "via-emerald-700/20", "to-teal-900/20"], 
  ...props 
}) => {
  const gradientClasses = cn(
    "absolute inset-0 bg-gradient-to-br animate-slow-spin", 
    ...bgColors
  );
  
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 z-[-1]">
        {/* Base layer with blur */}
        <div className={cn(gradientClasses, "opacity-30 blur-3xl")} />
        
        {/* Second layer rotated */}
        <div 
          className={cn(gradientClasses, "opacity-20 animate-reverse-slow-spin")} 
          style={{ transform: "rotate(30deg)" }}
        />
        
        {/* Subtle dotted grid overlay */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.15)_1px,transparent_1px)]" 
          style={{ backgroundSize: "20px 20px" }}
        />
      </div>
    </div>
  );
}; 