import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth state with database validation
    const initializeAuth = async () => {
      try {
        await authService.initializeAuth();
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If initialization fails, ensure user is logged out
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
    setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { user: loggedInUser, error } = await authService.login(email, password);
      
      if (error) {
        throw new Error(error);
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
      return { user: loggedInUser, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Handle different registration outcomes
      if (result.needsApproval) {
        // For COLLECTOR and RECYCLING_CENTER users - don't set user/auth state
        return {
          user: null,
          error: null,
          needsApproval: true,
          email: result.email,
          role: result.role,
          message: result.message
        };
      } else if (result.user) {
        // For PUBLIC users - set user and auth state
        setUser(result.user);
        setIsAuthenticated(true);
        return { user: result.user, error: null };
      } else {
        throw new Error('Unexpected registration response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    try {
      const { user: updatedUser, error } = await authService.updateProfile(updates);
      
      if (error) {
        throw new Error(error);
      }

      setUser(updatedUser);
      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { user: null, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  // Validate user session against database
  const validateSession = async () => {
    try {
      const result = await authService.validateUserSession();
      if (!result.valid) {
        // Session is invalid - update auth state
        setUser(null);
        setIsAuthenticated(false);
        return { valid: false, reason: result.reason };
      }
      
      // Session is valid - update user data if needed
      if (result.user) {
        setUser(result.user);
      }
      
      return { valid: true, user: result.user };
    } catch (error) {
      console.error('Session validation error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return { valid: false, reason: 'Validation failed', error: error.message };
    }
  };

  // Helper methods for role checking
  const hasRole = (role) => authService.hasRole(role);
  const isAdmin = () => authService.isAdmin();
  const isCollector = () => authService.isCollector();
  const isRecyclingCenter = () => authService.isRecyclingCenter();

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    validateSession,
    hasRole,
    isAdmin,
    isCollector,
    isRecyclingCenter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
