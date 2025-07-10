import { supabase } from '../lib/supabase.js';

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export const authService = {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      console.log('AuthContext: Signing up user...', email);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('AuthContext: Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('AuthContext: Auth signup successful:', authData.user.id);

      // Create profile using the database function
      const { data: profileData, error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: authData.user.id,
          user_name: userData.name,
          user_email: email,
          user_role: userData.role,
          user_phone: userData.phone || null,
          address: userData.address || null,
          district: userData.district || null,
          area: userData.area || null,
          default_pickup_address: userData.defaultPickupAddress || null,
          vehicle_type: userData.vehicleType || null,
          license_number: userData.licenseNumber || null,
          coverage_area: userData.coverageArea || null,
          availability: userData.availability || null,
          preferred_schedule: userData.preferredSchedule || null,
          additional_info: userData.additionalInfo || null,
          center_name: userData.centerName || null,
          operating_hours: userData.operatingHours || null,
          accepted_materials: userData.acceptedMaterials || null,
          capacity: userData.capacity || null
        });

      if (profileError) {
        console.error('AuthContext: Profile creation error:', profileError);
        throw profileError;
      }

      console.log('AuthContext: Profile created successfully');

      return { user: authData.user, profile: profileData };
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      console.log('AuthContext: Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthContext: Auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      console.log('AuthContext: Auth successful, fetching profile...');

      // Fetch user profile
      const profile = await this.getProfile(data.user.id);
      
      return { user: data.user, profile };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('AuthContext: Profile fetch error:', error);
      throw error;
    }

    return data;
  },

  // Update profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Change password
  async changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  // Upload profile picture
  async uploadProfilePicture(userId, file) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const profilePictureUrl = urlData.publicUrl;

      // Update user profile with new picture URL
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: profilePictureUrl })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        profilePictureUrl,
        profile: profileData
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Delete profile picture
  async deleteProfilePicture(userId) {
    try {
      // Get current profile to find existing picture
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', userId)
        .single();

      if (getError) throw getError;

      // Delete from storage if exists
      if (profile.profile_picture_url) {
        const filePath = profile.profile_picture_url.split('/').pop();
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove([`profile-pictures/${filePath}`]);

        if (deleteError) {
          console.warn('Error deleting file from storage:', deleteError);
        }
      }

      // Update profile to remove picture URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  // Check authentication state
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// COLLECTION REQUEST SERVICES
// ============================================================================

export const collectionService = {
  // Create a new collection request
  async createRequest(requestData) {
    const { data, error } = await supabase
      .from('collection_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload collection photos to Supabase Storage
  async uploadCollectionPhotos(files, userId) {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('collection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('collection-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const photoUrls = await Promise.all(uploadPromises);
      return { success: true, data: photoUrls };
    } catch (error) {
      console.error('Error uploading collection photos:', error);
      return { success: false, error: error.message };
    }
  },

  // Get collection requests for a user
  async getUserRequests(userId) {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        collector:profiles!fk_collection_requests_collector_id(*),
        recycling_center:recycling_centers!collection_requests_recycling_center_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user requests:', error);
      // If the complex query fails, try a simpler one
      const { data: simpleData, error: simpleError } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (simpleError) throw simpleError;
      return simpleData;
    }
    return data;
  },

  // Get collection requests for a collector
  async getCollectorRequests(collectorId) {
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        user:profiles!fk_collection_requests_user_id(*),
        recycling_center:recycling_centers!collection_requests_recycling_center_id_fkey(*)
      `)
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all collection requests (admin)
  async getAllRequests() {
    try {
      // Try different foreign key relationship approaches
      const { data, error } = await supabase
        .from('collection_requests')
        .select(`
          *,
          user:profiles!user_id(*),
          collector:profiles!collector_id(*),
          recycling_center:recycling_centers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('First query failed, trying alternative approach:', error);
        
        // Try with explicit foreign key names
        const { data: altData, error: altError } = await supabase
          .from('collection_requests')
          .select(`
            *,
            user:profiles!collection_requests_user_id_fkey(*),
            collector:profiles!collection_requests_collector_id_fkey(*)
          `)
          .order('created_at', { ascending: false });
        
        if (altError) {
          console.warn('Alternative query failed, using simple query:', altError);
          
          // Fallback to simple query and manually fetch related data
          const { data: simpleData, error: simpleError } = await supabase
            .from('collection_requests')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (simpleError) {
            console.error('Simple query also failed:', simpleError);
            throw simpleError;
          }
          
          // Manually fetch user and collector data for each request
          const enrichedData = await Promise.all(
            simpleData.map(async (request) => {
              try {
                // Fetch user data
                let userData = null;
                if (request.user_id) {
                  const { data: user } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', request.user_id)
                    .single();
                  userData = user;
                }
                
                // Fetch collector data
                let collectorData = null;
                if (request.collector_id) {
                  const { data: collector } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', request.collector_id)
                    .single();
                  collectorData = collector;
                }
                
                return {
                  ...request,
                  user: userData,
                  collector: collectorData
                };
              } catch (enrichError) {
                console.warn('Error enriching request data:', enrichError);
                return request;
              }
            })
          );
          
          console.log('Manual enrichment succeeded, returning data:', enrichedData);
          return enrichedData;
        }
        
        console.log('Alternative query succeeded, returning data:', altData);
        return altData;
      }
      
      console.log('First query succeeded, returning data:', data);
      return data;
    } catch (error) {
      console.error('Error in getAllRequests:', error);
      throw error;
    }
  },

  // Update collection request
  async updateRequest(requestId, updates) {
    const { data, error } = await supabase
      .from('collection_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Assign collector to request
  async assignCollector(requestId, collectorId) {
    return this.updateRequest(requestId, { 
      collector_id: collectorId,
      status: 'assigned'
    });
  },

  // Delete collection request (admin only)
  async deleteRequest(requestId) {
    try {
      console.log('Deleting collection request:', requestId);
      
      // First, delete any related deliveries
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .delete()
        .eq('collection_request_id', requestId);
      
      if (deliveryError) {
        console.warn('Warning: Could not delete related deliveries:', deliveryError);
      }
      
      // Delete any related collector earnings
      const { error: earningsError } = await supabase
        .from('collector_earnings')
        .delete()
        .eq('collection_request_id', requestId);
      
      if (earningsError) {
        console.warn('Warning: Could not delete related earnings:', earningsError);
      }
      
      // Finally, delete the collection request
      const { data, error } = await supabase
        .from('collection_requests')
        .delete()
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('Collection request deleted successfully:', requestId);
      return data;
    } catch (error) {
      console.error('Error deleting collection request:', error);
      throw error;
    }
  }
};

// ============================================================================
// RECYCLING CENTER SERVICES
// ============================================================================

export const recyclingCenterService = {
  // Get all recycling centers
  async getAllCenters() {
    try {
      console.log('Fetching recycling centers from profiles table...');
      
      // Get recycling centers from profiles table where role = 'RECYCLING_CENTER'
      const { data: centers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'RECYCLING_CENTER')
        .in('status', ['active', 'pending_approval'])
        .order('name');

      if (error) {
        console.error('Error fetching recycling centers:', error);
        throw error;
      }

      if (!centers || centers.length === 0) {
        console.log('No recycling centers found in profiles table');
        return [];
      }

      // Transform database data to match expected format for the map component
      const transformedCenters = centers.map(center => {
        const latitude = parseFloat(center.center_latitude) || 7.0873; // Default to Sri Lanka center
        const longitude = parseFloat(center.center_longitude) || 79.999;

        return {
          id: center.id,
          name: center.center_name || center.name || 'Unknown Center',
          address: center.address || 'Address not provided',
          phone: center.phone || 'Phone not provided',
          email: center.email,
          hours: center.operating_hours || '9:00 AM - 6:00 PM',
          materials: center.accepted_materials || ['Electronics', 'Computers', 'Mobile Phones', 'Batteries'],
          rating: 4.5, // Default rating
          reviews: 25, // Default review count
          status: center.status === 'active' ? 'approved' : center.status,
          coordinates: [latitude, longitude], // Format coordinates for Leaflet map
          user_id: center.id
        };
      });

      console.log(`Successfully found ${transformedCenters.length} recycling centers:`, transformedCenters);
      return transformedCenters;
      
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
      throw error;
    }
  },

  // Get recycling center by ID
  async getCenterById(centerId) {
    try {
      console.log(`Fetching recycling center with ID: ${centerId}`);
      
      const { data: center, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', centerId)
        .eq('role', 'RECYCLING_CENTER')
        .single();

      if (error) {
        console.error('Error fetching recycling center by ID:', error);
        throw error;
      }

      if (!center) {
        throw new Error(`Recycling center with ID ${centerId} not found`);
      }

      // Transform the data to match expected format
      const latitude = parseFloat(center.center_latitude) || 7.0873;
      const longitude = parseFloat(center.center_longitude) || 79.999;

      const transformedCenter = {
        id: center.id,
        name: center.center_name || center.name || 'Unknown Center',
        address: center.address || 'Address not provided',
        phone: center.phone || 'Phone not provided',
        email: center.email,
        hours: center.operating_hours || '9:00 AM - 6:00 PM',
        materials: center.accepted_materials || ['Electronics', 'Computers', 'Mobile Phones', 'Batteries'],
        rating: 4.5,
        reviews: 25,
        status: center.status === 'active' ? 'approved' : center.status,
        coordinates: [latitude, longitude],
        user_id: center.id
      };

      return transformedCenter;
      
    } catch (error) {
      console.error('Error fetching recycling center by ID:', error);
      throw error;
    }
  },

  // Create recycling center
  async createCenter(centerData) {
    const { data, error } = await supabase
      .from('recycling_centers')
      .insert([centerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update recycling center
  async updateCenter(centerId, updates) {
    const { data, error } = await supabase
      .from('recycling_centers')
      .update(updates)
      .eq('id', centerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get pending recycling center registrations (from profiles table)
  async getPendingCenters() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'RECYCLING_CENTER')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Approve recycling center registration
  async approveCenterRegistration(userId) {
    try {
      // Update profile status to active
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      // Optionally create entry in recycling_centers table for map display
      if (profile.center_name && profile.address) {
        const { data: center, error: centerError } = await supabase
          .from('recycling_centers')
          .insert({
            name: profile.center_name,
            address: profile.address,
            phone: profile.phone,
            email: profile.email,
            hours: profile.operating_hours || 'Contact for hours',
            materials: profile.accepted_materials || ['Electronics'],
            status: 'approved',
            user_id: userId
          })
          .select()
          .single();

        if (centerError) {
          console.warn('Failed to create recycling center entry:', centerError);
        } else {
          console.log('Created recycling center entry:', center);
        }
      }

      return profile;
    } catch (error) {
      console.error('Error approving recycling center:', error);
      throw error;
    }
  }
};

// ============================================================================
// USER MANAGEMENT SERVICES
// ============================================================================

export const userService = {
  // Get all users (admin)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get users by role
  async getUsersByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get collectors
  async getCollectors() {
    return this.getUsersByRole('COLLECTOR');
  },

  // Get active collectors
  async getActiveCollectors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'COLLECTOR')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Update user status
  async updateUserStatus(userId, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deactivate account
  async deactivateAccount(userId) {
    return this.updateUserStatus(userId, 'deactivated');
  },

  // Reactivate account
  async reactivateAccount(userId) {
    return this.updateUserStatus(userId, 'active');
  },

  // Get deactivated accounts
  async getDeactivatedAccounts() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_status', 'deactivated')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Delete account permanently
  async deleteAccount(userId) {
    try {
      // Get user profile first to retrieve original email for cleanup
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('email, profile_picture_url')
        .eq('id', userId)
        .single();

      if (profileFetchError) {
        console.warn('Could not fetch profile data:', profileFetchError);
      }

      const originalEmail = profileData?.email;

      // Step 1: Delete profile picture from storage if exists
      if (profileData?.profile_picture_url) {
        try {
          const filePath = profileData.profile_picture_url.split('/').pop();
          await supabase.storage
            .from('profiles')
            .remove([`profile-pictures/${filePath}`]);
        } catch (storageError) {
          console.warn('Error deleting profile picture from storage:', storageError);
        }
      }

      // Step 2: Cancel any pending collection requests
      await supabase
        .from('collection_requests')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed']);

      // Step 3: Anonymize profile data BUT use a timestamp-based email to free up the original email
      // This approach maintains referential integrity while allowing email reuse
      const timestamp = Date.now();
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          account_status: 'deleted',
          status: 'deleted',
          email: `deleted_${timestamp}_${userId}@deleted.local`, // Unique anonymized email
          name: 'Deleted User',
          phone: null,
          address: null,
          profile_picture_url: null,
          password_hash: null, // Clear password hash for security
          // Keep other fields for data integrity but anonymize sensitive data
          district: null,
          area: null,
          default_pickup_address: null,
          date_of_birth: null,
          bio: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error anonymizing user profile:', profileError);
        throw new Error(`Failed to anonymize user profile: ${profileError.message}`);
      }

      console.log(`Account deletion completed for user ${userId} (${originalEmail})`);

      return { 
        success: true, 
        message: 'Account deleted successfully. You can now create a new account with the same email.',
        deletedEmail: originalEmail 
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
};

// ============================================================================
// DELIVERY SERVICES
// ============================================================================

export const deliveryService = {
  // Create delivery
  async createDelivery(deliveryData) {
    try {
      // Ensure status is explicitly set to avoid database default issues
      const dataToInsert = {
        ...deliveryData,
        status: deliveryData.status || 'delivered' // Explicitly set status
      };
      
      const { data, error } = await supabase
        .from('deliveries')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Handle unique constraint violation - delivery already exists for this collection request
      if (error.code === '23505' && error.message.includes('deliveries_collection_request_id_unique')) {
        // Check if existing delivery record exists and update it with new status if needed
        const { data: existingDelivery, error: fetchError } = await supabase
          .from('deliveries')
          .select('*')
          .eq('collection_request_id', deliveryData.collection_request_id)
          .single();
        
        if (fetchError) throw error; // Original error if we can't fetch existing
        
        // If existing delivery has wrong status, update it
        if (existingDelivery.status === 'pending_delivery' && deliveryData.status === 'delivered') {
          const { data: updatedDelivery, error: updateError } = await supabase
            .from('deliveries')
            .update({ 
              status: 'delivered',
              delivered_at: deliveryData.delivered_at || new Date().toISOString()
            })
            .eq('id', existingDelivery.id)
            .select()
            .single();
          
          if (updateError) {
            console.warn('Failed to update existing delivery status:', updateError);
            return existingDelivery; // Return original if update fails
          }
          
          console.log('Updated existing delivery status to delivered:', updatedDelivery.id);
          return updatedDelivery;
        }
        
        console.log('Delivery already exists for collection request:', deliveryData.collection_request_id);
        return existingDelivery;
      }
      throw error;
    }
  },

  // Get deliveries for collector
  async getCollectorDeliveries(collectorId) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        collection_request:collection_requests!deliveries_collection_request_id_fkey(*),
        recycling_center:profiles!deliveries_recycling_center_id_fkey(*)
      `)
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update delivery status
  async updateDeliveryStatus(deliveryId, status, additionalData = {}) {
    const updates = { status, ...additionalData };
    
    // Add timestamp based on status
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    } else if (status === 'received') {
      updates.received_at = new Date().toISOString();
    } else if (status === 'processed') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get deliveries for recycling center
  async getDeliveries(centerId = null, status = null) {
    let query = supabase
      .from('deliveries')
      .select(`
        *,
        collection_request:collection_requests!deliveries_collection_request_id_fkey(*),
        collector:profiles!fk_deliveries_collector_id(*)
      `)
      .order('created_at', { ascending: false });

    if (centerId) {
      query = query.eq('recycling_center_id', centerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { deliveries: data };
  },

  // Confirm delivery receipt
  async confirmDelivery(deliveryId, actualWeight, processingNotes) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        status: 'delivered',
        processing_notes: processingNotes,
        delivered_at: new Date().toISOString()
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return { delivery: data };
  },

  // Update processing status
  async updateProcessingStatus(deliveryId, status, notes) {
    const updates = {
      processing_status: status,
      processing_notes: notes
    };

    if (status === 'processed') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return { delivery: data };
  }
};

// ============================================================================
// SUPPORT SERVICES
// ============================================================================

export const supportService = {
  // Submit support request
  async submitSupportRequest(requestData) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get support requests
  async getSupportRequests() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update support ticket
  async updateSupportTicket(ticketId, updates) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Respond to support ticket
  async respondToTicket(ticketId, response) {
    return this.updateSupportTicket(ticketId, {
      admin_response: response,
      status: 'resolved',
      responded_at: new Date().toISOString()
    });
  }
};

// ============================================================================
// FEEDBACK SERVICES
// ============================================================================

export const feedbackService = {
  // Submit feedback
  async submitFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all feedback (admin)
  async getAllFeedback() {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        user:profiles(*),
        collection_request:collection_requests(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update feedback status
  async updateFeedbackStatus(feedbackId, status, adminResponse = null) {
    const updates = { status };
    if (adminResponse) {
      updates.admin_response = adminResponse;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export const analyticsService = {
  // Get collection statistics
  async getCollectionStats() {
    const { data, error } = await supabase
      .from('collection_requests')
      .select('status, created_at, item_types, items');

    if (error) throw error;

    // Process the data to create statistics
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      completed: data.filter(r => r.status === 'completed').length,
      in_progress: data.filter(r => ['assigned', 'collected', 'delivered'].includes(r.status)).length,
      monthly: {}
    };

    // Group by month
    data.forEach(request => {
      const month = new Date(request.created_at).toISOString().slice(0, 7);
      if (!stats.monthly[month]) {
        stats.monthly[month] = 0;
      }
      stats.monthly[month]++;
    });

    return stats;
  },

  // Get user statistics
  async getUserStats() {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status, created_at');

    if (error) throw error;

    return {
      total: data.length,
      users: data.filter(u => u.role === 'PUBLIC').length,
      collectors: data.filter(u => u.role === 'COLLECTOR').length,
      recycling_centers: data.filter(u => u.role === 'RECYCLING_CENTER').length,
      admins: data.filter(u => u.role === 'ADMIN').length,
      active: data.filter(u => u.status === 'active').length,
      inactive: data.filter(u => u.status !== 'active').length
    };
  },

  // Get center statistics
  async getCenterStats(centerId = null) {
    let query = supabase
      .from('center_stats')
      .select('*');

    if (centerId) {
      query = query.eq('center_id', centerId);
    }

    const { data, error } = await query.order('month', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get system-wide statistics
  async getSystemStats() {
    try {
      // Get users count
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, status, role');

      if (usersError) throw usersError;

      // Get collection requests count
      const { data: requests, error: requestsError } = await supabase
        .from('collection_requests')
        .select('id, status, items');

      if (requestsError) throw requestsError;

      // Get recycling centers count
      const { data: centers, error: centersError } = await supabase
        .from('recycling_centers')
        .select('id, status');

      if (centersError) throw centersError;

      // Calculate totals
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const totalCenters = centers.length;
      const activeCenters = centers.filter(c => c.status === 'active').length;
      
      // Calculate total processed weight
      const totalProcessed = requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => {
          const items = r.items || [];
          return sum + (Array.isArray(items) ? items.reduce((count, item) => count + (item.quantity || 1), 0) : 0);
        }, 0);
      
      // Calculate CO2 saved (rough estimate: 1kg waste = 0.5kg CO2 saved)
      const co2Saved = totalProcessed * 0.5;

      return {
        totalUsers,
        activeUsers,
        totalRequests,
        completedRequests,
        totalCenters,
        activeCenters,
        totalProcessed,
        co2Saved
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }
};

// ============================================================================
// MATERIAL TYPES SERVICES
// ============================================================================

export const materialService = {
  // Get all material types
  async getAllMaterials() {
    const { data, error } = await supabase
      .from('material_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Create material type
  async createMaterial(materialData) {
    const { data, error } = await supabase
      .from('material_types')
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update material type
  async updateMaterial(materialId, updates) {
    const { data, error } = await supabase
      .from('material_types')
      .update(updates)
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// ACHIEVEMENTS SERVICES
// ============================================================================

export const achievementService = {
  // Get all achievements
  async getAllAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user achievements
  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Award achievement to user
  async awardAchievement(userId, achievementId, progress = null) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        progress
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// COLLECTOR APPLICATION SERVICES
// ============================================================================

export const collectorService = {
  // Create a new collector application
  async createCollectorApplication(applicationData) {
    try {
      console.log('Creating collector application:', applicationData);

      // Generate application number (max 20 chars)
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 chars
      const applicationNumber = `C${timestamp}${randomSuffix}`; // C + 8 digits + 3 chars = 12 chars total

      const { data, error } = await supabase
        .from('collector_applications')
        .insert({
          application_number: applicationNumber,
          full_name: applicationData.name,
          email: applicationData.email,
          phone: applicationData.phone,
          address_line1: applicationData.addressLine1,
          address_line2: applicationData.addressLine2 || null,
          city: applicationData.city,
          service_area: applicationData.serviceArea,
          status: 'pending',
          // Additional fields for collector applications
          vehicle_type: applicationData.vehicleType,
          license_number: applicationData.licenseNumber,
          availability: applicationData.availability,
          additional_info: applicationData.additionalInfo || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating collector application:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message || 'Unknown error occurred'}`);
      }

      console.log('Collector application created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createCollectorApplication:', error);
      throw error;
    }
  },

  // Get pending collector applications
  async getPendingApplications() {
    try {
      const { data, error } = await supabase
        .from('collector_applications')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      throw error;
    }
  },

  // Get all collector applications
  async getAllApplications(status = null) {
    try {
      let query = supabase
        .from('collector_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Approve collector application
  async approveApplication(applicationId, adminNotes = null) {
    try {
      console.log('Approving collector application:', applicationId);

      // First, get the application details
      const { data: application, error: fetchError } = await supabase
        .from('collector_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (fetchError) {
        console.error('Error fetching application:', fetchError);
        throw fetchError;
      }

      if (!application) {
        throw new Error('Application not found');
      }

      console.log('Application found:', application.email);

      console.log('Creating profile for approved collector');

      // Generate a unique user ID for the profile (UUID format)
      const newUserId = crypto.randomUUID();
      
      // Create profile record directly (no auth user needed)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId, // Use generated UUID
          email: application.email,
          name: application.full_name, // profiles table uses 'name' not 'full_name'
          phone: application.phone,
          address: `${application.address_line1}${application.address_line2 ? ', ' + application.address_line2 : ''}, ${application.city}`,
          role: 'COLLECTOR',
          status: 'approved_pending_registration', // Special status for approved collectors
          account_status: 'pending_registration',
          // Collector-specific fields
          coverage_area: application.service_area, // profiles table uses 'coverage_area' not 'service_area'
          vehicle_type: application.vehicle_type,
          license_number: application.license_number,
          availability: application.availability,
          additional_info: application.additional_info,
          collector_status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('Profile created successfully with ID:', newUserId);

      // Update application status
      const { data: updatedApplication, error: updateError } = await supabase
        .from('collector_applications')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating application:', updateError);
        throw updateError;
      }

      // Send approval email notification (simulated)
      console.log('📧 COLLECTOR APPROVAL EMAIL SENT');
      console.log('=================================');
      console.log(`To: ${application.email}`);
      console.log(`Subject: Welcome to EcoTech - Your Collector Application Approved!`);
      console.log('');
      console.log(`Dear ${application.full_name},`);
      console.log('');
      console.log('🎉 Congratulations! Your collector application has been approved.');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('1. Visit our registration page: https://ecotech.com/register');
      console.log('2. Create your account using this email: ' + application.email);
      console.log('3. Choose a secure password for your account');
      console.log('4. Your profile has been pre-approved and will be activated automatically');
      console.log('');
      console.log('🌐 After registration, you can log in at: https://ecotech.com/login');
      console.log('');
      console.log('👤 Your Collector Profile:');
      console.log('📍 Service Area: ' + application.service_area);
      console.log('🚛 Vehicle Type: ' + application.vehicle_type);
      console.log('📋 Availability: ' + application.availability);
      console.log('📞 Phone: ' + application.phone);
      console.log('');
      if (adminNotes) {
        console.log('📝 Admin Notes: ' + adminNotes);
        console.log('');
      }
      console.log('Welcome to the EcoTech team! 🌱');
      console.log('Please complete your registration to start collecting waste and making a difference!');
      console.log('=================================');

      return {
        ...updatedApplication,
        profileCreated: true,
        profileId: newUserId,
        registrationRequired: true
      };
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  },

  // Reject collector application
  async rejectApplication(applicationId, rejectionReason) {
    try {
      const { data, error } = await supabase
        .from('collector_applications')
        .update({
          status: 'rejected',
          admin_notes: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // TODO: Send rejection email notification
      console.log('Application rejected, should send email to:', data.email);
      
      return data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  // Check if email already has an application
  async checkExistingApplication(email) {
    try {
      const { data, error } = await supabase
        .from('collector_applications')
        .select('id, status, submitted_at')
        .eq('email', email.toLowerCase().trim())
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error checking existing application:', error);
      throw error;
    }
  }
};

// ============================================================================
// USER APPROVAL SERVICES
// ============================================================================

export const approvalService = {
  // Get pending users
  async getPendingUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match AdminDashboard expectations
      const transformedData = (data || []).map(user => ({
        ...user,
        createdAt: user.created_at, // Add createdAt field for compatibility
        businessInfo: user.center_name || user.additional_info || '', // Add business info
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  },

  // Approve user
  async approveUser(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  // Reject user
  async rejectUser(userId, reason = '') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  },

  // Combined approve/reject registration function for AdminDashboard compatibility
  async approveRegistration(userId, approved, reason = '') {
    try {
      console.log(`${approved ? 'Approving' : 'Rejecting'} registration for user:`, userId);
      
      if (approved) {
        return await this.approveUser(userId);
      } else {
        return await this.rejectUser(userId, reason);
      }
    } catch (error) {
      console.error('Error processing registration:', error);
      throw error;
    }
  }
};

// ============================================================================
// COLLECTOR EARNINGS SERVICES
// ============================================================================

export const earningsService = {
  // Get collector earnings
  async getCollectorEarnings(collectorId, status = null) {
    try {
      let query = supabase
        .from('collector_earnings')
        .select(`
          *,
          collection_request:collection_requests(
            id,
            total_amount,
            status,
            created_at,
            user_id,
            address,
            contact_person
          )
        `)
        .eq('collector_id', collectorId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting collector earnings:', error);
      throw error;
    }
  },

  // Get earnings summary for collector
  async getEarningsSummary(collectorId) {
    try {
      const { data, error } = await supabase
        .from('collector_earnings')
        .select('amount, status')
        .eq('collector_id', collectorId);

      if (error) throw error;

      const summary = {
        totalEarnings: 0,
        paidEarnings: 0,
        totalTransactions: data.length,
        paidTransactions: 0
      };

      data.forEach(earning => {
        const amount = parseFloat(earning.amount) || 0;
        summary.totalEarnings += amount;
        
        if (earning.status === 'paid') {
          summary.paidEarnings += amount;
          summary.paidTransactions++;
        }
      });

      return summary;
    } catch (error) {
      console.error('Error getting earnings summary:', error);
      throw error;
    }
  },

  // Update earnings status (admin use)
  async updateEarningsStatus(earningsId, status, notes = null) {
    try {
      const updates = {
        status
      };

      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      if (notes) {
        updates.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from('collector_earnings')
        .update(updates)
        .eq('id', earningsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating earnings status:', error);
      throw error;
    }
  },

  // Get all earnings for admin dashboard
  async getAllEarnings(status = null) {
    try {
      let query = supabase
        .from('collector_earnings')
        .select(`
          *,
          collector:profiles!collector_earnings_collector_id_fkey(
            id,
            name,
            email,
            phone
          ),
          collection_request:collection_requests(
            id,
            total_amount,
            status,
            created_at,
            address,
            contact_person
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all earnings:', error);
      throw error;
    }
  }
};

// ============================================================================
// CONTENT MANAGEMENT SERVICES
// ============================================================================

export const contentService = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .eq('is_active', true)
      .neq('slug', 'recycling-centers') // Exclude recycling centers category
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('content_categories')
      .insert([{
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
        icon: categoryData.icon,
        sort_order: categoryData.sort_order || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(categoryId, updates) {
    const { data, error } = await supabase
      .from('content_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId) {
    const { data, error } = await supabase
      .from('content_categories')
      .update({ is_active: false })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Educational Content
  async getPublishedContent(categoryId = null) {
    let query = supabase
      .from('educational_content')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Manually enrich with category data
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (content) => {
        let category = null;

        if (content.category_id) {
          const { data: categoryData } = await supabase
            .from('content_categories')
            .select('name, slug, icon')
            .eq('id', content.category_id)
            .single();
          category = categoryData;
        }

        return {
          ...content,
          category
        };
      }));

      // Filter out content from recycling centers category
      const filteredData = enrichedData.filter(content => 
        !content.category || content.category.slug !== 'recycling-centers'
      );

      return filteredData;
    }

    return data;
  },

  async getAllContent(filters = {}) {
    let query = supabase
      .from('educational_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    } else {
      // By default, exclude archived content unless specifically requested
      query = query.neq('status', 'archived');
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Manually enrich with category and author data
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (content) => {
        let category = null;
        let author = null;

        if (content.category_id) {
          const { data: categoryData } = await supabase
            .from('content_categories')
            .select('name, slug, icon')
            .eq('id', content.category_id)
            .single();
          category = categoryData;
        }

        if (content.author_id) {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', content.author_id)
            .single();
          author = authorData;
        }

        return {
          ...content,
          category,
          author
        };
      }));

      // Filter out content from recycling centers category
      const filteredData = enrichedData.filter(content => 
        !content.category || content.category.slug !== 'recycling-centers'
      );

      return filteredData;
    }

    return data;
  },

  async getContentById(contentId) {
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) throw error;

    // Manually enrich with category and author data
    if (data) {
      let category = null;
      let author = null;

      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from('content_categories')
          .select('name, slug, icon')
          .eq('id', data.category_id)
          .single();
        category = categoryData;
      }

      if (data.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', data.author_id)
          .single();
        author = authorData;
      }

      return {
        ...data,
        category,
        author
      };
    }

    return data;
  },

  async getContentBySlug(slug) {
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Manually enrich with category and author data
    if (data) {
      let category = null;
      let author = null;

      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from('content_categories')
          .select('name, slug, icon')
          .eq('id', data.category_id)
          .single();
        category = categoryData;
      }

      if (data.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', data.author_id)
          .single();
        author = authorData;
      }

      return {
        ...data,
        category,
        author
      };
    }

    return data;
  },

  async createContent(contentData) {
    console.log('Creating content with data:', contentData);
    
    const insertData = {
      title: contentData.title,
      slug: contentData.slug,
      excerpt: contentData.excerpt,
      content: contentData.content,
      category_id: contentData.category_id,
      author_id: contentData.author_id,
      status: contentData.status || 'draft',
      read_time_minutes: contentData.read_time_minutes,
      tags: contentData.tags || [],
      meta_description: contentData.meta_description,
      featured_image_url: contentData.featured_image_url,
      views_count: 0 // Start with 0 views for new content
    };

    console.log('Insert data:', insertData);

    const { data, error } = await supabase
      .from('educational_content')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Content created successfully:', data);

    // Manually enrich with category data
    if (data && data.category_id) {
      const { data: categoryData } = await supabase
        .from('content_categories')
        .select('name, slug, icon')
        .eq('id', data.category_id)
        .single();
      
      return {
        ...data,
        category: categoryData
      };
    }

    return data;
  },

  async updateContent(contentId, updates) {
    const { data, error } = await supabase
      .from('educational_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select('*')
      .single();

    if (error) throw error;

    // Manually enrich with category data
    if (data && data.category_id) {
      const { data: categoryData } = await supabase
        .from('content_categories')
        .select('name, slug, icon')
        .eq('id', data.category_id)
        .single();
      
      return {
        ...data,
        category: categoryData
      };
    }

    return data;
  },

  async deleteContent(contentId) {
    const { data, error } = await supabase
      .from('educational_content')
      .delete()
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publishContent(contentId) {
    const { data, error } = await supabase
      .from('educational_content')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select('*')
      .single();

    if (error) throw error;

    // Manually enrich with category data
    if (data && data.category_id) {
      const { data: categoryData } = await supabase
        .from('content_categories')
        .select('name, slug, icon')
        .eq('id', data.category_id)
        .single();
      
      return {
        ...data,
        category: categoryData
      };
    }

    return data;
  },

  // Content Analytics
  async trackContentView(contentId, userId = null) {
    const { data, error } = await supabase
      .from('content_analytics')
      .insert([{
        content_id: contentId,
        user_id: userId,
        event_type: 'view',
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_agent: navigator.userAgent,
        ip_address: null // Will be handled by server if needed
      }]);

    if (error) {
      console.warn('Failed to track content view:', error);
      return;
    }

    // Also increment the views_count in the content table
    const { error: updateError } = await supabase
      .rpc('increment_content_views', { content_id: contentId });

    if (updateError) {
      console.warn('Failed to increment content views:', updateError);
    }

    return data;
  },

  async getContentAnalytics(contentId = null, dateRange = null) {
    let query = supabase
      .from('content_analytics')
      .select(`
        *,
        content:educational_content(title, slug)
      `);

    if (contentId) {
      query = query.eq('content_id', contentId);
    }

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

const supabaseApi = {
  auth: authService,
  collection: collectionService,
  recycling: recyclingCenterService,
  user: userService,
  delivery: deliveryService,
  support: supportService,
  analytics: analyticsService,
  materials: materialService,
  achievements: achievementService,
  collectorApplications: collectorService,
  registrations: approvalService, // Renamed from 'registrations' to 'approval' for clarity
  earnings: earningsService,
  content: contentService
};

export default supabaseApi; 