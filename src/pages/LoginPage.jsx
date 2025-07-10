import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GridPattern } from '../components/ui/grid-pattern';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for URL parameters to show messages
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      switch (urlMessage) {
        case 'confirmation-failed':
          setError('Email confirmation failed. Please try logging in or contact support.');
          break;
        case 'registration-complete':
          setMessage('🎉 Registration completed successfully! Welcome to EcoTech - please login to get started.');
          break;
        default:
          break;
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login for:', email);
      const response = await login(email, password);
      console.log('Login response:', response);
      
      // Check if login failed
      if (response.error) {
        console.log('Login failed with error:', response.error);
        setError(response.error);
        return;
      }

      // Check if user exists in response
      if (!response.user) {
        console.log('Login failed: No user in response');
        setError('Login failed. Please try again.');
        return;
      }
      
      console.log('Login successful, user role:', response.user.role);
      
      // Redirect based on user role (RBAC)
      switch (response.user.role) {
        case 'PUBLIC':
          navigate('/'); // Public users go to homepage
          break;
        case 'COLLECTOR':
          navigate('/dashboard'); // Collectors go to dashboard
          break;
        case 'RECYCLING_CENTER':
          navigate('/dashboard'); // Recycling centers go to dashboard
          break;
        case 'ADMIN':
          navigate('/dashboard'); // Admins go to dashboard
          break;
        default:
          // Fallback for unknown roles
          navigate('/');
          break;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden pt-16 transition-all duration-500 bg-black">
      {/* Global Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.15);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 185, 129, 0.25);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(16, 185, 129, 0.15) transparent;
          }
        `
      }} />

      {/* Modern Black Grid Background - Dark Mode Only */}
      {isDarkMode && (
        <div className="absolute inset-0 z-0">
          {/* Base Grid Pattern */}
          <GridPattern
            width={120}
            height={120}
            className="fill-emerald-500/4 stroke-emerald-500/10"
            squares={[
              [1, 1], [3, 2], [5, 4], [7, 6], [9, 8],
              [2, 7], [4, 9], [6, 11], [8, 13], [10, 15],
              [1, 5], [3, 8], [5, 10], [7, 12], [9, 14],
              [2, 3], [4, 5], [6, 7], [8, 9], [10, 11]
            ]}
          />
          
          {/* Animated Grid Overlay */}
          <AnimatedGridPattern
            numSquares={25}
            maxOpacity={0.06}
            duration={5}
            repeatDelay={2}
            className="fill-cyan-500/3 stroke-cyan-500/8 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          
          {/* Subtle Glow Effects */}
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-radial from-emerald-500/6 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-cyan-500/4 to-transparent rounded-full blur-3xl" />
        </div>
      )}

      {/* Light Mode Background Elements */}
      {!isDarkMode && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse bg-emerald-400/20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 bg-blue-400/20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 bg-emerald-300/15"></div>
        </div>
      )}

      {/* Decorative Elements - Reduced for mobile */}
      <div className={`absolute inset-0 transition-all duration-500 z-5 ${isDarkMode ? 'opacity-12' : 'opacity-30'}`}>
        <svg className={`absolute top-20 left-20 w-24 h-24 lg:w-32 lg:h-32 transition-all duration-500 ${
          isDarkMode ? 'text-emerald-400/15' : 'text-emerald-500/40'
        }`} fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 5C25 5 5 25 5 50s20 45 45 45 45-20 45-45S75 5 50 5zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35z"/>
          <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
        </svg>
        <svg className={`absolute bottom-20 right-20 w-16 h-16 lg:w-24 lg:h-24 transition-all duration-500 ${
          isDarkMode ? 'text-cyan-400/15' : 'text-blue-500/40'
        }`} fill="currentColor" viewBox="0 0 100 100">
          <polygon points="50,5 95,75 5,75"/>
        </svg>
        <svg className={`absolute top-1/2 left-4 lg:left-10 w-12 h-12 lg:w-16 lg:h-16 transition-all duration-500 ${
          isDarkMode ? 'text-emerald-300/12' : 'text-emerald-400/30'
        }`} fill="currentColor" viewBox="0 0 100 100">
          <rect x="20" y="20" width="60" height="60" rx="10"/>
        </svg>
        
        {/* Additional Grid-inspired Decorative Elements for Dark Mode */}
        {isDarkMode && (
          <>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-emerald-400/25 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-300/30 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/6 left-1/6 w-1.5 h-1.5 bg-cyan-300/20 rounded-full animate-pulse delay-1500"></div>
          </>
        )}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="w-full max-w-7xl flex items-center justify-between h-full">
          
          {/* Left Side - Welcome Content */}
          <div className="hidden xl:flex flex-col justify-center w-1/2 pr-8 2xl:pr-12">
            <div className="space-y-6 2xl:space-y-8">
              <div>
                <h1 className="text-4xl 2xl:text-6xl font-bold mb-3 2xl:mb-4 leading-tight transition-all duration-500 text-white">
                  Welcome Back to
                  <span className="block bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 from-emerald-400 to-teal-400">
                    EcoTech
                  </span>
                </h1>
                <p className="text-lg 2xl:text-xl leading-relaxed transition-all duration-500 text-gray-300">
                  Continue your journey towards a sustainable future. Access your dashboard, 
                  manage your e-waste pickups, and track your environmental impact.
                </p>
              </div>
              
              <div className="space-y-3 2xl:space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-50 border border-emerald-200 shadow-sm'
                  }`}>
                    <svg className={`w-5 h-5 2xl:w-6 2xl:h-6 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Access your personalized dashboard</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-100 border border-emerald-300'
                  }`}>
                    <svg className={`w-5 h-5 2xl:w-6 2xl:h-6 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Manage your pickup schedules</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-100 border border-emerald-300'
                  }`}>
                    <svg className={`w-5 h-5 2xl:w-6 2xl:h-6 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>View your impact analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full xl:w-1/2 max-w-lg mx-auto flex items-center justify-center h-full">
            {/* Glassmorphism Container */}
            <div className="relative w-full flex items-center justify-center">
              {/* Glass Effect Background */}
              <div className={`absolute inset-0 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-gray-900/40 border border-emerald-400/20 shadow-emerald-500/10' 
                  : 'bg-white/70 border border-white/40'
              }`}></div>
              
              {/* Additional Grid Pattern Overlay for Dark Mode */}
              {isDarkMode && (
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl overflow-hidden">
                  <GridPattern
                    width={30}
                    height={30}
                    className="fill-emerald-500/5 stroke-emerald-500/10 opacity-40"
                    squares={[[1, 1], [3, 3], [5, 5], [7, 7], [9, 9]]}
                  />
                </div>
              )}
              
              {/* Form Content */}
              <div className="relative z-10 w-full p-6 lg:p-8">
                {/* EcoTech Logo/Branding - Mobile Only */}
                <div className="xl:hidden text-center mb-6">
                  <div className={`inline-flex items-center space-x-3 transition-all duration-500 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-emerald-500/20 border border-emerald-400/30' 
                        : 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    }`}>
                      <svg className={`w-5 h-5 transition-all duration-500 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                      isDarkMode ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-blue-600'
                    }`}>
                      EcoTech
                    </span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6 lg:mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl backdrop-blur-sm mb-3 lg:mb-4 transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-100 border border-emerald-300'
                  }`}>
                    <svg className={`w-6 h-6 lg:w-8 lg:h-8 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 transition-all duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
            Welcome Back
          </h2>
                  <p className={`text-sm lg:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
            Sign in to your account to continue
          </p>
        </div>

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className={`block text-sm font-medium transition-all duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Email Address
              </label>
                    <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/80 border border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
            </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className={`block text-sm font-medium transition-all duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                Password
              </label>
                    <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/80 border border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter your password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
            </div>
          </div>

                  {/* Success Message */}
          {message && (
                    <div className={`p-3 lg:p-4 backdrop-blur-sm rounded-lg lg:rounded-xl transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-emerald-500/20 border border-emerald-400/30' 
                        : 'bg-emerald-100 border border-emerald-300'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm transition-all duration-500 ${
                          isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>{message}</span>
                      </div>
            </div>
          )}

                  {/* Error Message */}
          {error && (
                    <div className={`p-3 lg:p-4 backdrop-blur-sm rounded-lg lg:rounded-xl transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-red-500/20 border border-red-400/30' 
                        : 'bg-red-100 border border-red-300'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm transition-all duration-500 ${
                          isDarkMode ? 'text-red-300' : 'text-red-700'
                        }`}>{error}</span>
                      </div>
            </div>
          )}

                  {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
                    className={`w-full relative overflow-hidden font-semibold py-2.5 lg:py-3 px-6 rounded-lg lg:rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm lg:text-base ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white' 
                        : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                    <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                        : 'bg-gradient-to-r from-emerald-700 to-blue-700'
                    }`}></div>
            </button>
        </form>

                {/* Footer Content */}
                <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4">
                  {/* Sign Up Link */}
        <div className="text-center">
                    <p className={`text-sm lg:text-base transition-all duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
            Don't have an account?{' '}
            <a
              href="/register"
                        className={`font-semibold transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-emerald-400 hover:text-emerald-300' 
                            : 'text-emerald-600 hover:text-emerald-500'
                        }`}
            >
                        Sign up here
            </a>
          </p>
                  </div>

                  {/* Branding */}
                  <div className="text-center">
                    <div className={`inline-flex items-center space-x-2 text-xs lg:text-sm transition-all duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>Powered by</span>
                      <span className={`font-semibold transition-all duration-500 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>EcoTech</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;