import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

// Enhanced authentication service with fallbacks and better error handling
export class AuthService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.currentUser = null;
    this.isAuthenticated = false;
    this.initializeAuth();
  }

  // Initialize auth state from localStorage
  async initializeAuth() {
    const userData = localStorage.getItem('ecotech_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Validate that the user still exists in the database
        const { data: dbUser, error } = await supabase
          .from('profiles')
          .select('id, email, name, role, status, account_status')
          .eq('id', parsedUser.id)
          .single();

        if (error || !dbUser) {
          // User no longer exists in database - clear local storage and logout
          console.log('User no longer exists in database, logging out');
          this.logout();
          return;
        }

        // Check if user account is still active
        if (dbUser.account_status === 'deleted' || dbUser.account_status === 'deactivated') {
          console.log('User account is deleted/deactivated, logging out');
          this.logout();
          return;
        }

        // User exists and is active - set authentication state
        this.currentUser = parsedUser;
        this.isAuthenticated = true;
        
        // Update stored user data with latest from database (in case of role/status changes)
        const updatedUserData = { ...parsedUser, ...dbUser };
        localStorage.setItem('ecotech_user', JSON.stringify(updatedUserData));
        this.currentUser = updatedUserData;
        
      } catch (error) {
        console.error('Error validating stored user data:', error);
        this.logout();
      }
    }
  }

  // Hash password using bcrypt
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate UUID for new users
  generateUserId() {
    return crypto.randomUUID();
  }

  // Register new user
  async register(userData) {
    try {
      const { email, password, name, role = 'PUBLIC' } = userData;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const password_hash = await this.hashPassword(password);

      // Determine account status based on role
      let account_status = 'active';
      let status = 'active';
      
      if (role === 'COLLECTOR' || role === 'RECYCLING_CENTER') {
        // For users requiring approval, set status to pending_approval but keep account_status as active
        status = 'pending_approval';
        account_status = 'active'; // Keep account active, use status for approval workflow
      }

      // Create combined address from addressLine1, addressLine2, and city
      let combinedAddress = '';
      if (userData.addressLine1) {
        combinedAddress = userData.addressLine1.trim();
        if (userData.addressLine2) {
          combinedAddress += ', ' + userData.addressLine2.trim();
        }
        if (userData.city) {
          combinedAddress += ', ' + userData.city;
        }
      }

      // Create new profile
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert({
          id: this.generateUserId(),
          email,
          password_hash,
          name,
          role,
          status,
          account_status,
          // Add additional fields for different user types
          phone: userData.phone || null,
          address: combinedAddress || null,
          // Collector specific fields
          coverage_area: userData.serviceArea || null,
          vehicle_type: userData.vehicleType || null,
          license_number: userData.licenseNumber || null,
          availability: userData.availability || null,
          additional_info: userData.additionalInfo || null,
          // Recycling center specific fields
          center_name: userData.centerName || null,
          registration_number: userData.registrationNumber || null,
          operating_hours: userData.operatingHours || null,
          accepted_materials: userData.acceptedMaterials || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Remove password_hash from user object for security
      const { password_hash: _, ...userWithoutPassword } = newUser;
      
      // For PUBLIC users, log them in immediately
      if (role === 'PUBLIC') {
        this.currentUser = userWithoutPassword;
        this.isAuthenticated = true;
        localStorage.setItem('ecotech_user', JSON.stringify(userWithoutPassword));
        return { user: userWithoutPassword, error: null };
      }
      
      // For COLLECTOR and RECYCLING_CENTER, return success but don't log them in
      return { 
        user: null, 
        error: null, 
        needsApproval: true, 
        email: email,
        role: role,
        message: `Your ${role.toLowerCase()} application has been submitted for admin approval. You'll receive an email when your account is activated.`
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: error.message };
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Get user by email
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single(); // Remove account_status filter to check all users

      if (error || !user) {
        throw new Error('Invalid email or password');
      }

      // Check account status - use status field for approval workflow
      if (user.status === 'pending_approval') {
        throw new Error(`Your ${user.role.toLowerCase()} account is pending admin approval. Please wait for activation.`);
      }

      if (user.status === 'rejected') {
        throw new Error('Your account application was rejected. Please contact support for more information.');
      }

      if (user.account_status === 'deactivated') {
        throw new Error('Your account has been deactivated. Please contact support for assistance.');
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new Error('Account is temporarily locked. Please try again later.');
      }

      // Verify password
      if (!user.password_hash || !(await this.verifyPassword(password, user.password_hash))) {
        // Increment login attempts
        await this.incrementLoginAttempts(user.id, user.login_attempts || 0);
        throw new Error('Invalid email or password');
      }

      // Reset login attempts and update last login
      await supabase
        .from('profiles')
        .update({
          login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Remove password_hash from user object for security
      const { password_hash: _, ...userWithoutPassword } = user;
      
      this.currentUser = userWithoutPassword;
      this.isAuthenticated = true;
      
      // Store in localStorage
      localStorage.setItem('ecotech_user', JSON.stringify(userWithoutPassword));

      return { user: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: error.message };
    }
  }

  // Increment login attempts and lock account if needed
  async incrementLoginAttempts(userId, currentAttempts) {
    const newAttempts = currentAttempts + 1;
    const updateData = {
      login_attempts: newAttempts,
      updated_at: new Date().toISOString()
    };

    // Lock account for 30 minutes after 5 failed attempts
    if (newAttempts >= 5) {
      updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
  }

  // Logout user
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('ecotech_user');
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Validate current user session against database
  async validateUserSession() {
    if (!this.currentUser) {
      return { valid: false, reason: 'No current user' };
    }

    try {
      const { data: dbUser, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, status, account_status')
        .eq('id', this.currentUser.id)
        .single();

      if (error || !dbUser) {
        this.logout();
        return { valid: false, reason: 'User not found in database' };
      }

      if (dbUser.account_status === 'deleted' || dbUser.account_status === 'deactivated') {
        this.logout();
        return { valid: false, reason: 'Account deleted or deactivated' };
      }

      // Update current user data with latest from database
      const updatedUserData = { ...this.currentUser, ...dbUser };
      this.currentUser = updatedUserData;
      localStorage.setItem('ecotech_user', JSON.stringify(updatedUserData));

      return { valid: true, user: updatedUserData };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, reason: 'Validation error', error: error.message };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select('*')
        .single();

      if (error) throw error;

      // Remove password_hash from user object for security
      const { password_hash: _, ...userWithoutPassword } = updatedUser;
      
      this.currentUser = userWithoutPassword;
      
      // Update localStorage
      localStorage.setItem('ecotech_user', JSON.stringify(userWithoutPassword));

      return { user: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { user: null, error: error.message };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Get current user with password hash
      const { data: user, error } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('id', this.currentUser.id)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Verify current password
      if (!user.password_hash || !(await this.verifyPassword(currentPassword, user.password_hash))) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', email)
        .eq('account_status', 'active')
        .single();

      if (error || !user) {
        // Don't reveal if email exists or not for security
        return { success: true, error: null };
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store reset token
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert({
          email: user.email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (tokenError) throw tokenError;

      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const { data: resetData, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (error || !resetData) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if token is expired
      if (new Date(resetData.expires_at) < new Date()) {
        throw new Error('Reset token has expired');
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update user password
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          password_hash: newPasswordHash,
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('email', resetData.email);

      if (updateError) throw updateError;

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      return { success: true, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has role
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  // Check if user is collector
  isCollector() {
    return this.hasRole('COLLECTOR');
  }

  // Check if user is recycling center
  isRecyclingCenter() {
    return this.hasRole('RECYCLING_CENTER');
  }

  // Utility method to retry operations
  async retryOperation(operation, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        console.warn(`Operation attempt ${i + 1} failed:`, error.message);
        
        if (i === attempts - 1) {
          throw error; // Last attempt, throw the error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // Test connection to Supabase
  async testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase connection test failed:', error);
        return { connected: false, error: error.message };
      }
      
      console.log('Supabase connection test successful');
      return { connected: true, session: data.session };
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }

  // Sign up with retry logic
  async signUp(email, password, userData) {
    return this.retryOperation(async () => {
      console.log('AuthService: Attempting signup for:', email);
      
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
        console.error('AuthService: Signup error:', authError);
        throw new Error(`Signup failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('AuthService: Signup successful:', authData.user.id);
      return { user: authData.user, session: authData.session };
    });
  }

  // Sign in with retry logic
  async signIn(email, password) {
    return this.retryOperation(async () => {
      console.log('AuthService: Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthService: Signin error:', error);
        throw new Error(`Signin failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user returned from signin');
      }

      console.log('AuthService: Signin successful:', data.user.id);
      return { user: data.user, session: data.session };
    });
  }

  // Sign out with retry logic
  async signOut() {
    return this.retryOperation(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Signout failed: ${error.message}`);
      }
      console.log('AuthService: Signout successful');
    });
  }

  // Get current session with retry logic
  async getCurrentSession() {
    return this.retryOperation(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw new Error(`Get session failed: ${error.message}`);
      }
      return session;
    });
  }

  // Get user profile with retry logic
  async getUserProfile(userId) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthService: Profile fetch error:', error);
        throw new Error(`Profile fetch failed: ${error.message}`);
      }

      return data;
    });
  }

  // Create user profile with retry logic
  async createUserProfile(userId, userData) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .rpc('create_user_profile', {
          user_id: userId,
          user_name: userData.name,
          user_email: userData.email,
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

      if (error) {
        console.error('AuthService: Profile creation error:', error);
        throw new Error(`Profile creation failed: ${error.message}`);
      }

      console.log('AuthService: Profile created successfully');
      return data;
    });
  }

  // Update user profile with retry logic
  async updateUserProfile(userId, updates) {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }

      return data;
    });
  }

  // Set up auth state change listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Health check method
  async healthCheck() {
    try {
      console.log('AuthService: Running health check...');
      
      // Test basic connectivity
      const connectionTest = await this.testConnection();
      if (!connectionTest.connected) {
        return {
          healthy: false,
          error: 'Connection failed',
          details: connectionTest.error
        };
      }

      // Test database access
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count(*)')
          .limit(1);

        if (error) {
          return {
            healthy: false,
            error: 'Database access failed',
            details: error.message
          };
        }

        return {
          healthy: true,
          message: 'All systems operational'
        };
      } catch (dbError) {
        return {
          healthy: false,
          error: 'Database query failed',
          details: dbError.message
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error: 'Health check failed',
        details: error.message
      };
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export default
export default authService;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.authService = authService;
} 