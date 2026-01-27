import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeSwitch?: (mode: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Welcome back! Sign in to access your account.' 
              : 'Create an account to start building trading strategies.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {mode === 'signin' ? (
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/80'
                }
              }}
              afterSignInUrl="/app/strategies"
              signUpUrl="#"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/80'
                }
              }}
              afterSignUpUrl="/app/strategies"
              signInUrl="#"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;