import React from 'react';
import { MagicCard } from './ui/magic-card';
import { BorderBeam } from './ui/border-beam';
import { TextReveal } from './ui/text-reveal';

const steps = [
  {
    id: 1,
    title: 'Find Recycling Centers',
    description: 'Locate nearby recycling centers on our interactive map. Filter by the type of materials you need to recycle.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 11h.01" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Schedule Pickup',
    description: 'Request a convenient pickup time for your recyclables directly from your doorstep.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Earn Rewards',
    description: 'Get points for every recycling session that can be redeemed for discounts and eco-friendly products.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Track Impact',
    description: 'Monitor your environmental impact with detailed analytics showing how much waste you have diverted from landfills.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <TextReveal className="text-4xl font-bold text-white mb-4">
            How It Works
          </TextReveal>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our simple process makes recycling easier than ever before, helping you contribute to a more sustainable future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <BorderBeam key={step.id} className="h-full">
              <MagicCard className="bg-slate-900/70 p-8 rounded-xl h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-6 text-emerald-500">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                  <div className="mt-4 flex items-center justify-center bg-emerald-500/10 rounded-full w-10 h-10 text-emerald-500 font-bold">
                    {step.id}
                  </div>
                </div>
              </MagicCard>
            </BorderBeam>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 