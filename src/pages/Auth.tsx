import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAppAuth } from '@/contexts/AuthContext';
import { 
  signInWithPhoneOtp, 
  signInWithEmailOtp, 
  signInWithGoogle,
  verifyPhoneOtp,
  verifyEmailOtp
} from '@/lib/supabase/auth';
import { Phone, Mail, Loader2, ArrowLeft, Chrome } from 'lucide-react';
import Logo from '@/components/ui/logo';

type AuthStep = 'input' | 'verify';
type AuthMethod = 'phone' | 'email';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoaded } = useAppAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<AuthStep>('input');
  const [loading, setLoading] = useState(false);

  // Input states
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      navigate('/app/strategies');
    }
  }, [isAuthenticated, isLoaded, navigate]);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      if (authMethod === 'phone') {
        const result = await signInWithPhoneOtp(phone);
        if (result.success) {
          setStep('verify');
          toast({
            title: 'OTP Sent',
            description: 'Please check your phone for the verification code.',
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to send OTP',
            variant: 'destructive',
          });
        }
      } else {
        const result = await signInWithEmailOtp(email);
        if (result.success) {
          setStep('verify');
          toast({
            title: 'OTP Sent',
            description: 'Please check your email for the verification code.',
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to send OTP',
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const result = authMethod === 'phone' 
        ? await verifyPhoneOtp(phone, otp)
        : await verifyEmailOtp(email, otp);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'You have been signed in successfully!',
        });
        navigate('/app/strategies');
      } else {
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to sign in with Google',
          variant: 'destructive',
        });
      }
      // Note: On success, user will be redirected by OAuth flow
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtp('');
  };

  const handleTabChange = (value: string) => {
    setAuthMethod(value as AuthMethod);
    setStep('input');
    setOtp('');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Welcome to TradeLayout</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Section */}
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5 mr-2" />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OTP Login Tabs */}
          <Tabs value={authMethod} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4 mt-4">
              {step === 'input' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +91 for India)
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length < 10}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="phone-otp">Verification Code</Label>
                    <Input
                      id="phone-otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to {phone}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Verify & Sign In
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              {step === 'input' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={loading || !email.includes('@')}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="email-otp">Verification Code</Label>
                    <Input
                      id="email-otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to {email}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Verify & Sign In
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
