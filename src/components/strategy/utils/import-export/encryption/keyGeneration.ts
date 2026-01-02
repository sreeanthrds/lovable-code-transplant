import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

/**
 * Generate a secure random encryption key for a user
 */
const generateUserEncryptionKey = (userId: string): string => {
  // Generate a cryptographically secure random key
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  
  // Convert to base64 for storage
  const randomKey = btoa(String.fromCharCode(...randomBytes));
  
  // Combine with user ID prefix for identification
  const timestamp = Date.now();
  return `${userId.slice(0, 8)}_${randomKey}_${timestamp}`;
};

/**
 * Store or retrieve user's encryption key
 */
export const getUserEncryptionKey = async (userId: string): Promise<string> => {
  try {
    // Try to get existing key from user activity table
    const { data: existingKey, error } = await supabase
      .from('user_activity')
      .select('activity_data')
      .eq('user_id', userId)
      .eq('activity_type', 'encryption_key')
      .single();

    if (existingKey && !error) {
      const keyData = existingKey.activity_data as { key: string };
      return keyData.key;
    }

    // Generate new key if none exists
    const newKey = generateUserEncryptionKey(userId);
    
    // Store the new key
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: 'encryption_key',
        activity_data: { key: newKey, created_at: new Date().toISOString() }
      });

    return newKey;
  } catch (error) {
    console.error('Error managing user encryption key:', error);
    // Fallback to deterministic key generation
    return generateUserEncryptionKey(userId);
  }
};