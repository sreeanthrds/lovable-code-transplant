
/**
 * Encryption utilities for strategy files
 * Uses a simple encryption method to obfuscate strategy data
 */

// Simple encryption using base64 and character shifting
const ENCRYPTION_KEY = "TradeLoyout2024Strategy";

/**
 * Encrypts strategy data to prevent casual reading
 */
export const encryptStrategyData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const base64 = btoa(jsonString);
    
    // Apply character shifting for additional obfuscation
    let encrypted = '';
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(char ^ keyChar);
    }
    
    // Encode again to make it safe for file storage
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt strategy data');
  }
};

/**
 * Decrypts strategy data
 */
export const decryptStrategyData = (encryptedData: string): any => {
  try {
    console.log('🔓 Starting decryption process...');
    console.log('🔓 Encrypted data length:', encryptedData.length);
    
    // First decode
    console.log('🔓 Step 1: Base64 decoding...');
    const decoded = atob(encryptedData);
    console.log('🔓 Decoded length:', decoded.length);
    
    // Reverse character shifting
    console.log('🔓 Step 2: Character shifting reversal...');
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const char = decoded.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(char ^ keyChar);
    }
    console.log('🔓 Decrypted length:', decrypted.length);
    
    // Decode base64 to get original JSON
    console.log('🔓 Step 3: Final base64 decoding...');
    const jsonString = atob(decrypted);
    console.log('🔓 JSON string length:', jsonString.length);
    console.log('🔓 First 200 chars of JSON:', jsonString.substring(0, 200));
    
    console.log('🔓 Step 4: JSON parsing...');
    const result = JSON.parse(jsonString);
    console.log('🔓 Parsing successful, result keys:', Object.keys(result));
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt strategy data - file may be corrupted or invalid');
  }
};

/**
 * Checks if data appears to be encrypted (simple heuristic)
 */
export const isEncryptedData = (data: string): boolean => {
  try {
    // If it parses as JSON, it's probably not encrypted
    JSON.parse(data);
    return false;
  } catch {
    // If it doesn't parse as JSON, it might be encrypted
    // Additional check: encrypted data should be base64-like
    return /^[A-Za-z0-9+/]*={0,2}$/.test(data.trim());
  }
};
