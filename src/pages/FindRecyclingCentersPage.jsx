import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MagicCard } from '../components/ui/magic-card';
import { BorderBeam } from '../components/ui/border-beam';
import { TextReveal } from '../components/ui/text-reveal';
import { AnimatedGradientText } from '../components/ui/animated-gradient-text';
import { WarpBackground } from '../components/ui/warp-background';
import { ShimmerButton } from '../components/ui/shimmer-button';

import supabaseApi from '../services/supabaseApi';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import L from 'leaflet';
import TermsOfService from '../components/TermsOfService';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Ensure Leaflet is properly initialized
if (typeof window !== 'undefined') {
  // Additional Leaflet setup for browser environment
  L.Icon.Default.imagePath = '/';
}

const FindRecyclingCentersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffName: '',
    email: '',
    phone: '',
    centerName: '',
    registrationNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [centersPerPage] = useState(6); // Show 6 centers per page
  const mapRef = useRef(null);

  const materials = ["Electronics", "Batteries", "Computers", "Mobile Phones", "Appliances", "Printers", "TVs"];

  // Pagination calculations
  const indexOfLastCenter = currentPage * centersPerPage;
  const indexOfFirstCenter = indexOfLastCenter - centersPerPage;
  const currentCenters = filteredCenters.slice(indexOfFirstCenter, indexOfLastCenter);
  const totalPages = Math.ceil(filteredCenters.length / centersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Load recycling centers on component mount
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
                  const centers = await supabaseApi.recycling.getAllCenters();
          setCenters(centers);
          setFilteredCenters(centers);
      } catch (err) {
        setError('Failed to load recycling centers');
        console.error('Error loading centers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  // Filter centers based on search and materials
  useEffect(() => {
    const filtered = centers.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMaterials = selectedMaterials.length === 0 ||
                              selectedMaterials.every(material => center.materials.includes(material));
      
      return matchesSearch && matchesMaterials;
    });
    
    setFilteredCenters(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedMaterials, centers]);

  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  // Set map as loaded after a short delay to ensure proper rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!formData.agreeToTerms) {
        throw new Error('You must agree to the terms of service');
      }

      // Register recycling center user through authService
      const registrationData = {
        name: formData.staffName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'RECYCLING_CENTER',
        centerName: formData.centerName,
        registrationNumber: formData.registrationNumber,
        address: formData.address
      };

      const result = await authService.register(registrationData);

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('Recycling center registration submitted:', result);
      setSubmitSuccess(true);
        
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setFormData({
          staffName: '',
          email: '',
          phone: '',
          centerName: '',
          registrationNumber: '',
          address: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false
        });
        setSubmitSuccess(false);
        setIsFormOpen(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit registration. Please try again.');
      console.error('Error submitting registration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-xl font-medium">Loading recycling centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 text-black relative">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      <div className="relative">
        {/* Hero Banner Section */}
        <section 
          className="relative h-96 flex items-center justify-center bg-cover bg-center mb-12"
          style={{backgroundImage: 'url(/src/assets/images/recycling-hero.jpg)'}}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
              RECYCLING CENTERS
            </h1>
            <div className="flex items-center justify-center space-x-2 text-lg mb-8">
              <span className="text-white">EcoTech</span>
              <span className="text-yellow-400">—</span>
              <span className="text-yellow-400">Find Centers</span>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto px-4 mb-8">
              Locate certified e-waste recycling centers near you or register your facility
            </p>
            <ShimmerButton
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Register Your Center
            </ShimmerButton>
          </div>
        </section>

        {/* Search and Filter Controls */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <MagicCard className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="space-y-4">
              {/* Search and Results Counter */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                {/* Results Counter */}
                <div className="text-sm text-gray-700">
                  {filteredCenters.length} center{filteredCenters.length !== 1 ? 's' : ''} found
                  {filteredCenters.length !== centers.length && (
                    <span className="text-emerald-600"> (filtered from {centers.length})</span>
                  )}
                </div>
              </div>

              {/* Material Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-700 mr-2 py-2">Filter by materials:</span>
                {materials.map(material => (
                  <button
                    key={material}
                    onClick={() => handleMaterialToggle(material)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedMaterials.includes(material)
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
                  >
                    {material}
                  </button>
                ))}
                {selectedMaterials.length > 0 && (
                  <button
                    onClick={() => setSelectedMaterials([])}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 border border-red-100 shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Registration Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <MagicCard className="p-8 bg-white rounded-2xl border border-gray-200 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Register Recycling Center</h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-emerald-600 mb-4">
                      Registration Submitted Successfully!
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Your recycling center account has been created and is pending admin approval.
                      You'll be able to login once your account is activated.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Next Steps:</h4>
                      <ol className="text-sm text-gray-700 space-y-1">
                        <li>1. Admin will review your registration</li>
                        <li>2. You'll receive email notification when approved</li>
                        <li>3. Login with your email and password once activated</li>
                        <li>4. Your center will appear on the map after approval</li>
                      </ol>
                    </div>
                    <ShimmerButton
                      onClick={() => setIsFormOpen(false)}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Close
                    </ShimmerButton>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Person Name *
                        </label>
                        <input
                          type="text"
                          name="staffName"
                          required
                          value={formData.staffName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter contact person's full name"
                        />
                      </div>

                      {/* Center Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Center Name *
                        </label>
                        <input
                          type="text"
                          name="centerName"
                          required
                          value={formData.centerName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your center's name"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter full address"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Registration Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter registration number"
                      />
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Create a password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>

                    {/* Agree to Terms */}
                    <div>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          required
                          checked={formData.agreeToTerms}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            agreeToTerms: e.target.checked
                          }))}
                          className="mr-3 mt-1 h-4 w-4 text-emerald-500 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-emerald-600 hover:text-emerald-700 underline"
                          >
                            terms of service
                          </button>
                          {' '}and privacy policy
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <ShimmerButton
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </ShimmerButton>
                    </div>
                  </form>
                )}
              </MagicCard>
            </div>
          </div>
        )}

        {/* Map and Centers List */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Centers List */}
            <div className="lg:col-span-1 space-y-4">
              {filteredCenters.length === 0 ? (
                <MagicCard className="text-center py-8 bg-white rounded-2xl border border-gray-200 shadow-xl">
                  <p className="text-gray-700">No recycling centers found matching your criteria.</p>
                  {selectedMaterials.length > 0 && (
                    <button
                      onClick={() => setSelectedMaterials([])}
                      className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </MagicCard>
              ) : (
                <>
                  {/* Centers List Content */}
                  {currentCenters.map(center => (
                    <MagicCard
                      key={center.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-white rounded-2xl border border-gray-200 shadow-xl ${
                        selectedCenter?.id === center.id ? 'ring-2 ring-emerald-500' : ''
                      }`}
                      onClick={() => setSelectedCenter(center)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{center.name}</h3>
                          {center.status === 'pending_approval' && (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-full border border-yellow-200">
                              Pending Approval
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{center.address}</p>
                        <p className="text-gray-600 text-sm mb-2">{center.hours}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {center.materials.map(material => (
                            <span
                              key={material}
                              className="px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-700 border border-gray-200"
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{center.phone}</p>
                          <p>{center.email}</p>
                        </div>
                      </div>
                    </MagicCard>
                  ))}
                </>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <MagicCard className="h-[600px] overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-xl">
                <div className="h-full w-full relative map-container">
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                  <MapContainer
                    center={[7.0873, 79.999]}
                    zoom={10}
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                    className="z-0"
                    ref={mapRef}
                    whenReady={(mapEvent) => {
                      setMapLoaded(true);
                      setTimeout(() => {
                        if (mapRef.current) {
                          mapRef.current.invalidateSize();
                        }
                      }, 100);
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredCenters.map(center => (
                      <Marker
                        key={center.id}
                        position={center.coordinates}
                        eventHandlers={{
                          click: () => setSelectedCenter(center),
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900">{center.name}</h3>
                              {center.status === 'pending_approval' && (
                                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{center.address}</p>
                            <p className="text-sm text-slate-500">{center.hours}</p>
                            <p className="text-sm text-slate-500">{center.phone}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </MagicCard>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default FindRecyclingCentersPage; 