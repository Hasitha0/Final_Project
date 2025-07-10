import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to periodically validate user session against database
 * This ensures that if a user is deleted/deactivated manually, they get logged out
 * 
 * @param {number} intervalMs - How often to validate (default: 30 seconds)
 * @param {boolean} enabled - Whether validation is enabled (default: true)
 */
export const useSessionValidation = (intervalMs = 30000, enabled = true) => {
  const { validateSession, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!enabled || !isAuthenticated || !user) {
      return;
    }

    // Validate immediately on mount
    validateSession();

    // Set up periodic validation
    const interval = setInterval(async () => {
      if (isAuthenticated && user) {
        const result = await validateSession();
        if (!result.valid) {
          console.log('Session validation failed:', result.reason);
          // The validateSession function already handles logout
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [validateSession, isAuthenticated, user, intervalMs, enabled]);
};

export default useSessionValidation; 