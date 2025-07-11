import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GridPattern } from '../components/ui/grid-pattern';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';

const CareerPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    serviceArea: '',
    vehicleType: '',
    licenseNumber: '',
    availability: '',
    preferredSchedule: '',
    additionalInfo: '',
    role: 'COLLECTOR'
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

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

  // Check if email already exists in profiles or has pending application
  const checkEmailExists = async (email) => {
    if (!validateEmail(email)) return false;
    
    try {
      setIsCheckingEmail(true);
      const { supabase } = await import('../lib/supabase');
      
      // Check if email exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking email in profiles:', profileError);
        return false;
      }
      
      if (profileData) {
        return true; // Email already exists in profiles
      }
      
      // Check if there's already a pending or approved application in collector_applications table
      const { data: existingApplication, error: appError } = await supabase
        .from('collector_applications')
        .select('status')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      
      if (appError) {
        console.error('Error checking existing applications:', appError);
      }
      
      if (existingApplication) {
        if (existingApplication.status === 'pending') {
          setError('You already have a pending collector application. Please wait for review.');
        } else if (existingApplication.status === 'approved') {
          setError('You have an approved application. Please contact support for account access.');
        } else if (existingApplication.status === 'rejected') {
          setError('Your previous application was rejected. Please contact support before reapplying.');
        }
        return true;
      }
      
      return false;
      
    } catch (err) {
      console.error('Error checking email:', err);
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
        } else if (value.length > 255) {
          errors.email = 'Email is too long (max 255 characters)';
          setEmailExists(false);
        } else {
          delete errors.email;
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
        } else if (value.trim().length > 255) {
          errors.name = 'Name is too long (max 255 characters)';
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
        } else if (value.length > 20) {
          errors.phone = 'Phone number is too long';
        } else {
          delete errors.phone;
        }
        break;
      case 'addressLine1':
        if (!value.trim()) {
          errors.addressLine1 = 'Address is required';
        } else if (value.trim().length < 5) {
          errors.addressLine1 = 'Please enter a complete address';
        } else if (value.trim().length > 255) {
          errors.addressLine1 = 'Address is too long (max 255 characters)';
        } else {
          delete errors.addressLine1;
        }
        break;
      case 'addressLine2':
        if (value && value.trim().length > 255) {
          errors.addressLine2 = 'Address line 2 is too long (max 255 characters)';
        } else {
          delete errors.addressLine2;
        }
        break;
      case 'city':
        if (!value) {
          errors.city = 'Please select your city';
        } else {
          delete errors.city;
        }
        break;
      case 'serviceArea':
        if (!value.trim()) {
          errors.serviceArea = 'Service area is required';
        } else if (value.trim().length > 255) {
          errors.serviceArea = 'Service area is too long (max 255 characters)';
        } else {
          delete errors.serviceArea;
        }
        break;

      case 'vehicleType':
        if (!value) {
          errors.vehicleType = 'Please select your vehicle type';
        } else {
          delete errors.vehicleType;
        }
        break;
      case 'licenseNumber':
        if (!value.trim()) {
          errors.licenseNumber = 'License number is required';
        } else if (value.trim().length > 100) {
          errors.licenseNumber = 'License number is too long (max 100 characters)';
        } else {
          delete errors.licenseNumber;
        }
        break;
      case 'availability':
        if (!value) {
          errors.availability = 'Please select your availability';
        } else {
          delete errors.availability;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
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

    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Real-time validation
    if (name === 'email') {
      clearTimeout(window.emailValidationTimeout);
      window.emailValidationTimeout = setTimeout(() => {
        validateField(name, formattedValue);
      }, 1000);
    } else {
      validateField(name, formattedValue);
    }

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(formattedValue));
    }

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const confirmValue = name === 'confirmPassword' ? formattedValue : formData.confirmPassword;
      validateField('confirmPassword', confirmValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLoading) return;

    // Validate all required fields
    const requiredFields = ['name', 'email', 'phone', 'addressLine1', 'city', 'serviceArea', 'vehicleType', 'licenseNumber', 'availability', 'password', 'confirmPassword'];
    const errors = {};
    let hasErrors = false;

    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        hasErrors = true;
      }
    }

    if (emailExists) {
      errors.email = 'An account with this email already exists';
      hasErrors = true;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (passwordStrength.score < 3) {
      errors.password = 'Please create a stronger password';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      setError('Please correct the errors above');
      return;
    }

    setValidationErrors({});
    setIsLoading(true);

    try {
      const applicationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city,
        serviceArea: formData.serviceArea.trim(),
        vehicleType: formData.vehicleType,
        licenseNumber: formData.licenseNumber.trim(),
        availability: formData.availability,
        additionalInfo: formData.additionalInfo.trim() || null,
        password: formData.password,
        role: 'COLLECTOR'
      };
      
      console.log('Collector application data:', applicationData);
      
      // Register as COLLECTOR user (will be pending approval)
      const result = await register(applicationData);
      
      if (result && result.needsApproval) {
        console.log('Collector application submitted successfully:', result);
        setApplicationSubmitted(true);
      } else if (result && result.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError(`Application submission failed: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show application submitted screen
  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-green-400 mb-4">
            🚛 Application Submitted!
          </h1>
          
          <p className="text-gray-300 mb-4">
            Thank you for applying to become a waste collector with EcoTech!
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded text-left">
              <h3 className="font-semibold mb-2">📋 What's Next:</h3>
              <ol className="text-sm space-y-2">
                <li>1. Our team will review your application within 2-3 business days</li>
                <li>2. You'll receive an email notification with our decision</li>
                <li>3. If approved, you'll receive login credentials and can start collecting!</li>
                <li>4. If we need additional information, we'll contact you directly</li>
              </ol>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-semibold transition-colors"
            >
              🏠 Return to Home
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Questions? Contact{' '}
            <a href="mailto:careers@ecotech.com" className="text-green-400 underline">
              careers@ecotech.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white to-gray-50 text-black">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      <div className="relative">
        {/* Hero Banner Section */}
        <section 
          className="relative h-96 flex items-center justify-center bg-cover bg-center mb-12"
          style={{backgroundImage: 'url(/src/assets/images/career-hero.jpg)'}}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
              JOIN OUR TEAM
            </h1>
            <div className="flex items-center justify-center space-x-2 text-yellow-400 text-lg mb-8">
              <span className="text-white">EcoTech</span>
              <span className="text-yellow-400">—</span>
              <span>Waste Collector</span>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto px-4">
              Join our waste collection network and help build a sustainable future
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-7xl flex items-center justify-between h-full">
            
            {/* Left Side - Welcome Content */}
            <div className="hidden xl:flex flex-col justify-center w-1/2 pr-8 2xl:pr-12">
              <div className="space-y-6 2xl:space-y-8">
                <div>
                  <h2 className="text-4xl 2xl:text-5xl font-bold mb-3 2xl:mb-4 leading-tight text-gray-800">
                    Become a
                    <span className="block text-green-600">
                      Waste Collector
                    </span>
                  </h2>
                  <p className="text-lg 2xl:text-xl leading-relaxed text-gray-600">
                    Earn income while making a positive environmental impact.
                  </p>
                </div>
                
                <div className="space-y-3 2xl:space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center bg-green-100 border border-green-200">
                      <svg className="w-5 h-5 2xl:w-6 2xl:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm 2xl:text-base text-gray-600">Competitive earnings per collection</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center bg-green-100 border border-green-200">
                      <svg className="w-5 h-5 2xl:w-6 2xl:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm 2xl:text-base text-gray-600">Flexible working hours</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center bg-green-100 border border-green-200">
                      <svg className="w-5 h-5 2xl:w-6 2xl:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm 2xl:text-base text-gray-600">Full training and support provided</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full xl:w-1/2 max-w-lg mx-auto flex items-center justify-center h-full">
              <div className="relative w-full max-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl bg-white/90 border border-gray-200"></div>
                
                <div className="relative z-10 w-full p-6 lg:p-8 custom-scrollbar overflow-y-auto" style={{maxHeight: 'calc(100vh - 8rem)'}}>
                  <div className="flex flex-col justify-center min-h-full">
                    {/* Header */}
                    <div className="text-center mb-4 lg:mb-6 flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl backdrop-blur-sm mb-3 lg:mb-4 transition-all duration-500 bg-emerald-500/20">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8 transition-all duration-500 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 transition-all duration-500 text-gray-800">
                        Become a Collector
                      </h2>
                      <p className="text-sm lg:text-base transition-all duration-500 text-gray-600">
                        Join our waste collection network
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 flex-grow">
                      {/* Name Field */}
                      <div className="space-y-1">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                          placeholder="Enter your full name"
                        />
                        {validationErrors.name && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                            placeholder="Enter your email address"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {isCheckingEmail ? (
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : emailExists ? (
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : formData.email && validateEmail(formData.email) ? (
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-1">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                          placeholder="077-123-4567"
                          maxLength="12"
                        />
                        {validationErrors.phone && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>
                        )}
                      </div>

                      {/* Address Fields */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                            Address Line 1 *
                          </label>
                          <input
                            id="addressLine1"
                            name="addressLine1"
                            type="text"
                            required
                            value={formData.addressLine1}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                            placeholder="Street address, building number"
                          />
                          {validationErrors.addressLine1 && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.addressLine1}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            id="addressLine2"
                            name="addressLine2"
                            type="text"
                            value={formData.addressLine2}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                            placeholder="Apartment, suite, floor (optional)"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City/Town *
                          </label>
                          <select
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900"
                          >
                            <option value="">Select your city</option>
                            {gampahaDistrict.map(city => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                          {validationErrors.city && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.city}</p>
                          )}
                        </div>
                      </div>

                      {/* Service Area Field */}
                      <div className="space-y-1">
                        <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700">
                          Service Area / Working Region *
                        </label>
                        <input
                          id="serviceArea"
                          name="serviceArea"
                          type="text"
                          required
                          value={formData.serviceArea}
                          onChange={handleChange}
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                          placeholder="e.g., Gampaha District, Negombo Area"
                        />
                        {validationErrors.serviceArea && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.serviceArea}</p>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="space-y-1">
                        <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                          Vehicle Type *
                        </label>
                        <select
                          id="vehicleType"
                          name="vehicleType"
                          required
                          value={formData.vehicleType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="truck">Truck</option>
                          <option value="van">Van</option>
                          <option value="pickup">Pickup</option>
                          <option value="three-wheeler">Three-Wheeler</option>
                          <option value="other">Other</option>
                        </select>
                        {validationErrors.vehicleType && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.vehicleType}</p>
                        )}
                      </div>

                      {/* License and Availability */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div className="space-y-1">
                          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                            Driver's License Number *
                          </label>
                          <input
                            id="licenseNumber"
                            name="licenseNumber"
                            type="text"
                            required
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                            placeholder="License number"
                          />
                          {validationErrors.licenseNumber && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.licenseNumber}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                            Availability *
                          </label>
                          <select
                            id="availability"
                            name="availability"
                            required
                            value={formData.availability}
                            onChange={handleChange}
                            className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900"
                          >
                            <option value="">Select availability</option>
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="weekends">Weekends Only</option>
                            <option value="flexible">Flexible</option>
                          </select>
                          {validationErrors.availability && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.availability}</p>
                          )}
                        </div>
                      </div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div className="space-y-1">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base pr-10 bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                              placeholder="Create password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      passwordStrength.score <= 2 ? 'bg-red-500' : 
                                      passwordStrength.score <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className={`text-xs ${
                                  passwordStrength.score <= 2 ? 'text-red-600' : 
                                  passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {passwordStrength.strength}
                                </span>
                              </div>
                              {passwordStrength.feedback && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Missing: {passwordStrength.feedback}
                                </p>
                              )}
                            </div>
                          )}
                          {validationErrors.password && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base pr-10 bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                              placeholder="Confirm password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d={showConfirmPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} 
                                />
                              </svg>
                            </button>
                          </div>
                          {validationErrors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-1">
                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                          Additional Information (Optional)
                        </label>
                        <textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          rows={3}
                          value={formData.additionalInfo}
                          onChange={handleChange}
                          placeholder="Tell us about your relevant experience and why you'd be a great fit..."
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm lg:text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      {/* Terms and Conditions */}
                      <div className="space-y-1">
                        <div className="flex items-start space-x-3">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                          <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the{' '}
                            <a href="/terms" className="font-semibold text-emerald-600 hover:text-emerald-700">
                              Terms of Service
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" className="font-semibold text-emerald-600 hover:text-emerald-700">
                              Privacy Policy
                            </a>
                          </label>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 lg:p-4 rounded-lg lg:rounded-xl bg-red-50 border border-red-200">
                          <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-red-600">{error}</span>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading || !termsAccepted || emailExists || isCheckingEmail || Object.keys(validationErrors).length > 0}
                        className={`w-full relative overflow-hidden font-semibold py-2.5 lg:py-3 px-6 rounded-lg lg:rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm lg:text-base ${
                          (isLoading || !termsAccepted || emailExists || isCheckingEmail || Object.keys(validationErrors).length > 0)
                            ? 'bg-gray-400 text-white'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-[1.02]'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Submitting Application...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Collector Application</span>
                              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>
                    </form>

                    {/* Footer */}
                    <div className="flex-shrink-0 mt-4 lg:mt-6 text-center">
                      <p className="text-sm lg:text-base text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                          Sign in here
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default CareerPage; 