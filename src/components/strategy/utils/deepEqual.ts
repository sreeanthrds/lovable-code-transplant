
/**
 * Simple deep equality check for objects
 * This is used to prevent unnecessary updates by comparing objects
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // If either is null/undefined, check simple equality
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }
  
  // Handle primitive types
  if (typeof obj1 !== 'object' && typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  // Arrays need special handling
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    
    return true;
  }
  
  // Handle regular objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }
  
  return false;
}
