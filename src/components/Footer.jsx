import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FeedbackForm from './FeedbackForm';
import ContactSupportForm from './ContactSupportForm';
import { FlickeringGrid } from './ui/flickering-grid';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const containerRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);

  // Check if user should see feedback button (PUBLIC, COLLECTOR, RECYCLING_CENTER)
  const shouldShowFeedback = isAuthenticated && user && 
    ['PUBLIC', 'COLLECTOR', 'RECYCLING_CENTER'].includes(user.role);
  
  // Footer navigation links
  const footerLinks = {
    company: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
      { name: 'Career', path: '/career' },
      { name: 'Learn', path: '/learn' }
    ],
    services: [
      { name: 'Find Recycling Centers', path: '/find-centers' },
      { name: 'Recycling Center Staff', path: '/recycling-center' },
      { name: 'Collection Requests', path: '/collection-requests' },
      { name: 'Sustainability Tips', path: '/tips' }
    ],
    account: [
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' },
      { name: 'Dashboard', path: '/dashboard' }
    ]
  };

  return (
    <>
    <footer className="relative pt-16 pb-8 overflow-hidden bg-black">
      {/* FlickeringGrid Background Effect */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="absolute inset-0 opacity-20"
          squareSize={4}
          gridGap={6}
          color="#10b981"
          maxOpacity={0.6}
          flickerChance={0.1}
        />
      </div>

      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/95 to-black"></div>
      
      {/* Animated border beam at the top */}
      <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden">
        <div className="absolute inset-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[shimmer_3s_infinite]"></div>
      </div>

      {/* Premium glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-sm"></div>

      <div className="container mx-auto px-6 relative z-10" ref={containerRef}>
        {/* Premium decorative elements */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-emerald-400/30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/5 w-1 h-1 rounded-full bg-emerald-400/40 animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400/20 animate-pulse"></div>
          
          {/* Connecting lines */}
          <div className="absolute top-1/3 left-1/4 w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>
          <div className="absolute top-2/3 right-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>
        </div>

        {/* Top section with links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand and description with premium styling */}
          <div className="relative group">
            <div className="relative">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent mb-6 inline-block tracking-tight">
                EcoTech
              </h2>
              <div className="absolute -bottom-2 left-0 w-20 h-[3px] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
              <div className="absolute -bottom-2 left-0 w-20 h-[3px] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-sm opacity-50"></div>
            </div>
            
            <p className="mb-8 mt-8 text-gray-300 leading-relaxed text-lg">
              Revolutionizing recycling through technology. Join us in building a sustainable future for generations to come.
            </p>
            
            {/* Premium social media links */}
            <div className="flex space-x-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-400/20"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-400/20"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-400/20"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-400/20"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Premium navigation columns */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <div key={category} className="relative group">
              <div className="relative mb-8">
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <div className="absolute -bottom-2 left-0 w-16 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 scale-0 group-hover:scale-100 transition-transform duration-500 origin-left"></div>
                <div className="absolute -bottom-2 left-0 w-16 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 scale-0 group-hover:scale-100 transition-transform duration-500 origin-left blur-sm opacity-50"></div>
              </div>
              <ul className="space-y-4">
                {links.map((link, index) => (
                  <li key={index} className="group/link">
                    <Link 
                      to={link.path} 
                      className="relative text-gray-300 hover:text-emerald-400 transition-all duration-300 text-base leading-relaxed group-hover/link:translate-x-2 inline-block"
                    >
                      <span className="relative z-10">{link.name}</span>
                      <div className="absolute inset-0 -left-2 w-1 h-full bg-emerald-400 scale-y-0 group-hover/link:scale-y-100 transition-transform duration-300 origin-center rounded-full"></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

          {/* Premium Feedback Button Section - Only for specific roles */}
          {shouldShowFeedback && (
            <div className="flex justify-center mb-12">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:via-emerald-500 hover:to-cyan-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 border border-emerald-400/20"
              >
                {/* Feedback Icon */}
                <svg className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-lg tracking-wide">Share Your Feedback</span>
                
                {/* Premium shimmer effect */}
                <div className="absolute inset-0 -top-1 -bottom-1 -left-1 -right-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_ease-in-out] rounded-2xl"></div>
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          )}

          {/* Contact Support Button Section - Always visible */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setIsContactSupportOpen(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-blue-400/20"
            >
              {/* Support Icon */}
              <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-lg tracking-wide">Contact Support</span>
              
              {/* Premium shimmer effect */}
              <div className="absolute inset-0 -top-1 -bottom-1 -left-1 -right-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_ease-in-out] rounded-2xl"></div>
              
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        
        {/* Premium divider with enhanced glow */}
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent blur-sm"></div>
          
          <div className="py-10">
            {/* Premium bottom section with copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3">
                <p className="text-base text-gray-300 flex items-center">
                  <span className="inline-block mr-2 text-emerald-400 text-lg">©</span> 
                  <span className="font-medium">{currentYear} EcoTech.</span>
                  <span className="ml-1">All rights reserved.</span>
                </p>
                <div className="hidden md:block w-2 h-2 rounded-full bg-emerald-400/30 animate-pulse"></div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-wrap justify-center md:justify-end gap-8">
                <Link 
                  to="/privacy-policy" 
                  className="relative text-gray-300 hover:text-emerald-400 transition-all duration-300 text-base group/footer-link"
                >
                  <span className="relative z-10">Privacy Policy</span>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-400 group-hover/footer-link:w-full transition-all duration-300"></div>
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="relative text-gray-300 hover:text-emerald-400 transition-all duration-300 text-base group/footer-link"
                >
                  <span className="relative z-10">Terms of Service</span>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-400 group-hover/footer-link:w-full transition-all duration-300"></div>
                </Link>
                <Link 
                  to="/sitemap" 
                  className="relative text-gray-300 hover:text-emerald-400 transition-all duration-300 text-base group/footer-link"
                >
                  <span className="relative z-10">Sitemap</span>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-400 group-hover/footer-link:w-full transition-all duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Premium floating particles and effects */}
        <div className="absolute top-1/4 left-8 w-3 h-3 rounded-full bg-emerald-400/40 animate-pulse shadow-lg shadow-emerald-400/50"></div>
        <div className="absolute top-1/3 right-16 w-2 h-2 rounded-full bg-cyan-400/50 animate-ping shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-emerald-400/30 animate-pulse shadow-lg shadow-emerald-400/40"></div>
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-300/40 animate-ping shadow-lg shadow-emerald-300/50"></div>
        
        {/* Additional premium glow effects */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-400/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-emerald-400/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </footer>

      {/* Feedback Form Modal */}
      <FeedbackForm 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      {/* Contact Support Form Modal */}
      <ContactSupportForm 
        isOpen={isContactSupportOpen} 
        onClose={() => setIsContactSupportOpen(false)} 
      />
    </>
  );
};

export default Footer;
