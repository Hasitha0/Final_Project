import React from "react";
import { cn } from "../../utils/cn";

export const AnimatedShinyText = ({ 
  children, 
  className, 
  animationType = "default"
}) => {
  const variants = {
    default: "animate-shiny-text bg-emerald-500",
    gradient: "animate-shiny-text-gradient bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600",
  };

  const selectedVariant = variants[animationType] || variants.default;
  
  return (
    <span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        selectedVariant,
        className
      )}
      style={{
        backgroundSize: "200% auto",
      }}
    >
      {children}
    </span>
  );
}; 