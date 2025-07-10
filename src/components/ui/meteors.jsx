import React from 'react';

export const Meteors = ({ number = 20 }) => {
  const meteors = new Array(number || 20).fill(true);

  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className={`absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]`}
          style={{
            top: 0,
            left: Math.floor(Math.random() * 100) + '%',
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
          }}
        >
          <div className="fixed top-1/2 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-green-500 to-transparent" />
        </span>
      ))}
    </>
  );
}; 