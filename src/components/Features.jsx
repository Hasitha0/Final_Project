import React from 'react';
import { ShineEffect } from './ui/shine-effect';
import { AnimatedShinyText } from './ui/animated-shiny-text';
import { WarpBackground } from './ui/warp-background';
import { BorderBeam } from './ui/border-beam';
import { MagicCard } from './ui/magic-card';
import { TextReveal } from './ui/text-reveal';
import { Meteors } from './ui/meteors';

const features = [
  {
    id: 1,
    title: 'Environmental Impact Tracking',
    description: 'Visualize your direct contribution to environmental conservation with real-time metrics and achievements.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    bgColor: 'from-emerald-800/80 to-emerald-600/70',
  },
  {
    id: 2,
    title: 'Rewards Ecosystem',
    description: 'Earn points, discounts, and exclusive offers from eco-friendly partners when you recycle regularly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    bgColor: 'from-teal-800/80 to-teal-600/70',
  },
  {
    id: 3,
    title: 'Community Engagement',
    description: 'Connect with like-minded individuals and participate in local environmental initiatives and clean-up events.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    bgColor: 'from-emerald-800/80 to-emerald-600/70',
  },
  {
    id: 4,
    title: 'Educational Resources',
    description: 'Access guides, tutorials, and expert insights on sustainable living practices and proper recycling methods.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    bgColor: 'from-teal-800/80 to-teal-600/70',
  },
  {
    id: 5,
    title: 'Seamless Scheduling',
    description: 'Book recycling pickups with a few taps, receive reminders, and manage your recycling calendar effortlessly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    bgColor: 'from-emerald-800/80 to-emerald-600/70',
  },
];

const FeatureCard = ({ feature }) => {
  return (
    <BorderBeam className="h-full" duration={3}>
      <MagicCard className="h-full">
        <ShineEffect>
          <div className="relative h-full flex flex-col rounded-xl p-8 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br overflow-hidden">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-90`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-5 rounded-full bg-white/10 p-3 w-16 h-16 flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                {feature.icon}
              </div>
              <TextReveal>
                <h3 className="mb-4 text-2xl font-semibold text-white">
                  {feature.title}
                </h3>
              </TextReveal>
              <p className="text-slate-300">{feature.description}</p>
            </div>

            {/* Subtle meteor effect */}
            <Meteors number={2} />
          </div>
        </ShineEffect>
      </MagicCard>
    </BorderBeam>
  );
};

const Features = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      {/* Background effect */}
      <WarpBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <TextReveal>
            <AnimatedShinyText 
              className="mb-6 text-5xl font-bold"
              animationType="gradient"
            >
              Features & Benefits
            </AnimatedShinyText>
          </TextReveal>
          <p className="mx-auto max-w-3xl text-lg text-slate-400">
            Our platform offers innovative tools and rewards to make recycling more 
            accessible, enjoyable, and impactful for everyone.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 