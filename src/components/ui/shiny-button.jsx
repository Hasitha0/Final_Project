import React from 'react';
import { cn } from '../../utils/cn';

export const ShinyButton = ({
  children,
  className,
  onClick,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
      <span
        className={cn(
          'inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md px-6 py-2 text-sm font-medium backdrop-blur-3xl',
          variant === 'primary'
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'bg-white/10 text-white hover:bg-white/20'
        )}
      >
        {children}
      </span>
    </button>
  );
}; 