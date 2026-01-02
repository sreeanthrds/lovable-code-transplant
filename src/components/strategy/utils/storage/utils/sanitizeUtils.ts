
/**
 * Utilities for sanitizing strategy data before storage
 */

/**
 * Sanitize the strategy data before saving to remove circular references
 * and any properties that might cause issues with serialization
 * Optimized for better performance with selective property checking
 */
export const sanitizeForStorage = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle basic types
  if (typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays more efficiently
  if (Array.isArray(data)) {
    // For large arrays, limit processing depth to improve performance
    if (data.length > 100) {
      // Process only a subset of large arrays (first 50, then every 5th, then last 50)
      const sanitized = [];
      
      // First 50
      for (let i = 0; i < Math.min(50, data.length); i++) {
        sanitized.push(sanitizeForStorage(data[i]));
      }
      
      // Middle (sample every 5th)
      if (data.length > 100) {
        for (let i = 50; i < data.length - 50; i += 5) {
          sanitized.push(sanitizeForStorage(data[i]));
        }
      }
      
      // Last 50
      for (let i = Math.max(50, data.length - 50); i < data.length; i++) {
        sanitized.push(sanitizeForStorage(data[i]));
      }
      
      return sanitized;
    }
    
    return data.map(item => sanitizeForStorage(item));
  }
  
  // Handle objects - more efficiently
  const sanitized = {};
  
  // Skip known problematic properties upfront
  const skipProps = new Set([
    '__proto__', '_owner', 'ref', 'parent', 'internals', 
    'initializer', 'handlers', '_reactEvents'
  ]);
  
  for (const key in data) {
    // Skip internal properties, functions, and known problematic properties
    if (
      !data.hasOwnProperty(key) ||
      skipProps.has(key) || 
      key.startsWith('__') || 
      typeof data[key] === 'function'
    ) {
      continue;
    }
    
    // Recursively sanitize
    try {
      sanitized[key] = sanitizeForStorage(data[key]);
    } catch (err) {
      // Skip problematic properties
    }
  }
  
  return sanitized;
};
