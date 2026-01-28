
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Calendar, Phone, Mail, User, Save, Plus, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useClerk, useUser } from '@clerk/clerk-react';
import { userProfileService, UserProfile } from '@/lib/supabase/services/user-profile-service';
import { toast } from '@/hooks/use-toast';

const UserLoginDetails: React.FC = () => {
  const { user: appUser } = useClerkUser();
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
  });

  // Get the verified phone number from Clerk
  const getClerkPhoneNumber = useCallback(() => {
    if (!clerkUser?.phoneNumbers?.length) return null;
    // Get the primary or first verified phone number
    const primaryPhone = clerkUser.phoneNumbers.find(p => p.id === clerkUser.primaryPhoneNumberId);
    const verifiedPhone = primaryPhone || clerkUser.phoneNumbers.find(p => p.verification?.status === 'verified');
    return verifiedPhone?.phoneNumber || null;
  }, [clerkUser]);

  // Sync phone number from Clerk to user_profiles
  const syncPhoneNumber = useCallback(async () => {
    if (!appUser?.id || !profile) return;

    const clerkPhone = getClerkPhoneNumber();
    const profilePhone = profile.phone_number || null;

    // If Clerk phone differs from profile phone, update the profile
    if (clerkPhone !== profilePhone) {
      console.log('Syncing phone number from Clerk to profile:', clerkPhone);
      try {
        const updatedProfile = await userProfileService.updateUserProfile(appUser.id, {
          phone_number: clerkPhone || undefined,
        });
        if (updatedProfile) {
          setProfile(updatedProfile);
          console.log('Phone number synced successfully');
        }
      } catch (error) {
        console.error('Error syncing phone number:', error);
      }
    }
  }, [appUser?.id, profile, getClerkPhoneNumber]);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!appUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const existingProfile = await userProfileService.getUserProfile(appUser.id);
        
        if (existingProfile) {
          console.log('Found existing profile:', existingProfile);
          setProfile(existingProfile);
          setFormData({
            first_name: existingProfile.first_name || '',
            last_name: existingProfile.last_name || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [appUser?.id]);

  // Sync phone number when profile is loaded or Clerk user changes
  useEffect(() => {
    if (profile && clerkUser) {
      syncPhoneNumber();
    }
  }, [profile, clerkUser, syncPhoneNumber]);

  const handleManualCreateProfile = async () => {
    if (!appUser?.id) {
      toast({
        title: "Error creating profile",
        description: "User information not available. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    const email = appUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      toast({
        title: "Error creating profile",
        description: "Email address not available. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const newProfile = await userProfileService.createUserProfile(
        appUser.id,
        email,
        appUser.firstName || '',
        appUser.lastName || ''
      );

      if (newProfile) {
        setProfile(newProfile);
        setFormData({
          first_name: newProfile.first_name || '',
          last_name: newProfile.last_name || '',
        });
        toast({
          title: "Profile created",
          description: "Your profile has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  // Open Clerk's profile management for phone verification
  // The useEffect with clerkUser dependency will sync phone automatically
  // when Clerk refreshes the user object after profile changes
  const handleManagePhone = () => {
    openUserProfile();
  };

  const handleSave = async () => {
    if (!appUser?.id) return;

    setSaving(true);
    try {
      const updatedProfile = await userProfileService.updateUserProfile(appUser.id, formData);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Could not save your profile information.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset form data to original profile values when cancelling
  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    });
    setIsEditing(false);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return 'Invalid date';
    }
  };

  // Get phone number - prioritize Clerk (source of truth), fallback to profile
  const getDisplayPhoneNumber = () => {
    const clerkPhone = getClerkPhoneNumber();
    if (clerkPhone) return clerkPhone;
    return profile?.phone_number || null;
  };

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <LogIn className="w-5 h-5 text-primary" />
            Loading Profile...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading your profile information...</p>
        </CardContent>
      </Card>
    );
  }

  const phoneNumber = getDisplayPhoneNumber();

  return (
    <div className="space-y-4">

      {/* Profile Information Card */}
      <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <div className="flex gap-2">
              {!profile && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleManualCreateProfile}
                  disabled={creating}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {creating ? 'Creating...' : 'Create Profile'}
                </Button>
              )}
              {profile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  className="border-border/50 hover:border-primary/50"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profile ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2 text-foreground">No Profile Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your profile should be created automatically. If it wasn't, you can create it manually.
              </p>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-foreground">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-foreground">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              {/* Phone Number - Managed via Clerk */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Phone Number</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleManagePhone}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Manage
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Phone number changes require verification for security.
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Name:</span>
                <span className="text-sm text-muted-foreground">
                  {profile?.first_name || profile?.last_name 
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : 'Not provided'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Email:</span>
                <span className="text-sm text-muted-foreground">{profile?.email || appUser?.emailAddresses?.[0]?.emailAddress || 'Not available'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Phone:</span>
                  <span className="text-sm text-muted-foreground">{phoneNumber || 'Not provided'}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleManagePhone}
                  className="text-primary hover:text-primary/80 h-auto p-0"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Information Card */}
      <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <LogIn className="w-5 h-5 text-primary" />
            Login Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Session Status */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-foreground">Current Session</h4>
            <Badge className="bg-success/20 text-success border-success/30">
              <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
              Active Session
            </Badge>
          </div>

          {/* Account Creation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Member Since</span>
            </div>
            <div className="pl-6">
              <p className="text-sm text-foreground">{getTimeAgo(profile?.created_at)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(profile?.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLoginDetails;
