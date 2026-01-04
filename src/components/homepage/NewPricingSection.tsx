import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { initiatePayment } from '@/lib/services/payment-service';
import { toast } from '@/hooks/use-toast';
import { PlanType, BillingCycle } from '@/types/billing';
import AuthModal from '../auth/AuthModal';

const NewPricingSection = () => {
  const [showYearly, setShowYearly] = useState(false);
  const { isAuthenticated } = useAppAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handlePayment = async (planType: PlanType, billingCycle: BillingCycle) => {
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

    // Free plan - just navigate
    if (planType === 'FREE') {
      navigate('/app/strategies');
      return;
    }

    setProcessingPlan(`${planType}-${billingCycle}`);
    
    try {
      await initiatePayment(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        user.fullName || user.firstName || 'User',
        planType,
        billingCycle,
        () => {
          toast({
            title: "Payment Successful!",
            description: `Your ${planType} plan has been activated.`,
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
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      name: 'FREE',
      planType: 'FREE' as PlanType,
      price: '₹0',
      period: '/month',
      description: 'Get started with the basics',
      features: [
        '2 strategies backtested per day',
        '14 total backtests per month',
        'Strategy builder access',
        'Community support'
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'LAUNCH OFFER',
      planType: 'LAUNCH' as PlanType,
      price: '₹500',
      period: 'for 2 months',
      badge: 'Early Adopter Access',
      description: "We're early. You're early. Let's grow together.",
      features: [
        'Unlimited strategies',
        'Full backtest access',
        'Paper trading',
        'Priority support'
      ],
      note: 'Your ₹500 adjusts when you upgrade to Pro',
      cta: 'Claim Offer',
      highlighted: true,
    },
    {
      name: 'PRO',
      planType: 'PRO' as PlanType,
      isPro: true,
    },
  ];

  const proMonthly = {
    price: '₹2,999',
    period: '/month',
    description: 'Full power for serious traders',
    features: [
      '100 backtests per month (no daily cap)',
      '2 strategies paper trading per day',
      '50 strategies live trading per day',
      'Advanced analytics',
      'Priority support',
      'API access'
    ],
    cta: 'Get Pro Monthly',
  };

  const proYearly = {
    price: '₹29,999',
    period: '/year',
    description: 'Best value for committed traders',
    features: [
      '100 backtests per month (refreshes monthly)',
      '2 strategies paper trading per day',
      '50 strategies live trading per day',
      'Advanced analytics',
      'Priority support',
      'API access'
    ],
    cta: 'Get Pro Yearly',
  };

  const currentPro = showYearly ? proYearly : proMonthly;

  return (
    <section id="pricing" className="section-padding bg-card/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Start free, upgrade when you're ready</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-accent/10 to-accent/5 border-2 border-accent/50' 
                  : 'glass-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              {/* Pro card with toggle */}
              {plan.isPro ? (
                <>
                  {showYearly && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      2 Months Free
                    </div>
                  )}
                  
                  <div className="text-center mb-4 pt-2">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{plan.name}</h3>
                    
                    {/* Toggle inside the card */}
                    <div className="flex items-center justify-center gap-2 mb-4 p-1.5 bg-muted/50 rounded-full">
                      <button 
                        onClick={() => setShowYearly(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                          !showYearly 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Monthly
                      </button>
                      <button 
                        onClick={() => setShowYearly(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                          showYearly 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Yearly
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold whitespace-nowrap">
                          2 free months
                        </span>
                      </button>
                    </div>

                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">{currentPro.price}</span>
                      <span className="text-muted-foreground text-sm">{currentPro.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{currentPro.description}</p>
                    {showYearly && (
                      <p className="text-xs text-success mt-1">Save ₹5,989 annually</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {currentPro.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePayment('PRO', showYearly ? 'yearly' : 'monthly')}
                    disabled={processingPlan === `PRO-${showYearly ? 'yearly' : 'monthly'}`}
                    className="block w-full text-center py-3 rounded-xl font-medium transition-all btn-ghost disabled:opacity-50"
                  >
                    {processingPlan === `PRO-${showYearly ? 'yearly' : 'monthly'}` ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      currentPro.cta
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features?.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.note && (
                    <p className="text-xs text-muted-foreground text-center mb-4 italic">{plan.note}</p>
                  )}

                  <button
                    onClick={() => handlePayment(plan.planType, 'monthly')}
                    disabled={processingPlan === `${plan.planType}-monthly`}
                    className={`block w-full text-center py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                      plan.highlighted ? 'btn-accent-glow' : 'btn-ghost'
                    }`}
                  >
                    {processingPlan === `${plan.planType}-monthly` ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
        onModeSwitch={(mode) => setAuthModal({ isOpen: true, mode })}
      />
    </section>
  );
};

export default NewPricingSection;
