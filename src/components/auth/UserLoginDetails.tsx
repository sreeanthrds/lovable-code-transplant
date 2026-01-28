
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, LogIn, Calendar, Phone, Mail, User, Save, Plus, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useUser } from '@clerk/clerk-react';
import { userProfileService, UserProfile } from '@/lib/supabase/services/user-profile-service';
import { toast } from '@/hooks/use-toast';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const UserLoginDetails: React.FC = () => {
  const { user: appUser } = useClerkUser();
  const { user: clerkUser } = useUser();
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

  // Phone verification states
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerificationId, setPhoneVerificationId] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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
  }, [appUser?.id]);

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

  // Send OTP to phone number using Clerk
  const handleSendPhoneOtp = async () => {
    if (!clerkUser || !pendingPhoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(pendingPhoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX).",
        variant: "destructive"
      });
      return;
    }

    setSendingOtp(true);
    try {
      // Create a phone number in Clerk and prepare verification
      const phoneNumber = await clerkUser.createPhoneNumber({
        phoneNumber: pendingPhoneNumber.replace(/\s/g, ''),
      });

      // Send the verification code
      await phoneNumber.prepareVerification();
      
      setPhoneVerificationId(phoneNumber.id);
      setIsVerifyingPhone(true);
      
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${pendingPhoneNumber}.`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Clerk errors
      if (error?.errors?.[0]?.code === 'form_identifier_exists') {
        toast({
          title: "Phone number already registered",
          description: "This phone number is already associated with another account.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error sending OTP",
          description: error?.errors?.[0]?.message || "Could not send verification code. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP and update phone number
  const handleVerifyPhoneOtp = async () => {
    if (!clerkUser || !phoneVerificationId || !otpCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive"
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      // Find the phone number and attempt verification
      const phoneNumber = clerkUser.phoneNumbers.find(p => p.id === phoneVerificationId);
      
      if (!phoneNumber) {
        throw new Error("Phone number not found");
      }

      await phoneNumber.attemptVerification({ code: otpCode });

      // Update the profile with verified phone number
      if (appUser?.id) {
        const updatedProfile = await userProfileService.updateUserProfile(appUser.id, {
          ...formData,
          phone_number: pendingPhoneNumber,
        });

        if (updatedProfile) {
          setProfile(updatedProfile);
          setFormData(prev => ({ ...prev, phone_number: pendingPhoneNumber }));
        }
      }

      // Reset verification states
      setIsVerifyingPhone(false);
      setPendingPhoneNumber('');
      setOtpCode('');
      setPhoneVerificationId(null);
      setIsEditing(false);

      toast({
        title: "Phone verified",
        description: "Your phone number has been verified and saved successfully.",
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error?.errors?.[0]?.code === 'form_code_incorrect') {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Verification failed",
          description: error?.errors?.[0]?.message || "Could not verify the code. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Cancel phone verification
  const handleCancelPhoneVerification = async () => {
    // If we created a phone number but didn't verify it, we should clean it up
    if (clerkUser && phoneVerificationId) {
      try {
        const phoneNumber = clerkUser.phoneNumbers.find(p => p.id === phoneVerificationId);
        if (phoneNumber) {
          await phoneNumber.destroy();
        }
      } catch (error) {
        console.error('Error cleaning up unverified phone:', error);
      }
    }

    setIsVerifyingPhone(false);
    setPendingPhoneNumber('');
    setOtpCode('');
    setPhoneVerificationId(null);
  };

  const handleSave = async () => {
    if (!appUser?.id) return;

    // Check if phone number is being changed
    const originalPhone = profile?.phone_number || '';
    const newPhone = formData.phone_number;

    if (newPhone && newPhone !== originalPhone) {
      // Phone number changed - need OTP verification
      setPendingPhoneNumber(newPhone);
      return; // Don't save yet, show OTP input
    }

    // No phone change, save other fields directly
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
      phone_number: profile?.phone_number || '',
    });
    setPendingPhoneNumber('');
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
              {profile && !isVerifyingPhone && (
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
          ) : isVerifyingPhone ? (
            // Phone OTP Verification UI
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <ShieldCheck className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-lg font-medium text-foreground">Verify Your Phone Number</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to {pendingPhoneNumber}
                </p>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancelPhoneVerification}
                  className="flex-1"
                  disabled={verifyingOtp}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerifyPhoneOtp}
                  disabled={otpCode.length !== 6 || verifyingOtp}
                  className="flex-1"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the code?{' '}
                <button 
                  onClick={handleSendPhoneOtp}
                  disabled={sendingOtp}
                  className="text-primary hover:underline"
                >
                  {sendingOtp ? 'Sending...' : 'Resend'}
                </button>
              </p>
            </div>
          ) : pendingPhoneNumber ? (
            // Pending phone verification - show send OTP button
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm text-warning">
                  <strong>Phone verification required:</strong> To update your phone number to {pendingPhoneNumber}, we need to verify it first.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPendingPhoneNumber('')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendPhoneOtp}
                  disabled={sendingOtp}
                  className="flex-1"
                >
                  {sendingOtp ? 'Sending OTP...' : 'Send Verification Code'}
                </Button>
              </div>
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
                <Label htmlFor="phone_number" className="text-foreground">
                  Phone Number
                  <span className="text-xs text-muted-foreground ml-2">(with country code, e.g., +91...)</span>
                </Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+91XXXXXXXXXX"
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
                <span className="text-sm text-muted-foreground">{profile?.email || appUser?.emailAddresses?.[0]?.emailAddress || 'Not available'}</span>
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
