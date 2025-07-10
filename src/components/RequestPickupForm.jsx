import React, { useState, useEffect } from 'react';
import { MagicCard } from './ui/magic-card';
import { ShimmerButton } from './ui/shimmer-button';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { paidCollectionService } from '../services/paidCollectionService';
import { useAuth } from '../context/AuthContext';

const RequestPickupForm = ({ onSuccess }) => {
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    items: [{ category: '', quantity: 1, price: 0 }],
    preferredDate: '',
    preferredTime: '',
    contactPerson: '',
    contactPhone: '',
    pickupAddress: '',
    pickupFloor: '',
    buildingAccessInfo: '',
    specialInstructions: '',
    paymentMethod: 'stripe'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  
  // Data state
  const [pricingCategories, setPricingCategories] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [collectorCommission, setCollectorCommission] = useState(0);
  const [sustainabilityFund, setSustainabilityFund] = useState(0);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        // Load pricing categories
        const categoriesResponse = await paidCollectionService.getPricingCategories();
        if (categoriesResponse.success) {
          setPricingCategories(categoriesResponse.data);
        }

        // Load time slots
        setTimeSlots(paidCollectionService.getAvailableTimeSlots());

        // Pre-populate user data if logged in
        if (user?.id) {
          const profileResponse = await paidCollectionService.getUserProfile(user.id);
          if (profileResponse.success) {
            const profile = profileResponse.data;
            setFormData(prev => ({
              ...prev,
              contactPerson: profile.name || '',
              contactPhone: profile.phone || '',
              pickupAddress: profile.default_pickup_address || profile.address || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Calculate totals whenever items change
  useEffect(() => {
    const total = paidCollectionService.calculateTotal(formData.items);
    const commission = paidCollectionService.calculateCollectorCommission(total);
    const sustainability = paidCollectionService.calculateSustainabilityFund(total);
    setTotalAmount(total);
    setCollectorCommission(commission);
    setSustainabilityFund(sustainability);
  }, [formData.items]);

  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new item row
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { category: '', quantity: 1, price: 0 }]
    }));
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle item category change
  const handleItemCategoryChange = (index, categoryKey) => {
    const selectedCategory = pricingCategories.find(cat => cat.category_key === categoryKey);
    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === index 
            ? { 
                ...item, 
                category: selectedCategory.name,
                category_key: categoryKey,
                price: selectedCategory.price_per_item 
              }
            : item
        )
      }));
    }
  };

  // Handle item quantity change
  const handleItemQuantityChange = (index, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity: qty } : item
      )
    }));
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 5 photos
    if (files.length > 5) {
      setError('You can upload maximum 5 photos');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Please upload only images under 5MB.');
    }

    setPhotoFiles(validFiles);
    
    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreview(previewUrls);
  };

  // Remove photo
  const removePhoto = (index) => {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(photoPreview[index]);
    
    setPhotoFiles(newFiles);
    setPhotoPreview(newPreviews);
  };

  // Form validation
  const validateForm = () => {
    // Check if at least one item is selected
    const hasValidItems = formData.items.some(item => item.category && item.quantity > 0);
    if (!hasValidItems) {
      return 'Please add at least one item with category and quantity';
    }

    // Check for incomplete item rows
    const hasIncompleteItems = formData.items.some(item => !item.category || item.quantity < 1);
    if (hasIncompleteItems) {
      return 'Please complete all item rows or remove empty ones';
    }

    if (!formData.preferredDate) {
      return 'Please select a preferred pickup date';
    }
    if (!paidCollectionService.isValidPickupDate(formData.preferredDate)) {
      return 'Please select a valid pickup date (weekdays only, no past dates)';
    }
    if (!formData.preferredTime) {
      return 'Please select a preferred time slot';
    }
    if (!formData.contactPerson.trim()) {
      return 'Please provide contact person name';
    }
    if (!formData.contactPhone.trim()) {
      return 'Please provide contact phone number';
    }
    if (!formData.pickupAddress.trim()) {
      return 'Please provide pickup address';
    }
    if (totalAmount <= 0) {
      return 'Total amount must be greater than LKR 0';
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
      setLoading(false);
      return;
    }

      let photoUrls = [];
      
      // Upload photos if any
      if (photoFiles.length > 0) {
        const uploadResponse = await paidCollectionService.uploadPhotos(photoFiles, user.id);
        if (!uploadResponse.success) {
          throw new Error(`Photo upload failed: ${uploadResponse.error}`);
        }
        photoUrls = uploadResponse.data;
    }

      // Prepare request data
      const requestData = {
        user_id: user.id,
        items: formData.items,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        address: formData.pickupAddress,
        pickup_floor: formData.pickupFloor,
        building_access_info: formData.buildingAccessInfo,
        special_instructions: formData.specialInstructions,
        item_photos: photoUrls,
        payment_method: formData.paymentMethod
      };

      // Debug logging
      console.log('Submitting request data:', requestData);
      console.log('User context:', user);

      // Create collection request
      const response = await paidCollectionService.createPaidCollectionRequest(requestData);
      
      console.log('Service response:', response);
      
      if (!response.success) {
        // Provide more detailed error information
        const errorMessage = response.error || 'Unknown error occurred';
        console.error('Collection request failed:', errorMessage);
        
        // Check for specific error types
        if (errorMessage.includes('Database error') || errorMessage.includes('row-level security')) {
          throw new Error('Database connection issue. Please contact support if this continues.');
        } else if (errorMessage.includes('Permission denied')) {
          throw new Error('You do not have permission to create collection requests. Please log in again.');
        } else if (errorMessage.includes('Invalid reference')) {
          throw new Error('Invalid data provided. Please check your form inputs and try again.');
        } else {
          throw new Error(errorMessage);
        }
      }

      console.log('Paid pickup request created successfully:', response.data);
      
      // For demo purposes, we'll simulate payment success
      // In production, you would redirect to Stripe Checkout here
      setTimeout(() => {
        setSuccess(true);
        // Clean up photo preview URLs
        photoPreview.forEach(url => URL.revokeObjectURL(url));
        
        // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          }, 3000);
      }
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit pickup request. Please try again.');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <MagicCard className="text-center">
            <div className="py-12 bg-white/90 rounded-2xl">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Paid Collection Request Submitted!
              </h2>
              <p className="text-slate-600 mb-4">
                Your e-waste pickup request has been created and payment processed successfully.
              </p>
              <div className="space-y-4 bg-slate-50/80 rounded-lg p-6 mt-6 border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="text-blue-600 font-bold ml-2">LKR {totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">🌱 Sustainability Fund:</span>
                    <span className="text-blue-600 font-bold ml-2">LKR {sustainabilityFund.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Request ID: #{Date.now()} | 10% supports sustainable recycling projects in Sri Lanka
                </p>
              </div>
              <div className="mt-8">
                <ShimmerButton onClick={() => setSuccess(false)}>
                  Submit Another Request
                </ShimmerButton>
              </div>
            </div>
          </MagicCard>
        </div>
      </section>
    );
  }

  // Loading screen
  if (loadingData) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <MagicCard className="text-center">
            <div className="py-12 bg-white/90 rounded-2xl">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading pricing data...</p>
            </div>
          </MagicCard>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <AnimatedGradientText className="text-4xl md:text-5xl font-bold text-slate-900">
            Schedule Your Paid E-Waste Pickup
          </AnimatedGradientText>
          <p className="mt-4 text-xl text-slate-600">
            Professional e-waste collection service. Pay only for what you dispose of.
          </p>
        </div>

        <MagicCard>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white/90 p-8 rounded-2xl">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 1. Item Selection Section */}
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-4">
                What items do you need picked up? *
              </label>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                      <select
                        value={item.category_key || ''}
                        onChange={(e) => handleItemCategoryChange(index, e.target.value)}
                        className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select Category</option>
                        {pricingCategories.map(category => (
                          <option key={category.category_key} value={category.category_key}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                        className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    {/* Unit Price (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Unit Price</label>
                      <input
                        type="text"
                        value={`LKR ${parseFloat(item.price || 0).toFixed(2)}`}
                        readOnly
                        className="w-full rounded-lg bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 text-sm cursor-not-allowed"
                      />
                    </div>

                    {/* Total Price & Actions */}
                    <div className="flex items-end justify-between">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Total</label>
                        <div className="text-blue-600 font-bold text-lg">
                          LKR {((parseFloat(item.price || 0)) * parseInt(item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={formData.items.length === 1}
                        className="p-2 text-red-500 hover:text-red-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Category Description */}
                    {item.category && (
                      <div className="md:col-span-4 mt-2">
                        <p className="text-xs text-slate-500">
                          {pricingCategories.find(cat => cat.category_key === item.category_key)?.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={addItemRow}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Add Another Item
                </button>

                {/* Photo Upload Section */}
                <div>
                  <label className="block text-lg font-medium text-slate-900 mb-2">
                    Upload Photos (Optional)
                  </label>
                  <p className="text-sm text-slate-600 mb-4">
                    Help us better assess your items by uploading photos. Maximum 5 photos, 5MB each.
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                    
                    {photoPreview.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {photoPreview.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={formData.preferredDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    />
                    <p className="text-xs text-slate-500 mt-1">Weekdays only</p>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Preferred Time Slot *
                    </label>
                    <select
                      name="preferredTime"
                      required
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Name of person who will be present"
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Your phone number for pickup coordination"
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    />
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="block text-lg font-medium text-slate-900 mb-2">
                    Pickup Address *
                  </label>
                  <textarea
                    name="pickupAddress"
                    required
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter your complete pickup address..."
                    className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Floor / Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="pickupFloor"
                      value={formData.pickupFloor}
                      onChange={handleChange}
                      placeholder="e.g., 2nd floor, Unit 5B"
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-slate-900 mb-2">
                      Building Access Info (Optional)
                    </label>
                    <input
                      type="text"
                      name="buildingAccessInfo"
                      value={formData.buildingAccessInfo}
                      onChange={handleChange}
                      placeholder="Gate codes, parking instructions, etc."
                      className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-lg font-medium text-slate-900 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special instructions for the pickup team..."
                    className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-lg font-medium text-slate-900 mb-2">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={formData.paymentMethod === 'stripe'}
                        onChange={handleChange}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-slate-900 font-medium">Credit/Debit Card</div>
                        <div className="text-slate-600 text-sm">Secure payment via Stripe</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6 border-t border-slate-200">
                  <div className="mb-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      Total: LKR {totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      🌱 10% of your payment supports sustainable recycling projects in Sri Lanka
                    </div>
                  </div>
                  <ShimmerButton
                    type="submit"
                    disabled={loading || totalAmount <= 0}
                    className="px-12 py-4 text-lg"
                  >
                    {loading ? 'Processing...' : `Pay LKR ${totalAmount.toFixed(2)} & Schedule Pickup`}
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </form>
        </MagicCard>
      </div>
    </section>
  );
};

export default RequestPickupForm; 