import { supabase } from '../lib/supabase';
import { db } from '../lib/database.js';

// Enhanced error handling utility
const handleError = (error, context) => {
  console.error(`[PaidCollectionService] Error in ${context}:`, error);
  
  // Handle specific Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST301':
        throw new Error('Database connection error. Please try again.');
      case '23505':
        throw new Error('This request already exists.');
      case '23503':
        throw new Error('Invalid reference data. Please check your input.');
      case '23502':
        throw new Error('Required data is missing. Please fill all required fields.');
      case '42501':
        throw new Error('Permission denied. Please contact support.');
      case 'PGRST116':
        throw new Error('No data found or access denied.');
      default:
        // Handle constraint violations specifically
        if (error.message?.includes('not-null constraint')) {
          const columnMatch = error.message.match(/column "([^"]+)"/);
          const column = columnMatch ? columnMatch[1] : 'unknown field';
          throw new Error(`Missing required field: ${column}. Please ensure all required data is provided.`);
        }
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }
  
  // Handle network errors
  if (error?.message?.includes('fetch')) {
    throw new Error('Network error. Please check your connection and try again.');
  }
  
  // Generic error
  throw new Error(error?.message || 'An unexpected error occurred. Please try again.');
};

class PaidCollectionService {
  constructor() {
    // Configuration - replace with actual Stripe public key when ready for production
    this.stripePublicKey = 'pk_test_...'; // Replace with actual key
  }

  // Sri Lankan Payment Structure Constants
  static COLLECTOR_COMMISSION_RATE = 0.30; // 30%
  static SUSTAINABILITY_FUND_RATE = 0.10;  // 10%
  static PLATFORM_REVENUE_RATE = 0.60;     // 60%
  static CURRENCY = 'LKR';

  /**
   * Get all pricing categories for the form
   */
  async getPricingCategories() {
    try {
      const result = await db.getActivePricingCategories();
      
      if (!result.success) {
        handleError(new Error(result.error), 'getPricingCategories');
      }
      
      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate total amount for items
   */
  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
  }

  /**
   * Calculate collector commission (30% for Sri Lanka)
   */
  static calculateCollectorCommission(totalAmount) {
    return parseFloat(totalAmount) * this.COLLECTOR_COMMISSION_RATE;
  }

  /**
   * Calculate sustainability fund amount (10% for Sri Lanka)
   */
  static calculateSustainabilityFund(totalAmount) {
    return parseFloat(totalAmount) * this.SUSTAINABILITY_FUND_RATE;
  }

  /**
   * Calculate platform revenue (60% for Sri Lanka)
   */
  static calculatePlatformRevenue(totalAmount) {
    return parseFloat(totalAmount) * this.PLATFORM_REVENUE_RATE;
  }

  /**
   * Instance method - Calculate collector commission (30% for Sri Lanka)
   */
  calculateCollectorCommission(totalAmount) {
    return parseFloat(totalAmount) * PaidCollectionService.COLLECTOR_COMMISSION_RATE;
  }

  /**
   * Instance method - Calculate sustainability fund amount (10% for Sri Lanka)
   */
  calculateSustainabilityFund(totalAmount) {
    return parseFloat(totalAmount) * PaidCollectionService.SUSTAINABILITY_FUND_RATE;
  }

  /**
   * Instance method - Calculate platform revenue (60% for Sri Lanka)
   */
  calculatePlatformRevenue(totalAmount) {
    return parseFloat(totalAmount) * PaidCollectionService.PLATFORM_REVENUE_RATE;
  }

  /**
   * Create collection request with Sri Lankan payment structure
   */
  static async createCollectionRequest(requestData) {
    try {
      const totalAmount = parseFloat(requestData.total_amount);
      const collectorCommission = this.calculateCollectorCommission(totalAmount);
      const sustainabilityFund = this.calculateSustainabilityFund(totalAmount);
      const platformRevenue = this.calculatePlatformRevenue(totalAmount);

      // Create the collection request with Sri Lankan structure
      const collectionData = {
        ...requestData,
        currency: this.CURRENCY,
        collector_commission: collectorCommission,
        sustainability_fund_amount: sustainabilityFund,
        platform_revenue: platformRevenue,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('collection_requests')
        .insert([collectionData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error creating collection request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process payment completion and create sustainability fund entry
   */
  static async processPaymentCompletion(collectionRequestId, customerId, totalAmount) {
    try {
      const sustainabilityAmount = this.calculateSustainabilityFund(totalAmount);
      const platformAmount = this.calculatePlatformRevenue(totalAmount);

      // Create sustainability fund entry
      const { error: fundError } = await supabase
        .from('sustainability_fund')
        .insert([{
          collection_request_id: collectionRequestId,
          user_id: customerId,
          amount: sustainabilityAmount,
          currency: this.CURRENCY,
          description: 'Contribution to sustainable e-waste recycling projects'
        }]);

      if (fundError) throw fundError;

      // Create platform revenue entry
      const { error: revenueError } = await supabase
        .from('platform_revenue')
        .insert([{
          collection_request_id: collectionRequestId,
          amount: platformAmount,
          currency: this.CURRENCY,
          percentage: this.PLATFORM_REVENUE_RATE * 100
        }]);

      if (revenueError) throw revenueError;

      return { success: true };
    } catch (error) {
      console.error('Error processing payment completion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process collector commission when delivery is completed
   */
  static async processCollectorCommission(collectionRequestId, collectorId, totalAmount) {
    try {
      const commissionAmount = this.calculateCollectorCommission(totalAmount);

      // Create collector earnings entry with 30% commission
      const { error } = await supabase
        .from('collector_earnings')
        .insert([{
          collection_request_id: collectionRequestId,
          collector_id: collectorId,
          commission_amount: commissionAmount,
          commission_percentage: this.COLLECTOR_COMMISSION_RATE * 100,
          currency: this.CURRENCY,
          status: 'pending',
          earned_at: new Date().toISOString()
        }]);

      if (error) throw error;

      return { success: true, commission: commissionAmount };
    } catch (error) {
      console.error('Error processing collector commission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send sustainability fund notification to customer
   */
  static async sendSustainabilityNotification(customerId, collectionRequestId, sustainabilityAmount) {
    try {
      const message = `Great news! From your e-waste collection payment, LKR ${sustainabilityAmount.toFixed(2)} (10%) has been contributed to our sustainable recycling projects. Thank you for supporting environmental conservation in Sri Lanka! 🌱`;

      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: customerId,
          type: 'sustainability_contribution',
          title: 'Sustainability Fund Contribution',
          message: message,
          related_id: collectionRequestId,
          is_read: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error sending sustainability notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a paid collection request
   */
  async createPaidCollectionRequest(requestData) {
    try {
      // Input validation
      if (!requestData.user_id) {
        throw new Error('User ID is required');
      }
      if (!requestData.items || requestData.items.length === 0) {
        throw new Error('At least one item is required');
      }

      // Calculate totals
      const totalAmount = this.calculateTotal(requestData.items);
      const collectorCommission = this.calculateCollectorCommission(totalAmount);

      if (totalAmount <= 0) {
        throw new Error('Total amount must be greater than zero');
      }

      // Extract item types and quantities for legacy fields
      const itemTypes = requestData.items.map(item => item.category || item.category_key).filter(Boolean);
      const quantities = requestData.items.map(item => `${item.quantity || 1}`).join(', '); // Legacy text field
      
      console.log('Extracted item types:', itemTypes);
      console.log('Extracted quantities:', quantities);
      console.log('Request items:', requestData.items);

      const collectionData = {
        user_id: requestData.user_id,
        item_types: itemTypes, // Required legacy field (ARRAY type)
        quantities: quantities, // Required legacy field (TEXT type)
        items: requestData.items, // New JSONB field with detailed item data
        total_amount: totalAmount,
        collector_commission: collectorCommission,
        preferred_date: requestData.preferred_date,
        preferred_time: requestData.preferred_time,
        contact_person: requestData.contact_person,
        contact_phone: requestData.contact_phone,
        address: requestData.address,
        pickup_floor: requestData.pickup_floor,
        building_access_info: requestData.building_access_info,
        special_instructions: requestData.special_instructions,
        item_photos: requestData.item_photos || [],
        payment_method: requestData.payment_method,
        payment_status: 'paid', // Auto-set as paid
        status: 'pending' // Immediately visible to collectors
      };

      console.log('Creating collection request with data:', collectionData);

      const { data, error } = await supabase
        .from('collection_requests')
        .insert([collectionData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        handleError(error, 'createPaidCollectionRequest');
      }

      console.log('Collection request created successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in createPaidCollectionRequest:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Stripe payment session
   */
  async createStripeSession(collectionRequestId, items, totalAmount, successUrl, cancelUrl) {
    try {
      // Create line items for Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.category} - E-Waste Pickup`,
            description: `${item.quantity}x ${item.category}`,
          },
          unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
        },
        quantity: parseInt(item.quantity),
      }));

      // Call your backend API to create Stripe session
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionRequestId,
          lineItems,
          successUrl,
          cancelUrl,
          totalAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const session = await response.json();

      // Update collection request with Stripe session ID
      await supabase
        .from('collection_requests')
        .update({ 
          stripe_session_id: session.id,
          payment_status: 'session_created'
        })
        .eq('id', collectionRequestId);

      return { success: true, data: session };
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(collectionRequestId, paymentIntentId) {
    try {
      const { data, error } = await supabase
        .from('collection_requests')
        .update({
          payment_status: 'paid',
          payment_intent_id: paymentIntentId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionRequestId)
        .select()
        .single();

      if (error) throw error;

      // Create payment transaction record
      await supabase
        .from('payment_transactions')
        .insert([{
          collection_request_id: collectionRequestId,
          stripe_payment_intent_id: paymentIntentId,
          amount: data.total_amount,
          status: 'succeeded',
          payment_method: data.payment_method
        }]);

      return { success: true, data };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete pickup and pay collector commission
   */
  async completePickupAndPayCommission(collectionRequestId, collectorId) {
    try {
      // Update collection request as completed
      const { data: request, error: requestError } = await supabase
        .from('collection_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          collector_id: collectorId
        })
        .eq('id', collectionRequestId)
        .select()
        .single();

      if (requestError) throw requestError;

      // Create collector earnings record
      const { data: earning, error: earningError } = await supabase
        .from('collector_earnings')
        .upsert([{
          collector_id: collectorId,
          collection_request_id: collectionRequestId,
          amount: request.collector_commission,
          status: 'paid',
          paid_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (earningError) throw earningError;

      await supabase
        .from('collection_requests')
        .update({
          commission_paid: true,
          commission_paid_at: new Date().toISOString()
        })
        .eq('id', collectionRequestId);

      return { success: true, data: { request, earning } };
    } catch (error) {
      console.error('Error completing pickup and paying commission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get collector earnings
   */
  async getCollectorEarnings(collectorId) {
    try {
      const { data, error } = await supabase
        .from('collector_earnings')
        .select(`
          *,
          collection_request:collection_requests(
            id,
            total_amount,
            preferred_date,
            address,
            status
          )
        `)
        .eq('collector_id', collectorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totalEarnings = data.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
      const paidEarnings = data
        .filter(earning => earning.status === 'paid')
        .reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
      const pendingEarnings = data
        .filter(earning => earning.status === 'pending')
        .reduce((sum, earning) => sum + parseFloat(earning.amount), 0);

      return {
        success: true,
        data: {
          earnings: data,
          summary: {
            total: totalEarnings,
            paid: paidEarnings,
            pending: pendingEarnings
          }
        }
      };
    } catch (error) {
      console.error('Error fetching collector earnings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's paid collection requests
   */
  async getUserPaidRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('collection_requests')
        .select(`
          *,
          collector:collector_id(name, phone),
          payment_transactions(*)
        `)
        .eq('user_id', userId)
        .not('total_amount', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user paid requests:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available time slots
   */
  getAvailableTimeSlots() {
    return [
      { value: '8-10', label: '8:00 AM - 10:00 AM' },
      { value: '10-12', label: '10:00 AM - 12:00 PM' },
      { value: '12-14', label: '12:00 PM - 2:00 PM' },
      { value: '14-16', label: '2:00 PM - 4:00 PM' },
      { value: '16-18', label: '4:00 PM - 6:00 PM' }
    ];
  }

  /**
   * Validate pickup date (no past dates, weekdays only)
   */
  isValidPickupDate(date) {
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Must be at least tomorrow
    if (selectedDate < tomorrow) return false;
    
    // Monday-Friday only (1-5, where 0=Sunday, 6=Saturday)
    const dayOfWeek = selectedDate.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  /**
   * Upload photos to Supabase Storage
   */
  async uploadPhotos(files, userId) {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${index}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('collection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('collection-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const photoUrls = await Promise.all(uploadPromises);
      return { success: true, data: photoUrls };
    } catch (error) {
      console.error('Error uploading photos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile for pre-populating form
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, phone, default_pickup_address, address, district, area')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error.message };
    }
  }
}

export const paidCollectionService = new PaidCollectionService(); 