
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, LogIn, Calendar, Phone, Mail, User, Save, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useClerkUser } from '@/hooks/useClerkUser';
import { userProfileService, UserProfile } from '@/lib/supabase/services/user-profile-service';
import { toast } from '@/hooks/use-toast';

const UserLoginDetails: React.FC = () => {
  const { user } = useClerkUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const existingProfile = await userProfileService.getUserProfile(user.id);
        
        if (existingProfile) {
          console.log('Found existing profile:', existingProfile);
          setProfile(existingProfile);
          setFormData({
            first_name: existingProfile.first_name || '',
            last_name: existingProfile.last_name || '',
            phone_number: existingProfile.phone_number || '',
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
  }, [user?.id]);

  const handleManualCreateProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Error creating profile",
        description: "User information not available. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
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
        user.id,
        email,
        user.firstName || '',
        user.lastName || ''
      );

      if (newProfile) {
        setProfile(newProfile);
        setFormData({
          first_name: newProfile.first_name || '',
          last_name: newProfile.last_name || '',
          phone_number: newProfile.phone_number || '',
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

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const updatedProfile = await userProfileService.updateUserProfile(user.id, formData);

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
      phone_number: profile?.phone_number || '',
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
              <div>
                <Label htmlFor="phone_number" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Enter phone number"
                  type="tel"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
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
                <span className="text-sm text-muted-foreground">{profile?.email || user?.emailAddresses[0]?.emailAddress || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Phone:</span>
                <span className="text-sm text-muted-foreground">{profile?.phone_number || 'Not provided'}</span>
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
