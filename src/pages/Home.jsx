import React from 'react';
import Hero from '../components/Hero';
import RequestPickupForm from '../components/RequestPickupForm';
import { useAuth } from '../context/AuthContext';
import { MagicCard } from '../components/ui/magic-card';
import { BorderBeam } from '../components/ui/border-beam';
import { TextReveal } from '../components/ui/text-reveal';
import { AnimatedShinyText } from '../components/ui/animated-shiny-text';
import { ShineEffect } from '../components/ui/shine-effect';
import { WarpBackground } from '../components/ui/warp-background';

// Import service images
import wasteCollectionImg from '../assets/images/service-waste-collection.jpg';
import recyclingCentersImg from '../assets/images/service-recycling-centers.jpg';
import smartSchedulingImg from '../assets/images/service-smart-scheduling.jpg';
import impactTrackingImg from '../assets/images/service-impact-tracking.jpg';

// Import Why Choose EcoTech images
import whyChooseCommissionImg from '../assets/images/why-choose-collector-commission.jpg';
import whyChooseSustainabilityImg from '../assets/images/why-choose-sustainability-fund.jpg';
import whyChoosePricingImg from '../assets/images/why-choose-transparent-pricing.jpg';
import whyChoosePlatformImg from '../assets/images/why-choose-multi-platform.jpg';

// Import How EcoTech Works images
import processSubmitImg from '../assets/images/process-submit-request.jpg';
import processPaymentImg from '../assets/images/process-secure-payment.jpg';
import processCollectionImg from '../assets/images/process-collection.jpg';
import processRecyclingImg from '../assets/images/process-recycling.jpg';
import processTrackingImg from '../assets/images/process-impact-tracking.jpg';

// Import Features & Benefits images
import featureTrackingImg from '../assets/images/feature-collection-tracking.jpg';
import featureCommissionImg from '../assets/images/feature-commission-system.jpg';
import featureEducationImg from '../assets/images/feature-educational-content.jpg';

// Service Categories Data
const serviceCategories = [
  {
    id: 1,
    title: 'Waste Collection',
    description: 'Professional pickup service for all recyclable materials',
    image: wasteCollectionImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18l-2 13H5L3 6z" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    ),
    color: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    title: 'Recycling Centers',
    description: 'Network of certified recycling facilities across Sri Lanka',
    image: recyclingCentersImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
      </svg>
    ),
    color: 'from-green-600 to-yellow-500'
  },
  {
    id: 3,
    title: 'Smart Scheduling',
    description: 'Easy booking system with flexible pickup times',
    image: smartSchedulingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    color: 'from-yellow-400 to-green-500'
  },
  {
    id: 4,
    title: 'Impact Tracking',
    description: 'Real-time monitoring of your environmental contribution',
    image: impactTrackingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <circle cx="12" cy="8" r="2" />
        <path d="M16 12h4" />
      </svg>
    ),
    color: 'from-green-400 to-green-600'
  },
];

// E-Waste Categories We Handle (Updated for EcoTech)
const eWasteCategories = [
  {
    id: 1,
    category: 'High-Value Electronics',
    priceRange: 'LKR 1,500 - 2,000',
    items: ['Smartphones & Tablets', 'Laptops & Desktop PCs', 'Gaming Consoles', 'Digital Cameras'],
    commission: 'LKR 450 - 600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="10" x="2" y="3" rx="2" ry="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
    bgColor: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    category: 'Medium Appliances',
    priceRange: 'LKR 1,200 - 1,800',
    items: ['Refrigerators', 'Washing Machines', 'LED TVs', 'Microwave Ovens'],
    commission: 'LKR 360 - 540',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M9 9h6v6H9V9z" />
        <path d="M21 9v6" />
        <path d="M21 3v2" />
      </svg>
    ),
    bgColor: 'from-yellow-500 to-green-500'
  },
  {
    id: 3,
    category: 'Office Equipment',
    priceRange: 'LKR 1,000 - 1,500',
    items: ['Printers & Scanners', 'Computer Monitors', 'Projectors', 'UPS Systems'],
    commission: 'LKR 300 - 450',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6,9 6,2 18,2 18,9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
      </svg>
    ),
    bgColor: 'from-green-600 to-yellow-500'
  },
  {
    id: 4,
    category: 'Batteries & Components',
    priceRange: 'LKR 500 - 900',
    items: ['Laptop Batteries', 'Circuit Boards', 'Power Adapters', 'Hard Drives'],
    commission: 'LKR 150 - 270',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
        <line x1="22" x2="22" y1="11" y2="13" />
        <line x1="6" x2="6" y1="11" y2="13" />
        <line x1="10" x2="10" y1="11" y2="13" />
      </svg>
    ),
    bgColor: 'from-green-500 to-green-600'
  },
  {
    id: 5,
    category: 'Small Electronics',
    priceRange: 'LKR 300 - 800',
    items: ['Phone Chargers', 'Headphones', 'Speakers', 'Electric Kettles'],
    commission: 'LKR 90 - 240',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7-3 9-6 9s-6-2-6-9" />
        <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6" />
        <path d="M12 2v4" />
      </svg>
    ),
    bgColor: 'from-yellow-400 to-green-500'
  },
  {
    id: 6,
    category: 'Specialized Equipment',
    priceRange: 'LKR 800 - 1,200',
    items: ['Medical Devices', 'Industrial Tools', 'Solar Panels', 'Air Conditioners'],
    commission: 'LKR 240 - 360',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    bgColor: 'from-green-400 to-green-600'
  },
];

// Why Choose EcoTech Data (Updated for Sri Lankan market)
const whyChooseEcoTech = [
  {
    id: 1,
    title: '30% Collector Commission',
    description: 'Fair income opportunities for waste collectors with the highest commission rate in Sri Lanka',
    value: '30%',
    subtext: 'Higher than industry standard',
    image: whyChooseCommissionImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    bgGradient: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    title: 'Sustainability Fund',
    description: '10% of every payment goes directly to environmental conservation projects in Sri Lanka',
    value: '10%',
    subtext: 'Environmental impact',
    image: whyChooseSustainabilityImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    bgGradient: 'from-yellow-500 to-green-500'
  },
  {
    id: 3,
    title: 'Transparent LKR Pricing',
    description: 'Clear pricing structure from LKR 300-2000 per item with no hidden fees',
    value: 'LKR',
    subtext: 'Local currency pricing',
    image: whyChoosePricingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 12h10" />
        <path d="M7 8h7" />
        <path d="M7 16h13" />
      </svg>
    ),
    bgGradient: 'from-green-600 to-yellow-500'
  },
  {
    id: 4,
    title: 'Multi-Role Platform',
    description: 'Comprehensive ecosystem connecting users, collectors, recycling centers and admins',
    value: '4',
    subtext: 'User types supported',
    image: whyChoosePlatformImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    bgGradient: 'from-green-400 to-green-600'
  },
];

// How EcoTech Works - Complete E-Waste Management Process
const ecoTechProcess = [
  {
    id: 1,
    title: 'Submit E-Waste Request',
    description: 'List your electronic items with our smart pricing calculator. Get instant quotes from LKR 300-2000 per item.',
    details: 'Upload photos, specify quantities, and get automatic price calculations based on our certified pricing categories.',
    image: processSubmitImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
        <line x1="2" x2="22" y1="20" y2="20" />
        <path d="M12 8v4" />
        <path d="M10 10h4" />
      </svg>
    ),
    bgColor: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    title: 'Secure Payment & Assignment',
    description: 'Complete secure payment with transparent breakdown showing collector commission and sustainability fund.',
    details: '30% goes to collector, 10% to environmental projects. All payments secure and tracked.',
    image: processPaymentImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
        <path d="M6 14h2" />
        <path d="M10 14h6" />
      </svg>
    ),
    bgColor: 'from-yellow-500 to-green-500'
  },
  {
    id: 3,
    title: 'Professional Collection',
    description: 'Professional waste collectors pickup your items with real-time tracking and photo documentation of collected materials.',
    details: 'Collectors earn 30% commission, receive task details, and coordinate pickup times convenient for you.',
    image: processCollectionImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624L20 11.5l-1.78-1.93a1 1 0 0 0-.22-.624V6a2 2 0 0 0-2-2h-6.5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1z" />
        <circle cx="7" cy="8" r="1" />
      </svg>
    ),
    bgColor: 'from-green-600 to-yellow-500'
  },
  {
    id: 4,
    title: 'Professional Recycling',
    description: 'Items delivered to recycling centers where they are processed responsibly with full documentation.',
    details: 'Recycling centers verify deliveries, process materials according to environmental standards, and confirm completion.',
    image: processRecyclingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </svg>
    ),
    bgColor: 'from-green-400 to-green-600'
  },
  {
    id: 5,
    title: 'Impact & Rewards Tracking',
    description: 'Track your environmental contribution and sustainability fund impact through your personalized dashboard.',
    details: 'View achievements, environmental metrics, and see how your contribution supports Sri Lankan conservation projects.',
    image: processTrackingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <circle cx="12" cy="8" r="2" />
        <path d="M16 12h4" />
      </svg>
    ),
    bgColor: 'from-yellow-400 to-green-500'
  },
];

// EcoTech Platform Features & Benefits (Updated)
const platformFeatures = [
  {
    id: 1,
    title: 'Collection Tracking',
    description: 'Track your e-waste from pickup request to recycling center delivery with photo documentation and status updates.',
    benefit: 'Complete Transparency',
    image: featureTrackingImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624L20 11.5l-1.78-1.93a1 1 0 0 0-.22-.624V6a2 2 0 0 0-2-2h-6.5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1z" />
        <circle cx="7" cy="8" r="1" />
      </svg>
    ),
    gradient: 'from-green-600 to-yellow-500'
  },
  {
    id: 2,
    title: 'Collector Commission System',
    description: 'Automatic 30% commission payments to collectors upon delivery confirmation, ensuring fair and timely compensation.',
    benefit: 'Fair Compensation',
    image: featureCommissionImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    gradient: 'from-yellow-400 to-green-500'
  },
  {
    id: 3,
    title: 'Educational Content Management',
    description: 'Access constantly updated e-waste education content, guides, and environmental awareness articles managed by our admin team.',
    benefit: 'Continuous Learning',
    image: featureEducationImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        <bookmark x="11" y="1" width="2" height="6" />
      </svg>
    ),
    gradient: 'from-green-500 to-green-600'
  },
];

// Testimonials Data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Community Member',
    image: 'https://i.pravatar.cc/150?img=1',
    content: 'EcoTech has transformed how I approach recycling. The rewards system makes it fun and engaging, and I love seeing my environmental impact grow!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Owner',
    image: 'https://i.pravatar.cc/150?img=2',
    content: 'As a business owner, partnering with EcoTech has been incredible. Their platform has helped us implement effective recycling programs and engage our customers.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Environmental Activist',
    image: 'https://i.pravatar.cc/150?img=3',
    content: 'The educational resources and community features are outstanding. EcoTech is creating real change by making recycling accessible and rewarding.',
    rating: 5,
  },
];

const Home = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Add custom styles for enhanced animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(40px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      @keyframes slide-in-left {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes slide-in-right {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(3deg); }
      }
      
      @keyframes float-reverse {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(10px) rotate(-2deg); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); }
        50% { box-shadow: 0 0 50px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.4); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3); }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes particle-float {
        0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
        25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 1; }
        50% { transform: translateY(-10px) translateX(-5px) scale(0.9); opacity: 0.8; }
        75% { transform: translateY(-25px) translateX(8px) scale(1.05); opacity: 0.9; }
      }
      
      .animate-fade-in {
        animation: fade-in 0.8s ease-out forwards;
      }
      
      .animate-fade-in-up {
        animation: fade-in-up 1s ease-out forwards;
      }
      
      .animate-slide-in-left {
        animation: slide-in-left 0.8s ease-out forwards;
      }
      
      .animate-slide-in-right {
        animation: slide-in-right 0.8s ease-out forwards;
      }
      
      .animate-float {
        animation: float 4s ease-in-out infinite;
      }
      
      .animate-float-reverse {
        animation: float-reverse 5s ease-in-out infinite;
      }
      
      .animate-glow {
        animation: glow 3s ease-in-out infinite;
      }
      
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      
      .animate-particle-float {
        animation: particle-float 6s ease-in-out infinite;
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }
      
      .mesh-gradient {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.1) 0%, 
          rgba(147, 51, 234, 0.1) 25%,
          rgba(59, 130, 246, 0.1) 50%,
          rgba(236, 72, 153, 0.1) 75%,
          rgba(59, 130, 246, 0.1) 100%);
      }
      
      .shadow-3xl {
        box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
      }
      
      .shadow-4xl {
        box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
      }
      
      .crystal-clear {
        filter: brightness(120%) contrast(125%) saturate(130%);
      }
      
      .enhanced-glass {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .ultra-glass {
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(30px) saturate(200%) brightness(120%);
        -webkit-backdrop-filter: blur(30px) saturate(200%) brightness(120%);
        border: 1px solid rgba(255, 255, 255, 0.4);
      }
      
      .premium-glow {
        box-shadow: 
          0 0 20px rgba(59, 130, 246, 0.3),
          0 0 40px rgba(59, 130, 246, 0.2),
          0 0 80px rgba(59, 130, 246, 0.1);
      }
      
      .premium-shadow {
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.1),
          0 10px 40px rgba(0, 0, 0, 0.15),
          0 20px 80px rgba(0, 0, 0, 0.1);
      }
      
      .shimmer-effect {
        position: relative;
        overflow: hidden;
      }
      
      .shimmer-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        animation: shimmer 3s infinite;
      }
      
      .floating-particles::before,
      .floating-particles::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(59, 130, 246, 0.6);
        border-radius: 50%;
        animation: particle-float 8s infinite;
      }
      
      .floating-particles::before {
        top: 20%;
        right: 15%;
        animation-delay: -2s;
      }
      
      .floating-particles::after {
        bottom: 30%;
        left: 20%;
        animation-delay: -4s;
        background: rgba(99, 102, 241, 0.5);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Debug logging
  React.useEffect(() => {
    console.log('Home page - Auth state:', {
      loading,
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      } : null
    });
  }, [loading, isAuthenticated, user]);
  
  // Show pickup form only for authenticated public users
  const showPickupForm = isAuthenticated && user?.role === 'PUBLIC';

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Premium Star Rating Component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-6 h-6 transition-all duration-500 ${
              index < rating 
                ? 'text-yellow-400 drop-shadow-lg' 
                : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />
      
      {/* Service Categories Section */}
      <section className="relative py-16 bg-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 to-white"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-radial from-blue-400/10 to-transparent rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-gradient-radial from-indigo-400/8 to-transparent rounded-full blur-2xl animate-float-reverse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20 transform transition-all duration-1000 animate-fade-in-up">
            <div className="inline-block">
              <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase mb-8 block relative">
                <span className="relative z-10">Our Services</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>
              </span>
            </div>
            <TextReveal className="text-7xl md:text-8xl font-black text-slate-900 tracking-tight mb-8 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text drop-shadow-lg">
              Comprehensive Solutions
            </TextReveal>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl text-slate-600 leading-relaxed font-light mb-6">
                Professional e-waste management services designed for modern Sri Lanka's sustainability needs
              </p>
              <div className="flex justify-center items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Eco-Friendly</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                  <span>Professional</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-400"></div>
                  <span>Reliable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories.map((service, index) => (
              <BorderBeam key={service.id} className="h-full" duration={2 + index * 0.3}>
                <MagicCard className="group relative rounded-2xl h-full ultra-glass border border-slate-300/90 hover:border-blue-400/80 transition-all duration-700 overflow-hidden premium-shadow hover:shadow-4xl hover:shadow-blue-500/25 transform hover:-translate-y-3 hover:scale-[1.02] shimmer-effect floating-particles animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                  <div className="flex flex-col h-full">
                    {/* Enhanced Premium Image */}
                    <div className="relative h-56 overflow-hidden rounded-t-2xl">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 filter brightness-115 contrast-125 saturate-130 group-hover:brightness-130 group-hover:contrast-135 group-hover:saturate-145"
                      />
                      {/* Modern gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                      
                      {/* Professional icon badge */}
                      <div className="absolute top-4 right-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float">
                        <div className="p-4 rounded-2xl ultra-glass shadow-2xl border border-white/50 hover:shadow-blue-500/30 premium-glow">
                          <div className="text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              {service.id === 1 && (
                                <>
                                  <path d="M3 6h18l-2 13H5L3 6z" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </>
                              )}
                              {service.id === 2 && (
                                <>
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                  <path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
                                </>
                              )}
                              {service.id === 3 && (
                                <>
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                  <line x1="16" x2="16" y1="2" y2="6" />
                                  <line x1="8" x2="8" y1="2" y2="6" />
                                  <line x1="3" x2="21" y1="10" y2="10" />
                                  <path d="m9 16 2 2 4-4" />
                                </>
                              )}
                              {service.id === 4 && (
                                <>
                                  <path d="M3 3v18h18" />
                                  <path d="m19 9-5 5-4-4-3 3" />
                                  <circle cx="12" cy="8" r="2" />
                                  <path d="M16 12h4" />
                                </>
                              )}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Content Section */}
                    <div className="flex flex-col flex-grow p-8 bg-gradient-to-b from-white/95 to-slate-50/80 backdrop-blur-sm">
                      <div className="mb-4">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg">
                          Service
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-slate-950 group-hover:text-blue-700 transition-colors duration-500 leading-tight drop-shadow-sm">
                        {service.title}
                      </h3>
                      <p className="text-slate-700 text-base leading-relaxed flex-grow font-medium">
                        {service.description}
                      </p>
                      
                      {/* Modern action indicator */}
                      <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                        <span className="text-sm">Learn More</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>



      {/* Company Values Section */}
      <section className="relative py-16 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-radial from-blue-500/12 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/5 left-1/3 w-48 h-48 bg-gradient-radial from-purple-400/8 to-transparent rounded-full blur-2xl animate-float-reverse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wider uppercase mb-6 block">
              Why Choose EcoTech
            </span>
            <TextReveal className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 font-roboto-slab drop-shadow-lg">
              Trusted Excellence
            </TextReveal>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed font-light">
              Leading Sri Lanka's sustainable future with transparent processes, fair compensation, and measurable environmental impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseEcoTech.map((value, index) => (
              <BorderBeam key={value.id} className="h-full" duration={3 + index * 0.4}>
                <MagicCard className="group relative rounded-2xl h-full ultra-glass border border-slate-400/80 hover:border-blue-400/90 transition-all duration-700 overflow-hidden premium-shadow hover:shadow-4xl hover:shadow-blue-500/30 transform hover:-translate-y-4 hover:rotate-2 hover:scale-[1.03] floating-particles animate-slide-in-left" style={{animationDelay: `${index * 0.15}s`}}>
                  {/* Enhanced Background Image */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <img 
                      src={value.image} 
                      alt={value.title}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-all duration-700 filter brightness-110 contrast-115 saturate-120 group-hover:brightness-125 group-hover:contrast-125 group-hover:saturate-130"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/15 to-transparent group-hover:from-white/60 transition-all duration-500"></div>
                    {/* Enhanced mesh gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-indigo-500/15 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <div className="flex flex-col items-center text-center h-full relative z-10 p-8">
                    {/* Enhanced Value Display */}
                    <div className="relative mb-8">
                      <div className="p-12 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-3xl border border-blue-500/50 group-hover:scale-130 group-hover:rotate-6 transition-all duration-700 shadow-4xl group-hover:shadow-blue-500/40 ultra-glass premium-glow animate-float-reverse">
                        <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-500 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          {value.icon}
                        </div>
                        <div className="text-5xl font-black text-amber-500 mb-3 tracking-tight drop-shadow-lg">{value.value}</div>
                        <div className="text-sm text-slate-800 font-bold uppercase tracking-wider">{value.subtext}</div>
                      </div>
                      {/* Enhanced glow effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      {/* Floating particles */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                      <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse delay-300"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-slate-950 group-hover:text-blue-700 transition-colors duration-500 font-roboto-condensed drop-shadow-sm">
                      {value.title}
                    </h3>
                    <p className="text-slate-800 leading-relaxed text-sm font-medium">
                      {value.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>
      
      {/* Premium How It Works Section */}
      <section className="relative py-16 bg-white overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[3px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 to-white"></div>
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/8 via-transparent to-transparent"></div>
          <div className="absolute top-1/5 right-1/6 w-40 h-40 bg-gradient-radial from-blue-400/12 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 left-1/6 w-32 h-32 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full blur-2xl animate-float-reverse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="relative inline-block mb-6">
              <span className="text-blue-600 font-medium text-sm tracking-wider uppercase mb-6 block">
                How EcoTech Works
              </span>
              <TextReveal className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight font-roboto-slab drop-shadow-lg">
                Our Process
              </TextReveal>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed font-light">
              Streamlined e-waste management from collection request to certified recycling, with transparent pricing and fair compensation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {ecoTechProcess.map((process, index) => (
              <BorderBeam key={process.id} className="h-full" duration={3 + index * 0.3}>
                <MagicCard className="group relative rounded-2xl h-full ultra-glass border border-slate-400/90 hover:border-blue-400/100 transition-all duration-700 hover:shadow-4xl hover:shadow-blue-500/35 overflow-hidden premium-shadow transform hover:-translate-y-5 hover:scale-[1.08] floating-particles shimmer-effect animate-slide-in-right" style={{animationDelay: `${index * 0.1}s`}}>
                  {/* Enhanced Background Image */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <img 
                      src={process.image} 
                      alt={process.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 filter brightness-115 contrast-120 saturate-125 group-hover:brightness-130 group-hover:contrast-130 group-hover:saturate-140"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/10 to-white/40 group-hover:from-white/65 group-hover:via-white/5 group-hover:to-white/30 transition-all duration-500"></div>
                    {/* Enhanced dynamic color overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${process.bgColor}/20 opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                  </div>

                  <div className="flex flex-col items-center text-center h-full relative z-10 p-8">
                    {/* Enhanced icon container */}
                    <div className="relative mb-8 transform group-hover:-translate-y-6 transition-transform duration-500">
                      <div className="p-10 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-3xl border border-blue-500/50 group-hover:scale-135 group-hover:rotate-12 transition-all duration-700 shadow-4xl group-hover:shadow-blue-500/40 ultra-glass premium-glow animate-pulse-glow">
                        <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-500 transform group-hover:scale-110 transition-transform duration-300">
                          {process.icon}
                        </div>
                      </div>
                      {/* Enhanced glow effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      {/* Step indicator */}
                      <div className="absolute -top-4 -right-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${process.bgColor} text-white font-bold text-sm flex items-center justify-center shadow-2xl animate-pulse border-2 border-white`}>
                          {process.id}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold mb-3 text-slate-950 group-hover:text-blue-700 transition-colors duration-500 font-roboto-condensed drop-shadow-sm">
                      {process.title}
                    </h3>
                    <p className="text-slate-800 leading-relaxed mb-4 flex-grow text-sm font-medium">
                      {process.description}
                    </p>
                    
                    {/* Process Details */}
                    <div className="text-xs text-slate-700 mb-4 italic font-medium">
                      {process.details}
                    </div>
                    
                    {/* Premium step number */}
                    <div className="relative">
                      <div className={`flex items-center justify-center rounded-full w-12 h-12 font-bold text-base bg-gradient-to-br ${process.bgColor} text-white shadow-2xl group-hover:scale-125 transition-all duration-500 border-2 border-white`}>
                        {process.id}
                      </div>
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${process.bgColor} blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                    </div>
                  </div>

                  {/* Premium background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="relative overflow-hidden py-16 bg-slate-50">
        <WarpBackground className="opacity-5" />
        
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-500/12 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-purple-400/8 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-3/4 right-1/3 w-48 h-48 bg-gradient-radial from-pink-400/6 to-transparent rounded-full blur-2xl animate-particle-float"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="relative inline-block mb-8">
              <span className="text-blue-600 font-medium text-sm tracking-wider uppercase mb-6 block">
                Features & Benefits
              </span>
              <TextReveal>
                <AnimatedShinyText 
                  className="text-7xl font-black text-slate-900 tracking-tight font-roboto-slab drop-shadow-lg"
                  animationType="gradient"
                >
                  Platform Excellence
                </AnimatedShinyText>
              </TextReveal>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="mx-auto max-w-4xl text-xl text-slate-600 leading-relaxed font-light">
              Advanced platform capabilities supporting Sri Lanka's sustainable future with transparent processes, 
              fair compensation, and measurable environmental impact for all stakeholders.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <BorderBeam key={feature.id} className="h-full" duration={3 + index * 0.3}>
                <MagicCard className="h-full group">
                  <ShineEffect>
                    <div className="relative h-full flex flex-col rounded-2xl backdrop-blur-3xl transition-all duration-700 bg-white/85 border border-slate-300/90 hover:border-blue-400/100 overflow-hidden hover:shadow-4xl hover:shadow-blue-500/35 shadow-2xl transform hover:-translate-y-5 hover:scale-[1.02]">
                      {/* Enhanced Background Image */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 filter brightness-120 contrast-125 saturate-130 group-hover:brightness-135 group-hover:contrast-135 group-hover:saturate-145"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/8 to-white/25 group-hover:from-white/60 group-hover:via-white/3 group-hover:to-white/15 transition-all duration-500"></div>
                        {/* Enhanced overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
                      </div>

                      {/* Premium gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                                              <div className="relative z-10 p-8">
                          {/* Enhanced icon container with benefit badge */}
                          <div className="relative mb-8 transform group-hover:-translate-y-4 transition-transform duration-500">
                            <div className="rounded-3xl p-8 w-28 h-28 flex items-center justify-center backdrop-blur-2xl border border-blue-500/40 bg-gradient-to-br from-white via-slate-50 to-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-3xl group-hover:shadow-blue-500/35 enhanced-glass">
                              <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-500 transform group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                              </div>
                            </div>
                            {/* Enhanced benefit badge */}
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-2xl border-2 border-white transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                              {feature.benefit}
                            </div>
                            {/* Enhanced glow effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            {/* Floating particles */}
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce delay-200"></div>
                          </div>

                        <TextReveal>
                          <h3 className="mb-4 text-xl font-bold text-slate-950 group-hover:text-blue-700 transition-colors duration-500 font-roboto-condensed drop-shadow-sm">
                            {feature.title}
                          </h3>
                        </TextReveal>
                        <p className="text-slate-800 leading-relaxed text-sm flex-grow font-medium">
                          {feature.description}
                        </p>

                        {/* Premium accent line */}
                        <div className="mt-6 h-[2px] w-16 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full group-hover:w-24 transition-all duration-500"></div>
                      </div>

                      {/* Premium floating particles */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500/70 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-1 h-1 bg-indigo-400/70 rounded-full animate-pulse delay-1000"></div>
                    </div>
                  </ShineEffect>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>

      {showPickupForm && (
        <div id="pickup-form-section">
          <RequestPickupForm />
        </div>
      )}

      {/* Premium Testimonials Section */}
      <section className="relative py-16 bg-white overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[3px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-blue-500/12 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-1/6 left-1/3 w-32 h-32 bg-gradient-radial from-purple-400/8 to-transparent rounded-full blur-2xl animate-particle-float"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 to-white"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="relative inline-block mb-8">
              <span className="text-blue-600 font-medium text-sm tracking-wider uppercase mb-6 block">
                What Our Users Say
              </span>
              <TextReveal>
                <AnimatedShinyText className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight font-roboto-slab drop-shadow-lg">
                  Client Testimonials
                </AnimatedShinyText>
              </TextReveal>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed font-light">
              Join thousands of satisfied users who are making a positive environmental impact with
              EcoTech's professional recycling platform and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <BorderBeam key={testimonial.id} className="h-full" duration={3 + index * 0.4}>
                <MagicCard className="group relative p-8 rounded-2xl h-full bg-white/90 backdrop-blur-2xl border border-slate-300/80 hover:border-blue-400/90 transition-all duration-700 hover:shadow-3xl hover:shadow-blue-500/30 transform hover:-translate-y-3 hover:scale-[1.02]">
                  <div className="flex flex-col h-full relative z-10">
                    {/* Premium user info */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/40 group-hover:ring-blue-500/60 transition-all duration-500"
                        />
                        {/* Avatar glow effect */}
                        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-500 font-roboto-condensed">
                          {testimonial.name}
                        </h3>
                        <p className="text-slate-600 text-lg">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Premium star rating */}
                    <div className="mb-6">
                      <StarRating rating={testimonial.rating} />
                    </div>

                    {/* Premium quote */}
                    <blockquote className="flex-grow">
                      <div className="relative">
                        {/* Quote icon */}
                        <div className="absolute -top-2 -left-2 text-blue-500/40 text-4xl font-serif">"</div>
                        <p className="text-slate-600 italic text-lg leading-relaxed pl-6">
                          {testimonial.content}
                        </p>
                        <div className="absolute -bottom-2 -right-2 text-blue-500/40 text-4xl font-serif rotate-180">"</div>
                      </div>
                    </blockquote>

                    {/* Premium accent line */}
                    <div className="mt-6 h-[2px] w-12 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full group-hover:w-20 transition-all duration-500"></div>
                  </div>

                  {/* Premium background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/8 to-indigo-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Premium floating particles */}
                  <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-blue-500/70 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-1 h-1 bg-indigo-400/70 rounded-full animate-pulse delay-700"></div>
                </MagicCard>
              </BorderBeam>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home; 