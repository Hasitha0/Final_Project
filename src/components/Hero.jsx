import React from 'react';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { ShinyButton } from './ui/shiny-button';
import { Meteors } from './ui/meteors';
import { BorderBeam } from './ui/border-beam';
import { ShimmerButton } from './ui/shimmer-button';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { isAuthenticated, user } = useAuth();

  const scrollToPickupForm = () => {
    const pickupFormElement = document.getElementById('pickup-form-section');
    if (pickupFormElement) {
      pickupFormElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleVideoLoad = (e) => {
    console.log('Video loaded successfully:', e.target.src);
    console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
    console.log('Video duration:', e.target.duration);
  };

  const handleVideoError = (e) => {
    console.error('Video failed to load:', e.target.src, e.target.error);
    e.target.style.display = 'none';
  };

  const handleVideoPlay = (e) => {
    console.log('Video started playing:', e.target.src);
    console.log('Video current time:', e.target.currentTime);
  };

  const handleVideoCanPlay = (e) => {
    console.log('Video can play:', e.target.src);
    if (e.target.paused) {
      e.target.play().catch(err => {
        console.error('Failed to autoplay video:', err);
      });
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-900">
      {/* Video Background Container */}
      <div className="absolute inset-0 rounded-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onCanPlay={handleVideoCanPlay}
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/videos/hero-background.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Fallback gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-800 to-slate-900"
        style={{ zIndex: 0 }}
      />

      {/* Enhanced overlay with more black at top */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 via-black/20 to-transparent"
        style={{ zIndex: 2 }}
      />

      {/* Main Content Container - Clean Left-Aligned Layout */}
      <div 
        className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-3xl">
          {/* Clean Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">
                Transform
              </span>
              <br />
              <span className="text-emerald-400">
                E-Waste
              </span>
              <span className="text-white"> Into</span>
              <br />
              <span className="text-slate-200">
                Opportunity
              </span>
            </h1>
            
            {/* Subtle accent line */}
            <div className="w-16 h-0.5 bg-emerald-400 rounded-full mb-8"></div>
          </div>

          {/* Clean Description */}
          <p className="text-slate-100 text-xl lg:text-2xl mb-10 leading-relaxed font-light max-w-2xl">
            Join thousands in revolutionizing recycling through smart technology 
            and community-driven sustainability initiatives.
          </p>

          {/* Minimalist feature pills */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-100 text-sm font-medium">Carbon Neutral</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-100 text-sm font-medium">Smart Technology</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-purple-100 text-sm font-medium">Community Driven</span>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Find Centers Button - Primary Action */}
            <button 
              onClick={() => window.location.href = '/find-centers'}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 border border-emerald-400/20 backdrop-blur-sm overflow-hidden"
            >
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="relative z-10">Find Centers</span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            {/* Schedule Pickup Button - Secondary Action */}
            {isAuthenticated && user?.role === 'PUBLIC' && (
              <button 
                onClick={scrollToPickupForm}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 hover:from-slate-700/90 hover:via-slate-600/90 hover:to-slate-700/90 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-slate-500/20 border border-teal-400/30 hover:border-teal-400/50 backdrop-blur-md overflow-hidden"
              >
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/20 via-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="relative z-10">Schedule Pickup</span>
                
                {/* Subtle pulse effect */}
                <div className="absolute inset-0 rounded-xl border border-teal-400/20 animate-pulse"></div>
              </button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 