import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/contexts/AuthContext';
import { initiatePayment } from '@/lib/services/payment-service';
import { toast } from '@/hooks/use-toast';
import AuthModal from '../auth/AuthModal';

const FinalCTA = () => {
  const { isAuthenticated, user } = useAppAuth();
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleLaunchOffer = async () => {
    if (!isAuthenticated) {
      setAuthModal({ isOpen: true, mode: 'signup' });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      await initiatePayment(
        user?.id || '',
        user?.email || '',
        user?.fullName || user?.firstName || 'User',
        'LAUNCH',
        'monthly',
        () => {
          toast({
            title: "Payment Successful!",
            description: "Welcome to TradeLayout! Your launch offer has been activated.",
          });
          navigate('/app/strategies');
        },
        (error) => {
          toast({
            title: "Payment Failed",
            description: error,
            variant: "destructive"
          });
        }
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] bg-primary/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Build Trading Logic That Actually Works?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join traders who are encoding their strategies visually.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app/strategies" className="btn-primary-glow inline-flex items-center justify-center">
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button 
                onClick={handleLaunchOffer}
                disabled={isProcessingPayment}
                className="btn-accent-glow inline-flex items-center justify-center disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Claim ₹500 Launch Offer'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
        onModeSwitch={(mode) => setAuthModal({ isOpen: true, mode })}
      />
    </>
  );
};

export default FinalCTA;
