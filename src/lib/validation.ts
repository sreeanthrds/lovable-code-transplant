/**
 * Security validation utilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate user ID format (should be UUID)
 */
export const isValidUserId = (userId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
};

/**
 * Validate role name
 */
export const isValidRole = (role: string): boolean => {
  const validRoles = ['admin', 'user', 'moderator'];
  return validRoles.includes(role.toLowerCase());
};

/**
 * Validate strategy name
 */
export const isValidStrategyName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 100) return false;
  
  // Allow alphanumeric, spaces, hyphens, underscores
  const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return validNameRegex.test(name);
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if under limit
    if (attempt.count < this.maxAttempts) {
      attempt.count++;
      attempt.lastAttempt = now;
      return true;
    }

    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const adminActionLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes

/**
 * Validate strategy data structure
 */
export const validateStrategyData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Basic validation for strategy structure
  if (!data.name || typeof data.name !== 'string') return false;
  if (!isValidStrategyName(data.name)) return false;
  
  return true;
};

/**
 * Validate user profile data
 */
export const validateUserProfile = (profile: any): any => {
  if (!profile || typeof profile !== 'object') return null;
  
  // Return sanitized profile data
  return {
    email: profile.email && typeof profile.email === 'string' ? sanitizeInput(profile.email) : profile.email,
    first_name: profile.first_name && typeof profile.first_name === 'string' ? sanitizeInput(profile.first_name) : profile.first_name,
    last_name: profile.last_name && typeof profile.last_name === 'string' ? sanitizeInput(profile.last_name) : profile.last_name,
    phone_number: profile.phone_number && typeof profile.phone_number === 'string' ? sanitizeInput(profile.phone_number) : profile.phone_number,
    username: profile.username && typeof profile.username === 'string' ? sanitizeInput(profile.username) : profile.username,
    marketing_consent: profile.marketing_consent
  };
};