import { supabase } from '../lib/supabase';

class RecyclingCenterService {
  /**
   * Get all available recycling centers from profiles table
   * Uses Supabase directly for better reliability
   */
  async getAvailableCenters() {
    try {
      console.log('Fetching recycling centers from profiles table...');
      
      // Get recycling centers from profiles table where role = 'RECYCLING_CENTER'
      const { data: centers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'RECYCLING_CENTER')
        .eq('status', 'active');

      if (error) {
        console.error('Supabase error fetching recycling centers:', error);
        return { 
          success: false, 
          error: `Database error: ${error.message}`,
          data: [] 
        };
      }

      console.log('Raw centers from database:', centers);

      if (!centers || centers.length === 0) {
        console.log('No recycling centers found in profiles table');
        return { 
          success: false, 
          error: 'No recycling centers found in profiles table. Please add profiles with role=\'RECYCLING_CENTER\'',
          data: [] 
        };
      }

      // Transform database data to match expected format
      const transformedCenters = centers.map(center => ({
        id: center.id,
        name: center.name || center.center_name || 'Unknown Center',
        address: center.address || 'Address not provided',
        phone: center.phone || 'Phone not provided',
        email: center.email,
        status: center.status || 'active',
        materials: center.accepted_materials || ['Electronics', 'Computers', 'Mobile Phones', 'Batteries'],
        rating: 4.5, // Default rating
        reviews: 25, // Default review count
        capacity: center.capacity || '1000 kg',
        operating_hours: center.operating_hours || '9:00 AM - 6:00 PM'
      }));

      console.log(`Successfully found ${transformedCenters.length} recycling centers from profiles table:`, transformedCenters);
      return { success: true, data: transformedCenters };
      
    } catch (error) {
      console.error('Error fetching recycling centers from profiles table:', error);
      return { 
        success: false, 
        error: `Database error: ${error.message}`,
        data: [] 
      };
    }
  }

  /**
   * Get recycling centers that accept specific materials
   * Returns all active recycling centers since they all handle e-waste
   */
  async getCentersForMaterials(materials) {
    try {
      console.log('Getting recycling centers for materials:', materials);
      const result = await this.getAvailableCenters();
      
      if (!result.success) {
        console.log('Failed to get available centers:', result.error);
        return result;
      }

      // For e-waste, all recycling centers should accept the materials
      // Return all available centers since they all handle e-waste
      console.log(`Returning ${result.data.length} centers for materials`);
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('Error filtering centers by materials:', error);
      return { 
        success: false, 
        error: `Error filtering centers: ${error.message}`,
        data: []
      };
    }
  }

  /**
   * Get recycling center details by ID from profiles table
   */
  async getCenterById(centerId) {
    try {
      console.log(`Fetching recycling center with ID: ${centerId}`);
      
      const { data: centers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', centerId)
        .eq('role', 'RECYCLING_CENTER');

      if (error) {
        console.error('Supabase error fetching recycling center by ID:', error);
        return { 
          success: false, 
          error: `Database error: ${error.message}` 
        };
      }

      if (!centers || centers.length === 0) {
        return { 
          success: false, 
          error: `Recycling center with ID ${centerId} not found in profiles table` 
        };
      }

      const center = centers[0];
      
      // Transform the data
      const transformedCenter = {
        id: center.id,
        name: center.name || center.center_name || 'Unknown Center',
        address: center.address || 'Address not provided',
        phone: center.phone || 'Phone not provided',
        email: center.email,
        status: center.status || 'active',
        materials: center.accepted_materials || ['Electronics', 'Computers', 'Mobile Phones', 'Batteries'],
        rating: 4.5,
        reviews: 25,
        capacity: center.capacity || '1000 kg',
        operating_hours: center.operating_hours || '9:00 AM - 6:00 PM'
      };

      return { success: true, data: transformedCenter };
      
    } catch (error) {
      console.error('Error fetching recycling center by ID:', error);
      return { 
        success: false, 
        error: `Database error: ${error.message}` 
      };
    }
  }

  /**
   * Update collection request with selected recycling center
   */
  async assignRecyclingCenter(requestId, centerId, collectorId) {
    try {
      console.log(`Assigning recycling center ${centerId} to request ${requestId} for collector ${collectorId}`);
      
      // First verify the recycling center exists
      const centerResult = await this.getCenterById(centerId);
      if (!centerResult.success) {
        return { 
          success: false, 
          error: `Invalid recycling center ID: ${centerId}` 
        };
      }

      // Get the collection request to check if it has a commission
      const { data: collectionRequest, error: fetchError } = await supabase
        .from('collection_requests')
        .select('id, collector_commission, total_amount, payment_status')
        .eq('id', requestId)
        .single();

      if (fetchError) {
        console.error('Error fetching collection request:', fetchError);
        return { 
          success: false, 
          error: `Failed to fetch collection request: ${fetchError.message}` 
        };
      }

      // Update the collection request using Supabase
      const { data: updatedRequest, error } = await supabase
        .from('collection_requests')
        .update({ 
          recycling_center_id: centerId,
          collector_id: collectorId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error updating collection request:', error);
        return { 
          success: false, 
          error: `Failed to update collection request: ${error.message}` 
        };
      }

      // Create collector earnings record if this is a paid request with commission
      if (collectionRequest.collector_commission && collectionRequest.collector_commission > 0) {
        console.log(`Creating collector earnings record for commission: LKR ${collectionRequest.collector_commission}`);
        
        // Check if earnings record already exists
        const { data: existingEarnings } = await supabase
          .from('collector_earnings')
          .select('id')
          .eq('collection_request_id', requestId)
          .eq('collector_id', collectorId);

        if (!existingEarnings || existingEarnings.length === 0) {
          // Create new earnings record with 'pending' status
          const { data: earningsRecord, error: earningsError } = await supabase
            .from('collector_earnings')
            .insert({
              collector_id: collectorId,
              collection_request_id: requestId,
              amount: parseFloat(collectionRequest.collector_commission),
              status: 'pending', // Will be updated to 'paid' when recycling center confirms delivery
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (earningsError) {
            console.error('Error creating collector earnings:', earningsError);
            // Don't fail the whole operation, just log the error
          } else {
            console.log('Collector earnings record created:', earningsRecord);
          }
        } else {
          console.log('Collector earnings record already exists for this request');
        }
      } else {
        console.log('No commission to track (free collection or zero commission)');
      }

      console.log('Successfully assigned recycling center to request:', updatedRequest);
      return { success: true, data: updatedRequest };
      
    } catch (error) {
      console.error('Error assigning recycling center:', error);
      return { 
        success: false, 
        error: `Assignment failed: ${error.message}` 
      };
    }
  }

  /**
   * Confirm delivery at recycling center and trigger commission payment
   */
  async confirmDelivery(deliveryId, centerId, notes = '') {
    try {
      console.log(`Confirming delivery ${deliveryId} at recycling center ${centerId}`);
      
      // First, get the delivery record to access collection request details
      const { data: delivery, error: deliveryFetchError } = await supabase
        .from('deliveries')
        .select(`
          *,
          collection_request:collection_requests!deliveries_collection_request_id_fkey(
            id,
            collector_id,
            total_amount,
            collector_commission,
            commission_paid
          )
        `)
        .eq('id', deliveryId)
        .single();
      
      if (deliveryFetchError) {
        console.error('Error fetching delivery:', deliveryFetchError);
        return { 
          success: false, 
          error: `Failed to fetch delivery: ${deliveryFetchError.message}` 
        };
      }

      if (!delivery.collection_request) {
        return {
          success: false,
          error: 'Collection request not found for this delivery'
        };
      }

      const collectionRequest = delivery.collection_request;
      
      // Update delivery status to processed (final status)
      const { data: updatedDelivery, error: deliveryError } = await supabase
        .from('deliveries')
        .update({ 
          status: 'processed',
          processing_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', deliveryId)
        .select()
        .single();
      
      if (deliveryError) {
        console.error('Error updating delivery:', deliveryError);
        return { 
          success: false, 
          error: `Failed to update delivery status: ${deliveryError.message}` 
        };
      }

      // Update collection request status to confirmed and mark commission as paid
      await supabase
        .from('collection_requests')
        .update({ 
          status: 'confirmed',
          commission_paid: true,
          commission_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionRequest.id);

      // Handle collector commission
      if (delivery.collector_id && collectionRequest.collector_commission > 0) {
        console.log(`Processing commission of LKR ${collectionRequest.collector_commission} for collector ${delivery.collector_id}`);
        
        // Check if commission record already exists
        const { data: existingEarnings } = await supabase
          .from('collector_earnings')
          .select('*')
          .eq('collection_request_id', collectionRequest.id)
          .eq('collector_id', delivery.collector_id);

        if (existingEarnings && existingEarnings.length > 0) {
          // Update existing commission record to paid
          const { data: updatedEarning, error: earningUpdateError } = await supabase
            .from('collector_earnings')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', existingEarnings[0].id)
            .select()
            .single();
          
          if (earningUpdateError) {
            console.error('Error updating collector earnings:', earningUpdateError);
            // Don't fail the whole operation, just log the error
          } else {
            console.log('Existing collector commission marked as paid:', updatedEarning);
          }
        } else {
          // Create new commission record and mark as paid immediately
          const { data: newEarning, error: earningCreateError } = await supabase
            .from('collector_earnings')
            .insert({
              collector_id: delivery.collector_id,
              collection_request_id: collectionRequest.id,
              amount: parseFloat(collectionRequest.collector_commission),
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (earningCreateError) {
            console.error('Error creating collector earnings:', earningCreateError);
            // Don't fail the whole operation, just log the error
          } else {
            console.log('New collector commission created and marked as paid:', newEarning);
          }
        }
      } else {
        console.log('No collector commission to process (collector_id or commission amount missing)');
      }

      console.log('Delivery confirmed and commission processed successfully');
      return { 
        success: true, 
        data: {
          delivery: updatedDelivery,
          collectionRequest: collectionRequest,
          commissionProcessed: delivery.collector_id && collectionRequest.collector_commission > 0
        }
      };
      
    } catch (error) {
      console.error('Error confirming delivery:', error);
      return { 
        success: false, 
        error: `Confirmation failed: ${error.message}` 
      };
    }
  }

  /**
   * Create sample recycling center for testing (admin use only)
   */
  async createSampleRecyclingCenter() {
    try {
      console.log('Creating sample recycling center...');
      
      const sampleCenter = {
        name: 'EcoTech Recycling Center',
        email: 'contact@ecotech-center.com',
        role: 'RECYCLING_CENTER',
        status: 'active',
        phone: '+1 (555) 123-4567',
        address: '123 Green Valley Road, Eco City, EC 12345',
        center_name: 'EcoTech Recycling Center',
        operating_hours: '8:00 AM - 6:00 PM',
        accepted_materials: ['Electronics', 'Computers', 'Mobile Phones', 'Batteries', 'Cables', 'Printers'],
        capacity: '2000 kg',
        area: 'Central District',
        district: 'Eco City',
        additional_info: 'Specialized in electronic waste recycling with certified processing facilities'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([sampleCenter])
        .select()
        .single();

      if (error) {
        console.error('Error creating sample recycling center:', error);
        return { success: false, error: error.message };
      }

      console.log('Sample recycling center created successfully:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('Error creating sample recycling center:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if any recycling centers exist, and create sample if none found
   */
  async ensureRecyclingCentersExist() {
    try {
      const centersResult = await this.getAvailableCenters();
      
      if (!centersResult.success || centersResult.data.length === 0) {
        console.log('No recycling centers found. Creating sample center...');
        const createResult = await this.createSampleRecyclingCenter();
        
        if (createResult.success) {
          // Return the newly created center
          return await this.getAvailableCenters();
        }
        
        return createResult;
      }
      
      return centersResult;
    } catch (error) {
      console.error('Error ensuring recycling centers exist:', error);
      return { success: false, error: error.message };
    }
  }
}

const recyclingCenterService = new RecyclingCenterService();
export default recyclingCenterService; 