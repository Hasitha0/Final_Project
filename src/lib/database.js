import { supabase } from './supabase.js';

/**
 * EcoTech Database Access Utility
 * Provides easy access to database structure and common operations
 * Compatible with custom authentication system
 */

// ===============================================
// DATABASE SCHEMA DEFINITIONS
// ===============================================

export const DATABASE_SCHEMA = {
  // Core User Management
  profiles: {
    tableName: 'profiles',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      name: { type: 'text', required: true },
      email: { type: 'text', required: true, unique: true },
      role: { type: 'text', required: true }, // USER, COLLECTOR, RECYCLING_CENTER, ADMIN
      phone: { type: 'text', required: false },
      password_hash: { type: 'text', required: false },
      status: { type: 'text', required: false, default: 'active' },
      account_status: { type: 'text', required: false, default: 'active' },
      auto_id: { type: 'integer', required: true, autoIncrement: true },
      created_at: { type: 'timestamp', required: false, default: 'now()' },
      updated_at: { type: 'timestamp', required: false, default: 'now()' },
      last_login: { type: 'timestamp', required: false },
      // Role-specific fields
      vehicle_type: { type: 'text', required: false }, // COLLECTOR
      license_number: { type: 'text', required: false }, // COLLECTOR
      coverage_area: { type: 'text', required: false }, // COLLECTOR
      center_name: { type: 'text', required: false }, // RECYCLING_CENTER
      address: { type: 'text', required: false },
      operating_hours: { type: 'text', required: false }, // RECYCLING_CENTER
      accepted_materials: { type: 'array', required: false }, // RECYCLING_CENTER
      capacity: { type: 'text', required: false }, // RECYCLING_CENTER
    },
    indexes: ['email', 'role', 'status', 'auto_id'],
    relationships: {
      collection_requests: { type: 'one-to-many', foreignKey: 'user_id' },
      collector_earnings: { type: 'one-to-many', foreignKey: 'collector_id' },
      support_tickets: { type: 'one-to-many', foreignKey: 'user_id' }
    }
  },

  // Collection System
  collection_requests: {
    tableName: 'collection_requests',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      user_id: { type: 'uuid', required: true, foreignKey: 'profiles.id' },
      status: { type: 'text', required: true, default: 'pending' },
      // Legacy fields (required for backward compatibility)
      item_types: { type: 'array', required: true },
      quantities: { type: 'text', required: true },
      // New paid system fields
      items: { type: 'jsonb', required: false, default: '[]' },
      total_amount: { type: 'numeric', required: false, default: 0 },
      payment_method: { type: 'text', required: false },
      payment_status: { type: 'text', required: false, default: 'pending' },
      collector_commission: { type: 'numeric', required: false, default: 0 },
      // Required fields
      preferred_date: { type: 'date', required: true },
      preferred_time: { type: 'text', required: true },
      address: { type: 'text', required: true },
      contact_phone: { type: 'text', required: true },
      // Optional fields
      contact_person: { type: 'text', required: false },
      pickup_floor: { type: 'text', required: false },
      building_access_info: { type: 'text', required: false },
      special_instructions: { type: 'text', required: false },
      item_photos: { type: 'array', required: false, default: '[]' },
      collector_id: { type: 'uuid', required: false, foreignKey: 'profiles.id' },
      recycling_center_id: { type: 'uuid', required: false, foreignKey: 'recycling_centers.id' },
      created_at: { type: 'timestamp', required: false, default: 'now()' },
      updated_at: { type: 'timestamp', required: false, default: 'now()' },
      completed_at: { type: 'timestamp', required: false }
    },
    indexes: ['user_id', 'status', 'collector_id', 'created_at'],
    relationships: {
      user: { type: 'many-to-one', table: 'profiles', foreignKey: 'user_id' },
      collector: { type: 'many-to-one', table: 'profiles', foreignKey: 'collector_id' },
      recycling_center: { type: 'many-to-one', table: 'recycling_centers', foreignKey: 'recycling_center_id' }
    }
  },

  // Pricing System
  pricing_categories: {
    tableName: 'pricing_categories',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      category_key: { type: 'text', required: true, unique: true },
      name: { type: 'text', required: true },
      description: { type: 'text', required: true },
      price_per_item: { type: 'numeric', required: true },
      is_active: { type: 'boolean', required: false, default: true },
      created_at: { type: 'timestamp', required: false, default: 'now()' },
      updated_at: { type: 'timestamp', required: false, default: 'now()' }
    },
    indexes: ['category_key', 'is_active', 'price_per_item']
  },

  // Payment System
  payment_transactions: {
    tableName: 'payment_transactions',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      collection_request_id: { type: 'uuid', required: true, foreignKey: 'collection_requests.id' },
      stripe_payment_intent_id: { type: 'text', required: false },
      stripe_session_id: { type: 'text', required: false },
      amount: { type: 'numeric', required: true },
      currency: { type: 'text', required: false, default: 'usd' },
      status: { type: 'text', required: true },
      payment_method: { type: 'text', required: false },
      created_at: { type: 'timestamp', required: false, default: 'now()' },
      updated_at: { type: 'timestamp', required: false, default: 'now()' }
    },
    indexes: ['collection_request_id', 'status', 'created_at'],
    relationships: {
      collection_request: { type: 'many-to-one', table: 'collection_requests', foreignKey: 'collection_request_id' }
    }
  },

  // Collector Earnings
  collector_earnings: {
    tableName: 'collector_earnings',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      collector_id: { type: 'uuid', required: true, foreignKey: 'profiles.id' },
      collection_request_id: { type: 'uuid', required: true, foreignKey: 'collection_requests.id' },
      amount: { type: 'numeric', required: true },
      status: { type: 'text', required: false, default: 'pending' },
      paid_at: { type: 'timestamp', required: false },
      created_at: { type: 'timestamp', required: false, default: 'now()' }
    },
    indexes: ['collector_id', 'status', 'created_at'],
    relationships: {
      collector: { type: 'many-to-one', table: 'profiles', foreignKey: 'collector_id' },
      collection_request: { type: 'many-to-one', table: 'collection_requests', foreignKey: 'collection_request_id' }
    }
  },

  // Recycling Centers
  recycling_centers: {
    tableName: 'recycling_centers',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      name: { type: 'text', required: true },
      address: { type: 'text', required: true },
      coordinates: { type: 'point', required: false },
      phone: { type: 'text', required: true },
      email: { type: 'text', required: true },
      hours: { type: 'text', required: true },
      materials: { type: 'array', required: true },
      rating: { type: 'numeric', required: false, default: 0 },
      reviews: { type: 'integer', required: false, default: 0 },
      status: { type: 'text', required: false, default: 'pending_approval' },
      user_id: { type: 'uuid', required: false, foreignKey: 'profiles.id' },
      created_at: { type: 'timestamp', required: false, default: 'now()' }
    },
    indexes: ['status', 'user_id', 'rating'],
    relationships: {
      user: { type: 'many-to-one', table: 'profiles', foreignKey: 'user_id' },
      collection_requests: { type: 'one-to-many', foreignKey: 'recycling_center_id' }
    }
  },

  // Support System
  support_tickets: {
    tableName: 'support_tickets',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', required: true, isPrimary: true },
      user_id: { type: 'uuid', required: false, foreignKey: 'profiles.id' },
      name: { type: 'varchar(255)', required: true },
      email: { type: 'varchar(255)', required: true },
      subject: { type: 'varchar(500)', required: true },
      category: { type: 'varchar(100)', required: true },
      priority: { type: 'varchar(20)', required: false, default: 'medium' },
      message: { type: 'text', required: true },
      status: { type: 'varchar(20)', required: false, default: 'open' },
      admin_response: { type: 'text', required: false },
      responded_at: { type: 'timestamp', required: false },
      created_at: { type: 'timestamp', required: false, default: 'now()' },
      updated_at: { type: 'timestamp', required: false, default: 'now()' }
    },
    indexes: ['user_id', 'status', 'category', 'created_at'],
    relationships: {
      user: { type: 'many-to-one', table: 'profiles', foreignKey: 'user_id' }
    }
  }
};

// ===============================================
// DATABASE ACCESS METHODS
// ===============================================

export class DatabaseAccess {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Get table schema information
   */
  getTableSchema(tableName) {
    return DATABASE_SCHEMA[tableName] || null;
  }

  /**
   * Get all table names
   */
  getTableNames() {
    return Object.keys(DATABASE_SCHEMA);
  }

  /**
   * Get required fields for a table
   */
  getRequiredFields(tableName) {
    const schema = this.getTableSchema(tableName);
    if (!schema) return [];
    
    return Object.entries(schema.columns)
      .filter(([_, config]) => config.required)
      .map(([fieldName, _]) => fieldName);
  }

  /**
   * Get foreign key relationships for a table
   */
  getForeignKeys(tableName) {
    const schema = this.getTableSchema(tableName);
    if (!schema) return [];
    
    return Object.entries(schema.columns)
      .filter(([_, config]) => config.foreignKey)
      .map(([fieldName, config]) => ({
        field: fieldName,
        references: config.foreignKey
      }));
  }

  /**
   * Validate data against table schema
   */
  validateData(tableName, data) {
    const schema = this.getTableSchema(tableName);
    if (!schema) {
      throw new Error(`Table schema not found: ${tableName}`);
    }

    const errors = [];
    const requiredFields = this.getRequiredFields(tableName);

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        // Skip auto-generated fields
        if (schema.columns[field].isPrimary || schema.columns[field].default || schema.columns[field].autoIncrement) {
          continue;
        }
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generic insert method with validation
   */
  async insert(tableName, data) {
    try {
      // Validate data
      const validation = this.validateData(tableName, data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { data: result, error } = await this.supabase
        .from(tableName)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Database insert error (${tableName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic select method
   */
  async select(tableName, options = {}) {
    try {
      let query = this.supabase.from(tableName).select(options.select || '*');

      // Apply filters
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply range
      if (options.range) {
        const { from, to } = options.range;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error(`Database select error (${tableName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic update method
   */
  async update(tableName, id, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Database update error (${tableName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic delete method
   */
  async delete(tableName, id) {
    try {
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Database delete error (${tableName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by email (for authentication)
   */
  async getUserByEmail(email) {
    return this.select('profiles', {
      where: { email },
      limit: 1
    }).then(result => ({
      ...result,
      data: result.data?.[0] || null
    }));
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return this.select('profiles', {
      where: { id },
      limit: 1
    }).then(result => ({
      ...result,
      data: result.data?.[0] || null
    }));
  }

  /**
   * Get collection requests for user
   */
  async getUserCollectionRequests(userId, options = {}) {
    return this.select('collection_requests', {
      where: { user_id: userId },
      orderBy: { column: 'created_at', ascending: false },
      ...options
    });
  }

  /**
   * Get active pricing categories
   */
  async getActivePricingCategories() {
    return this.select('pricing_categories', {
      where: { is_active: true },
      orderBy: { column: 'price_per_item', ascending: true }
    });
  }

  /**
   * Get collector earnings
   */
  async getCollectorEarnings(collectorId, options = {}) {
    return this.select('collector_earnings', {
      where: { collector_id: collectorId },
      orderBy: { column: 'created_at', ascending: false },
      ...options
    });
  }
}

// ===============================================
// SINGLETON INSTANCE
// ===============================================

export const db = new DatabaseAccess();

// ===============================================
// CONVENIENCE EXPORTS
// ===============================================

export default {
  db,
  DATABASE_SCHEMA,
  DatabaseAccess
}; 