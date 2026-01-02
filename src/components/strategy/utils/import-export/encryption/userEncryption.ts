import { getUserEncryptionKey } from './keyGeneration';

/**
 * Encrypt data with user-specific key
 */
export const encryptUserData = async (data: any, userId: string): Promise<string> => {
  try {
    const userKey = await getUserEncryptionKey(userId);
    const jsonString = JSON.stringify(data);
    const base64 = btoa(jsonString);
    
    // Apply character shifting with user-specific key
    let encrypted = '';
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charCodeAt(i);
      const keyChar = userKey.charCodeAt(i % userKey.length);
      encrypted += String.fromCharCode(char ^ keyChar);
    }
    
    // Add user identifier to encrypted data for verification
    const userIdentifier = btoa(userId.slice(0, 8));
    const finalEncrypted = `${userIdentifier}.${btoa(encrypted)}`;
    
    return finalEncrypted;
  } catch (error) {
    console.error('User encryption failed:', error);
    throw new Error('Failed to encrypt data for user');
  }
};

/**
 * Decrypt data with user-specific key
 */
export const decryptUserData = async (encryptedData: string, userId: string): Promise<any> => {
  try {
    // Clean the encrypted data (remove whitespace and newlines)
    const cleanData = encryptedData.trim().replace(/\s/g, '');
    
    // Check if data contains user identifier
    if (!cleanData.includes('.')) {
      throw new Error('Invalid encrypted data format');
    }

    const [userIdentifierEncoded, actualEncryptedData] = cleanData.split('.');
    
    // Validate base64 format before decoding
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(userIdentifierEncoded) || !base64Regex.test(actualEncryptedData)) {
      throw new Error('Invalid base64 encoding in encrypted data');
    }
    
    let originalUserId;
    try {
      originalUserId = atob(userIdentifierEncoded);
    } catch (e) {
      throw new Error('Failed to decode user identifier - corrupted file');
    }
    
    // Verify user has access to this data
    if (!userId.startsWith(originalUserId)) {
      throw new Error('Access denied: User not authorized to decrypt this data');
    }

    const userKey = await getUserEncryptionKey(userId);
    
    let decoded;
    try {
      decoded = atob(actualEncryptedData);
    } catch (e) {
      throw new Error('Failed to decode encrypted data - corrupted file');
    }
    
    // Reverse character shifting
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const char = decoded.charCodeAt(i);
      const keyChar = userKey.charCodeAt(i % userKey.length);
      decrypted += String.fromCharCode(char ^ keyChar);
    }
    
    // Decode base64 to get original JSON
    let jsonString;
    try {
      jsonString = atob(decrypted);
    } catch (e) {
      throw new Error('Failed to decode final data - incorrect key or corrupted file');
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('User decryption failed:', error);
    throw new Error('Failed to decrypt data - access denied or corrupted file');
  }
};

/**
 * Check if user can decrypt specific data
 */
export const canUserDecrypt = (encryptedData: string, userId: string): boolean => {
  try {
    if (!encryptedData.includes('.')) {
      return false;
    }

    const [userIdentifierEncoded] = encryptedData.split('.');
    const originalUserId = atob(userIdentifierEncoded);
    
    return userId.startsWith(originalUserId);
  } catch (error) {
    return false;
  }
};