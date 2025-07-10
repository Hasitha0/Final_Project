import React from 'react';
import { MagicCard } from '../components/ui/magic-card';

const AboutUs = () => {
  const stats = [
    { number: 'LKR 300+', label: 'Average Item Value', icon: '💰' },
    { number: '30%', label: 'Collector Commission', icon: '🚚' },
    { number: '10%', label: 'Sustainability Fund', icon: '🌱' },
    { number: '4 Roles', label: 'User Categories', icon: '👥' }
  ];

  const whyChoosePoints = [
    'Fair compensation model with 30% collector commission',
    'Transparent pricing structure (LKR 300-2000 per item)',
    'Certified recycling partners across Sri Lanka',
    '10% sustainability fund for environmental projects'
  ];

  const systemRoles = [
    {
      name: 'General Public',
      role: 'Primary Users',
      description: 'Citizens who submit e-waste collection requests and track their environmental impact through our platform.',
      features: ['Submit collection requests', 'Real-time tracking', 'Earn rewards & points', 'Educational content access'],
      icon: '👤'
    },
    {
      name: 'Waste Collectors',
      role: 'Service Providers',
      description: 'Field operatives who earn 30% commission collecting e-waste and delivering it to certified recycling centers.',
      features: ['Task management', 'Commission tracking', 'Route optimization', 'Issue reporting system'],
      icon: '🚚'
    },
    {
      name: 'Recycling Centers',
      role: 'Processing Partners',
      description: 'Certified facilities that receive and process e-waste deliveries from our collector network.',
      features: ['Delivery verification', 'Quality assessment', 'Processing workflow', 'Compliance reporting'],
      icon: '🏭'
    },
    {
      name: 'Platform Admins',
      role: 'System Operators',
      description: 'System administrators managing the entire platform, user approvals, and content management.',
      features: ['User management', 'Content publishing', 'Analytics dashboard', 'Issue resolution'],
      icon: '⚙️'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section 
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{backgroundImage: 'url(/src/assets/images/hero-bg.jpg)'}}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
            ABOUT US
          </h1>
          <div className="flex items-center justify-center space-x-2 text-yellow-400 text-lg">
            <span className="text-white">EcoTech</span>
            <span className="text-yellow-400">—</span>
            <span>About Us</span>
          </div>
        </div>
      </section>

      {/* Main About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-6">
                <span className="text-green-600 font-semibold text-lg tracking-wide">
                  About EcoTech Platform —
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                REVOLUTIONIZING E-WASTE MANAGEMENT IN
                <span className="text-green-600"> SRI LANKA</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                EcoTech is a comprehensive platform connecting Sri Lankan citizens with waste collectors 
                and certified recycling centers. Our innovative payment model ensures fair compensation 
                for collectors while funding environmental sustainability projects across the country.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-lg">30% commission ensuring fair collector compensation</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-lg">Transparent pricing structure and sustainable economics</span>
                </div>
              </div>

              {/* Key Points with Numbers */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">01</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Technology Driven</h3>
                    <p className="text-gray-600">React + Supabase platform with automated commission system</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">02</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
                    <p className="text-gray-600">Empowering local collectors with sustainable income opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - About Main Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/src/assets/images/about-main.jpg" 
                  alt="EcoTech e-waste management in Sri Lanka" 
                  className="w-full h-full object-cover"
                />
                {/* Overlay with stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-3 bg-white/90 rounded-lg backdrop-blur-sm">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-xl font-bold text-green-600 mb-1">{stat.number}</div>
                        <div className="text-xs text-gray-700 font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose EcoTech Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Image - Ecosystem Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/src/assets/images/ecosystem.jpg" 
                  alt="EcoTech multi-role ecosystem" 
                  className="w-full h-full object-cover"
                />
                {/* Overlay with role information */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                  <div className="p-8 w-full">
                    <h3 className="text-2xl font-bold text-white mb-4">Multi-Role Ecosystem</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {systemRoles.map((role, index) => (
                        <div key={index} className="text-center p-3 bg-white/90 rounded-lg backdrop-blur-sm">
                          <div className="text-lg mb-1">{role.icon}</div>
                          <div className="text-xs font-semibold text-gray-900">{role.name}</div>
                          <div className="text-xs text-green-600">{role.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="bg-green-600 rounded-2xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-8">
                Why Choose EcoTech?
              </h2>
              
              <p className="text-lg text-green-100 mb-8 leading-relaxed">
                Our platform combines cutting-edge technology with sustainable economics to create 
                the most comprehensive e-waste management solution in Sri Lanka.
              </p>

              <div className="space-y-4">
                {whyChoosePoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-green-100">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-green-500">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">30%</div>
                    <div className="text-sm text-green-200">Collector Commission</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">10%</div>
                    <div className="text-sm text-green-200">Sustainability Fund</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">🇱🇰</div>
                    <div className="text-sm text-green-200">Sri Lanka Focus</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold text-lg tracking-wide">Our Purpose —</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-8">Mission & Vision</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <MagicCard className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-green-600">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-center">
                To create a sustainable e-waste management ecosystem in Sri Lanka that rewards 
                responsible disposal, empowers local collectors with fair income opportunities, 
                and channels resources into environmental conservation projects.
              </p>
            </MagicCard>

            <MagicCard className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-900">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-500">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-center">
                To become Sri Lanka's leading e-waste management platform, setting the standard 
                for transparent, fair, and technology-driven environmental solutions that benefit 
                communities and preserve our planet for future generations.
              </p>
            </MagicCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs; 