
import { useEffect, useState } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { userProfileService } from '@/lib/supabase/services/user-profile-service';
import { toast } from '@/hooks/use-toast';

export const useAutoCreateProfile = () => {
  const { user, isLoading } = useClerkUser();
  const [profileCreated, setProfileCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (isLoading || !user?.id || profileCreated || isCreating) {
        return;
      }

      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        console.log('No email address available for profile creation');
        return;
      }

      setIsCreating(true);
      try {
        console.log('Checking/creating profile for user:', user.id);
        
        // Check if profile already exists
        const existingProfile = await userProfileService.getUserProfile(user.id);
        
        if (existingProfile) {
          console.log('Profile already exists:', existingProfile);
          setProfileCreated(true);
        } else {
          console.log('Creating new profile for user:', {
            userId: user.id,
            email: email,
            firstName: user.firstName || '',
            lastName: user.lastName || ''
          });

          const newProfile = await userProfileService.createUserProfile(
            user.id,
            email,
            user.firstName || '',
            user.lastName || ''
          );

          if (newProfile) {
            console.log('Profile created successfully:', newProfile);
            setProfileCreated(true);
            
            // Show welcome message for new users (created in last 5 minutes)
            if (user.createdAt) {
              const userCreatedAt = new Date(user.createdAt);
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              
              if (userCreatedAt > fiveMinutesAgo) {
                toast({
                  title: "🎉 Welcome to TradeLayout!",
                  description: "Your profile has been set up successfully. Start building your trading strategies now!",
                  duration: 6000,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in auto profile creation:', error);
        // Don't show error toast to avoid spamming users
      } finally {
        setIsCreating(false);
      }
    };

    createProfileIfNeeded();
  }, [isLoading, user?.id, user?.emailAddresses, user?.firstName, user?.lastName, user?.createdAt, profileCreated, isCreating]);

  return { profileCreated, isCreating };
};
