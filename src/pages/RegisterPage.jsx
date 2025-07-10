import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GridPattern } from '../components/ui/grid-pattern';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    role: 'PUBLIC'
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed email confirmation states - no longer using email verification
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Cleanup email validation timeout on unmount - MOVED TO TOP
  useEffect(() => {
    return () => {
      if (window.emailValidationTimeout) {
        clearTimeout(window.emailValidationTimeout);
      }
    };
  }, []);

          // Debug logging for application state
        console.log('RegisterPage: Render - applicationSubmitted:', applicationSubmitted);

  // Sri Lankan cities in Gampaha District
  const gampahaDistrict = [
    'Gampaha', 'Negombo', 'Katunayake', 'Ja-Ela', 'Wattala', 'Kelaniya',
    'Peliyagoda', 'Kadawatha', 'Ragama', 'Kiribathgoda', 'Delgoda',
    'Divulapitiya', 'Minuwangoda', 'Veyangoda', 'Mirigama', 'Dompe',
    'Yakkala', 'Nittambuwa', 'Ganemulla', 'Biyagama'
  ];

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('One lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('One uppercase letter');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('One number');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('One special character');

    const strength = score <= 2 ? 'Weak' : score <= 3 ? 'Medium' : 'Strong';
    const color = score <= 2 ? 'text-red-400' : score <= 3 ? 'text-yellow-400' : 'text-green-400';
    
    return { score, feedback: feedback.join(', '), strength, color };
  };

  // Phone number formatter for Sri Lankan format
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if email already exists
  const checkEmailExists = async (email) => {
    if (!validateEmail(email)) return false;
    
    try {
      setIsCheckingEmail(true);
      const { supabase } = await import('../lib/supabase');
      
      // Check if email exists in the profiles table
      // This is more reliable and doesn't trigger any auth actions
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle(); // Use maybeSingle to avoid errors when no results
      
      if (error) {
        console.error('Error checking email in profiles:', error);
        // On error, assume email doesn't exist to allow registration attempt
        return false;
      }
      
      // If data exists, email is already registered
      return data !== null;
      
    } catch (err) {
      console.error('Error checking email:', err);
      // On error, assume email doesn't exist to allow registration attempt
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Real-time field validation
  const validateField = async (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
          setEmailExists(false);
        } else if (!validateEmail(value)) {
          errors.email = 'Please enter a valid email address';
          setEmailExists(false);
        } else {
          delete errors.email;
          // Check if email exists (debounced)
          const exists = await checkEmailExists(value);
          if (exists) {
            errors.email = 'An account with this email already exists';
            setEmailExists(true);
          } else {
            setEmailExists(false);
          }
        }
        break;
      case 'name':
        if (!value.trim()) {
          errors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          errors.name = 'Name must be less than 100 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.name = 'Name can only contain letters and spaces';
        } else {
          delete errors.name;
        }
        break;
      case 'phone':
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!value) {
          errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          errors.phone = 'Please enter a valid phone number (xxx-xxx-xxxx)';
        } else {
          delete errors.phone;
        }
        break;
      case 'addressLine1':
        if (!value.trim()) {
          errors.addressLine1 = 'Address is required';
        } else if (value.trim().length < 5) {
          errors.addressLine1 = 'Please enter a complete address';
        } else {
          delete errors.addressLine1;
        }
        break;
      case 'city':
        if (!value) {
          errors.city = 'Please select your city';
        } else {
          delete errors.city;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (value.length > 128) {
          errors.password = 'Password must be less than 128 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply phone number formatting
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    // Clear network error when user starts typing
    if (networkError) {
      setNetworkError(false);
      setError('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Real-time validation (debounced for email)
    if (name === 'email') {
      // Clear previous email validation timeout
      clearTimeout(window.emailValidationTimeout);
      
      // Debounce email validation by 1 second
      window.emailValidationTimeout = setTimeout(() => {
        validateField(name, formattedValue);
      }, 1000);
    } else {
      validateField(name, formattedValue);
    }

    // Password strength check
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(formattedValue));
    }

    // Confirm password validation
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const confirmValue = name === 'confirmPassword' ? formattedValue : formData.confirmPassword;
      const passwordValue = name === 'password' ? formattedValue : formData.password;
      validateField('confirmPassword', confirmValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNetworkError(false);

    // Prevent multiple submissions
    if (isLoading) return;

    // Validate all fields
    const requiredFields = ['name', 'email', 'phone', 'addressLine1', 'city', 'password', 'confirmPassword'];
    const errors = {};
    let hasErrors = false;

    // Check all required fields
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        hasErrors = true;
      }
    }

    // Check if email exists
    if (emailExists) {
      errors.email = 'An account with this email already exists';
      hasErrors = true;
    }

    // Check terms acceptance
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    // Check password strength
    if (passwordStrength.score < 3) {
      errors.password = 'Please create a stronger password';
      hasErrors = true;
    }

    // Validate email format one more time
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate phone format
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      setError('Please correct the errors above');
      return;
    }

    // Clear validation errors if everything is valid
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Prepare registration data - preserve individual address fields
      const registrationData = {
        ...formData,
        // Keep individual address fields for proper database mapping
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        // Also create combined address for backward compatibility
        address: `${formData.addressLine1.trim()}${formData.addressLine2.trim() ? ', ' + formData.addressLine2.trim() : ''}, ${formData.city}`
      };
      
      console.log('RegisterPage: Attempting registration with data:', { 
        email: registrationData.email, 
        name: registrationData.name,
        city: registrationData.city 
      });
      
      const result = await register(registrationData);
      
      console.log('RegisterPage: Registration result:', result);
      
      // Handle different registration outcomes
      if (result && result.error) {
        // Registration failed - throw error to be caught by catch block
        throw new Error(result.error);
      } else if (result && result.needsApproval) {
        console.log('RegisterPage: Application submitted for approval:', result.email);
        console.log('RegisterPage: Setting applicationSubmitted to true');
        
        setApplicationSubmitted(true);
        setApplicationMessage(result.message);
        setRetryCount(0); // Reset retry count on success
        
        // Add a small delay to ensure state is set
        setTimeout(() => {
          console.log('RegisterPage: State after setting application submitted:', {
            applicationSubmitted: true
          });
        }, 100);
        
      } else if (result && result.user) {
        // Direct registration success for PUBLIC users
        console.log('RegisterPage: Direct registration success, navigating to home');
        navigate('/'); // Navigate to home page for PUBLIC users
      } else {
        // Unexpected result format
        console.error('RegisterPage: Unexpected registration result format:', result);
        throw new Error('Registration completed but received unexpected response format');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // Handle specific error types with detailed messages
      let errorMessage = '';
      
      if (err.message.includes('already exists') || err.message.includes('duplicate') || err.message.includes('already registered')) {
        errorMessage = 'An account with this email address already exists. Please try signing in instead.';
        setEmailExists(true);
        setValidationErrors({ email: 'Email already exists' });
      } else if (err.message.includes('password')) {
        errorMessage = 'Password requirements not met. Please ensure your password is strong enough.';
        setValidationErrors({ password: 'Password too weak' });
      } else if (err.message.includes('email') && err.message.includes('invalid')) {
        errorMessage = 'Please enter a valid email address.';
        setValidationErrors({ email: 'Invalid email format' });
      } else if (err.message.includes('network') || err.message.includes('connection') || err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        setNetworkError(true);
      } else if (err.message.includes('rate limit') || err.message.includes('too many')) {
        errorMessage = 'Too many registration attempts. Please wait a moment and try again.';
      } else if (err.message.includes('service') || err.message.includes('server')) {
        errorMessage = 'Our servers are experiencing issues. Please try again in a few moments.';
        setNetworkError(true);
      } else {
        // Generic error with retry suggestion
        errorMessage = `Registration failed: ${err.message || 'Unknown error'}. Please try again.`;
        if (retryCount >= 2) {
          errorMessage += ' If the problem persists, please contact support.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry function for network errors
  const handleRetry = () => {
    setError('');
    setNetworkError(false);
    handleSubmit({ preventDefault: () => {} });
  };

  // Show application submitted screen for COLLECTOR/RECYCLING_CENTER users
  if (applicationSubmitted) {
    console.log('RegisterPage: Rendering application submitted screen');
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-green-400 mb-4">
            🎉 Application Submitted Successfully!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Your application has been submitted successfully and is being reviewed by our admin team.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded text-left">
              <h3 className="font-semibold mb-2">📋 Next Steps:</h3>
              <p className="text-sm text-gray-300 mb-3">{applicationMessage}</p>
              <ol className="text-sm space-y-2">
                <li>1. Admin will review your application</li>
                <li>2. You'll receive an email notification</li>
                <li>3. Once approved, you can login with your credentials</li>
              </ol>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-semibold transition-colors"
            >
              🔐 Go to Login Page
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setApplicationSubmitted(false);
                  setApplicationMessage('');
                  setError('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                ← Back to Form
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                🏠 Go Home
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-yellow-900/50 rounded text-yellow-200 text-sm">
            <strong>💡 Application Status:</strong><br/>
            Your application is being reviewed by our admin team. This usually takes 1-2 business days.
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Questions? Contact{' '}
            <a href="mailto:support@ecotech.com" className="text-green-400 underline">
              support@ecotech.com
            </a>
          </p>
        </div>
      </div>
    );
  }

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
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/75 to-black/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          
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
                  Join Our
                  <span className="block bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 from-emerald-400 to-teal-400">
                    EcoTech
                  </span>
                  Community
                </h1>
                <p className={`text-lg 2xl:text-xl leading-relaxed transition-all duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Be part of the sustainable future. Connect with eco-conscious individuals, 
                  schedule e-waste pickups, and make a positive impact on our planet.
                </p>
              </div>
              
              <div className="space-y-3 2xl:space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-100 border border-emerald-300'
                  }`}>
                    <svg className={`w-5 h-5 2xl:w-6 2xl:h-6 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Easy e-waste pickup scheduling</span>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Connect with verified collectors</span>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`text-sm 2xl:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Track your environmental impact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full xl:w-1/2 max-w-lg mx-auto flex items-center justify-center h-full">
            {/* Glassmorphism Container */}
            <div className="relative w-full max-h-[calc(100vh-8rem)] flex items-center justify-center">
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
              <div className="relative z-10 w-full p-6 lg:p-8 custom-scrollbar overflow-y-auto" style={{maxHeight: 'calc(100vh - 8rem)'}}>
                <div className="flex flex-col justify-center min-h-full">
                {/* Header */}
                <div className="text-center mb-4 lg:mb-6 flex-shrink-0">
                  <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl backdrop-blur-sm mb-3 lg:mb-4 transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-emerald-100 border border-emerald-300'
                  }`}>
                    <svg className={`w-6 h-6 lg:w-8 lg:h-8 transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 transition-all duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Create Account
          </h2>
                  <p className={`text-sm lg:text-base transition-all duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Join our sustainable community today
          </p>
        </div>

                <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 flex-grow">
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label htmlFor="name" className={`block text-sm font-medium transition-all duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={(e) => validateField('name', e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border text-white placeholder-gray-400' 
                            : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                        } ${validationErrors.name ? 'border-red-400' : 'border-white/20'}`}
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {validationErrors.name && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className={`block text-sm font-medium transition-all duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={(e) => validateField('email', e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border text-white placeholder-gray-400' 
                            : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                        } ${validationErrors.email ? 'border-red-400' : emailExists ? 'border-red-400' : 'border-white/20'}`}
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isCheckingEmail ? (
                          <svg className={`w-4 h-4 lg:w-5 lg:h-5 animate-spin transition-all duration-500 ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : emailExists ? (
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : formData.email && validateEmail(formData.email) && !validationErrors.email ? (
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{validationErrors.email}</span>
                      </p>
                    )}
                    {emailExists && !validationErrors.email && (
                      <p className="text-amber-400 text-xs mt-1 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Already have an account? <a href="/login" className="underline font-semibold">Sign in here</a></span>
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1">
                    <label htmlFor="phone" className={`block text-sm font-medium transition-all duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border text-white placeholder-gray-400' 
                            : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                        } ${validationErrors.phone ? 'border-red-400' : 'border-white/20'}`}
                        placeholder="077-123-4567"
                        maxLength="12"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="addressLine1" className={`block text-sm font-medium transition-all duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Address Line 1 *
                      </label>
                      <input
                        id="addressLine1"
                        name="addressLine1"
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={handleChange}
                        onBlur={(e) => validateField('addressLine1', e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border text-white placeholder-gray-400' 
                            : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                        } ${validationErrors.addressLine1 ? 'border-red-400' : 'border-white/20'}`}
                        placeholder="Street address, building number"
                      />
                      {validationErrors.addressLine1 && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.addressLine1}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="addressLine2" className={`block text-sm font-medium transition-all duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Address Line 2 (Optional)
                      </label>
                      <input
                        id="addressLine2"
                        name="addressLine2"
                        type="text"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/80 border border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Apartment, suite, floor (optional)"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="city" className={`block text-sm font-medium transition-all duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        City/Town *
                      </label>
                      <select
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={(e) => validateField('city', e.target.value)}
                        className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base ${
                          isDarkMode 
                            ? 'bg-white/10 border text-white' 
                            : 'bg-white/80 border text-gray-900'
                        } ${validationErrors.city ? 'border-red-400' : 'border-white/20'}`}
                      >
                        <option value="">Select your city</option>
                        {gampahaDistrict.map(city => (
                          <option key={city} value={city} className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {validationErrors.city && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.city}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-1">
                      <label htmlFor="password" className={`block text-sm font-medium transition-all duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={(e) => validateField('password', e.target.value)}
                          className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base pr-10 ${
                            isDarkMode 
                              ? 'bg-white/10 border text-white placeholder-gray-400' 
                              : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                          } ${validationErrors.password ? 'border-red-400' : 'border-white/20'}`}
                          placeholder="Create password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} 
                            />
                          </svg>
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength.score <= 2 ? 'bg-red-400' : 
                                  passwordStrength.score <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                                }`}
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs ${passwordStrength.color || 'text-gray-400'}`}>
                              {passwordStrength.strength}
                            </span>
                          </div>
                          {passwordStrength.feedback && (
                            <p className="text-xs text-gray-400 mt-1">
                              Missing: {passwordStrength.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      {validationErrors.password && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="confirmPassword" className={`block text-sm font-medium transition-all duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={(e) => validateField('confirmPassword', e.target.value)}
                          className={`w-full px-3 py-2 lg:px-4 lg:py-2.5 backdrop-blur-sm rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 text-sm lg:text-base pr-10 ${
                            isDarkMode 
                              ? 'bg-white/10 border text-white placeholder-gray-400' 
                              : 'bg-white/80 border text-gray-900 placeholder-gray-500'
                          } ${validationErrors.confirmPassword ? 'border-red-400' : 'border-white/20'}`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-500 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={showConfirmPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} 
                            />
                          </svg>
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-1">
                    <div className="flex items-start space-x-3">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 text-emerald-600 bg-transparent border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label htmlFor="terms" className={`text-sm transition-all duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        I agree to the{' '}
                        <a href="/terms" className={`font-semibold transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-emerald-400 hover:text-emerald-300' 
                            : 'text-emerald-600 hover:text-emerald-500'
                        }`}>
                          Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="/privacy" className={`font-semibold transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-emerald-400 hover:text-emerald-300' 
                            : 'text-emerald-600 hover:text-emerald-500'
                        }`}>
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className={`p-3 lg:p-4 backdrop-blur-sm rounded-lg lg:rounded-xl transition-all duration-500 ${
                      isDarkMode 
                        ? networkError ? 'bg-amber-500/20 border border-amber-400/30' : 'bg-red-500/20 border border-red-400/30'
                        : networkError ? 'bg-amber-100 border border-amber-300' : 'bg-red-100 border border-red-300'
                    }`}>
                      <div className="flex items-start space-x-2">
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 transition-all duration-500 ${
                          isDarkMode 
                            ? networkError ? 'text-amber-400' : 'text-red-400'
                            : networkError ? 'text-amber-600' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={networkError 
                              ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            } 
                          />
                        </svg>
                        <div className="flex-1">
                          <span className={`text-sm transition-all duration-500 ${
                            isDarkMode 
                              ? networkError ? 'text-amber-300' : 'text-red-300'
                              : networkError ? 'text-amber-700' : 'text-red-700'
                          }`}>{error}</span>
                          {networkError && (
                            <div className="mt-2">
                              <button
                                onClick={handleRetry}
                                disabled={isLoading}
                                className={`text-xs font-semibold px-3 py-1 rounded-md transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 disabled:opacity-50'
                                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300 disabled:opacity-50'
                                }`}
                              >
                                {isLoading ? 'Retrying...' : 'Try Again'}
                              </button>
                            </div>
                          )}
                          {retryCount > 0 && !networkError && (
                            <div className="mt-1">
                              <span className={`text-xs transition-all duration-500 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Attempt {retryCount + 1} of 3
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !termsAccepted || emailExists || isCheckingEmail || Object.keys(validationErrors).length > 0}
                    className={`w-full relative overflow-hidden font-semibold py-2.5 lg:py-3 px-6 rounded-lg lg:rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm lg:text-base ${
                      (isLoading || !termsAccepted || emailExists || isCheckingEmail || Object.keys(validationErrors).length > 0)
                        ? 'bg-gray-400 text-gray-200'
                        : isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-[1.02]' 
                          : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white hover:scale-[1.02]'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Creating Account...</span>
                        </>
                      ) : isCheckingEmail ? (
                        <>
                          <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Checking Email...</span>
                        </>
                      ) : emailExists ? (
                        <>
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Email Already Exists</span>
                        </>
                      ) : !termsAccepted ? (
                        <>
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Accept Terms to Continue</span>
                        </>
                      ) : Object.keys(validationErrors).length > 0 ? (
                        <>
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Please Fix Errors</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                    {!isLoading && !emailExists && !isCheckingEmail && termsAccepted && Object.keys(validationErrors).length === 0 && (
                      <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                          : 'bg-gradient-to-r from-emerald-700 to-blue-700'
                      }`}></div>
                    )}
                  </button>
                </form>

                {/* Footer Content */}
                <div className="flex-shrink-0 mt-4 lg:mt-6 space-y-3 lg:space-y-4">
                  {/* Sign In Link */}
        <div className="text-center">
                    <p className={`text-sm lg:text-base transition-all duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
            Already have an account?{' '}
            <a
              href="/login"
                        className={`font-semibold transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-emerald-400 hover:text-emerald-300' 
                            : 'text-emerald-600 hover:text-emerald-500'
                        }`}
                      >
                        Sign in here
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
    </div>
  );
};

export default RegisterPage;