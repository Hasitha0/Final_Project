import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BorderBeam } from './ui/border-beam';
import { ShineEffect } from './ui/shine-effect';
import { ShinyButton } from './ui/shiny-button';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const dropdownRef = useRef(null);

  // Track scroll position for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.9;
      const hideThreshold = heroHeight - 100;
      
      setScrolled(scrollPosition > hideThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  // Simplified navigation structure with role-based filtering
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Recycling Centers', path: '/find-centers' },
    // Hide Career link for PUBLIC users since they don't need collector registration
    ...(!(isAuthenticated && user?.role === 'PUBLIC') ? [{ name: 'Career', path: '/career' }] : []),
    { name: 'Learn', path: '/learn' },
    { name: 'About Us', path: '/about' }
  ];

  const isActive = (path) => location.pathname === path;

  // Helper function to get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Icon components for dropdown
  const IconComponent = ({ type, className = "w-4 h-4" }) => {
    const iconProps = {
      className,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    };

    switch (type) {
      case 'dashboard':
        return (
          <svg {...iconProps}>
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
      case 'logout':
        return (
          <svg {...iconProps}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        );
      case 'chevron-down':
        return (
          <svg {...iconProps}>
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
        scrolled 
          ? 'opacity-0 -translate-y-full pointer-events-none' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Main navbar container - completely transparent premium look */}
      <div className="backdrop-blur-sm bg-transparent border-b border-white/10 shadow-2xl shadow-black/20">
        <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-16">
            
            {/* Logo Section - Far Left */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                {/* Logo with green accent dot like reference */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
                  <ShineEffect className="rounded-lg">
                    <AnimatedGradientText className="text-xl font-bold tracking-wide">
                      ECOTECH
                </AnimatedGradientText>
              </ShineEffect>
                </div>
            </Link>
          </div>

            {/* Center Navigation - Symmetrically Aligned */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center justify-center space-x-8 xl:space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-3 text-sm font-medium transition-all duration-500 group hover:scale-105 whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-400/30 shadow-lg shadow-emerald-500/20' 
                      : 'text-white/80 hover:text-white hover:bg-white/5 rounded-full'
                  }`}
                >
                  {link.name}
                  {/* Subtle glow effect for non-active items */}
                  {!isActive(link.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  )}
                </Link>
              ))}
              </div>
            </div>

            {/* Right Side - Far Right */}
            <div className="flex items-center space-x-4">
            {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-105 backdrop-blur-md shadow-lg shadow-black/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {user?.profile_picture_url ? (
                        <img 
                          src={user.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
                      >
                        {getUserInitials(user?.name)}
                      </div>
                    </div>
                    <span className="text-white text-sm font-medium hidden sm:block">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <IconComponent 
                      type="chevron-down" 
                      className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl backdrop-blur-xl bg-black/90 border border-white/20 shadow-2xl overflow-hidden z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                            {user?.profile_picture_url ? (
                              <img 
                                src={user.profile_picture_url} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
                            >
                              {getUserInitials(user?.name)}
                            </div>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user?.name || 'User'}</p>
                            <p className="text-emerald-400 text-sm">{user?.email}</p>
                          </div>
                        </div>
                        <p className="text-white/60 text-xs capitalize">{user?.role?.toLowerCase() || 'user'}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <IconComponent type="dashboard" className="w-4 h-4 mr-3" />
                          {user?.role?.toLowerCase() === 'public' ? 'My Profile' : 'Dashboard'}
                        </Link>
                <button 
                  onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <IconComponent type="logout" className="w-4 h-4 mr-3" />
                          Logout
                </button>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
                <div className="flex items-center space-x-3">
                  {/* Premium Sign In Button */}
                <button 
                  onClick={() => window.location.href = '/login'}
                    className="px-5 py-2.5 text-white/90 hover:text-white text-sm font-medium transition-all duration-500 hover:scale-105 hover:bg-white/10 rounded-full border border-white/20 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                  
                  {/* Premium CTA Button */}
                <button 
                  onClick={() => window.location.href = '/register'}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black font-semibold rounded-full hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 transition-all duration-500 hover:scale-110 shadow-2xl shadow-emerald-500/40 border border-white/30 backdrop-blur-sm relative overflow-hidden group"
                  >
                    <span className="relative z-10">Create Account</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
                </div>
            )}

          {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {!isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
          {isOpen && (
            <div className="lg:hidden border-t border-white/10 py-4">
              <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                    className={`block px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                  isActive(link.path)
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-400/20'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 bg-emerald-500/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                            {user?.profile_picture_url ? (
                              <img 
                                src={user.profile_picture_url} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
                            >
                              {getUserInitials(user?.name)}
                            </div>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user?.name || 'User'}</p>
                            <p className="text-emerald-400 text-xs">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {user?.role?.toLowerCase() === 'public' ? 'My Profile' : 'Dashboard'}
                      </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                        Logout
                </button>
                    </>
              ) : (
                    <>
                  <button 
                    onClick={() => {
                      window.location.href = '/login';
                      setIsOpen(false);
                    }}
                        className="block w-full text-left px-6 py-3 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition-all duration-300 border border-emerald-400/20"
                  >
                        Sign In
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = '/register';
                      setIsOpen(false);
                    }}
                        className="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-semibold rounded-lg hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-lg shadow-emerald-400/30 border border-emerald-300/20"
                  >
                        Create Account
                  </button>
                    </>
                  )}
                </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 